<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AppointmentController extends Controller
{
    /**
     * GET /appointments — Paginated list for current user's role.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage   = min((int) $request->get('per_page', 100), 200);
        $status    = $request->get('status');
        $patientId = $request->get('patient_id');

        $query = Appointment::with([
            'patient.user:_id,name,email',
            'doctor:_id,name,email',
        ]);

        $user = $request->user();
        if ($user->isDoctor()) {
            $query->where('doctor_id', (string) $user->_id);
        } elseif ($user->isPatient()) {
            $patient = $user->patientProfile;
            if ($patient) $query->where('patient_id', (string) $patient->_id);
        }

        if ($status)    $query->where('status', $status);
        if ($patientId) $query->where('patient_id', $patientId);

        $appointments = $query->orderBy('scheduled_at', 'asc')->paginate($perPage);

        return response()->json(['success' => true, 'data' => $appointments]);
    }

    /**
     * POST /appointments — Create appointment.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'patient_id'   => 'required|string',
            'doctor_id'    => 'required|string',
            'title'        => 'required|string|max:255',
            'description'  => 'sometimes|string',
            'scheduled_at' => 'required|date|after:now',
            'duration'     => 'sometimes|integer|min:5|max:480',
            'type'         => 'sometimes|in:consultation,follow_up,emergency,routine',
            'location'     => 'sometimes|string',
            'meeting_link' => 'sometimes|url',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        // Validate the doctor exists and is verified
        $doctor = \App\Models\User::where('_id', $request->doctor_id)
            ->where('role', 'doctor')
            ->where('is_verified', true)
            ->first();
        if (!$doctor) {
            return response()->json(['success' => false, 'message' => 'Invalid or unverified doctor.'], 422);
        }

        // Validate patient exists
        $patientRec = \App\Models\Patient::find($request->patient_id);
        if (!$patientRec) {
            return response()->json(['success' => false, 'message' => 'Patient not found.'], 404);
        }

        // Patients can only create appointments for themselves
        if ($user->isPatient()) {
            $patient = $user->patientProfile;
            if (!$patient || (string) $patient->_id !== $request->patient_id) {
                return response()->json(['success' => false, 'message' => 'You can only book appointments for yourself.'], 403);
            }
        }

        // Doctors can only create appointments for their own patients
        if ($user->isDoctor() && (string) $patientRec->doctor_id !== (string) $user->_id) {
            return response()->json(['success' => false, 'message' => 'You are not assigned to this patient.'], 403);
        }

        $appointment = Appointment::create($validator->validated());

        // Notify patient and doctor (load relationships first)
        $appointment->load('patient');
        $this->sendNotifications($appointment);

        return response()->json([
            'success' => true,
            'message' => 'Appointment scheduled.',
            'data'    => $appointment->load(['patient.user:_id,name', 'doctor:_id,name']),
        ], 201);
    }

    /**
     * PATCH /appointments/{id} — Update appointment.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title'        => 'sometimes|string|max:255',
            'description'  => 'sometimes|string',
            'scheduled_at' => 'sometimes|date',
            'duration'     => 'sometimes|integer|min:5',
            'status'       => 'sometimes|in:scheduled,confirmed,cancelled,completed,no_show',
            'notes'        => 'sometimes|string',
            'cancelled_reason' => 'sometimes|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $appointment = Appointment::findOrFail($id);
        $user = $request->user();

        // Doctors can only update their own appointments
        if ($user->isDoctor() && (string) $appointment->doctor_id !== (string) $user->_id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }
        // Patients can only cancel their own appointments
        if ($user->isPatient()) {
            $patient = $user->patientProfile;
            if (!$patient || (string) $appointment->patient_id !== (string) $patient->_id) {
                return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
            }
        }

        $data = $validator->validated();

        // Block illegal transitions: a completed appointment shouldn't be re-cancelled
        if (($data['status'] ?? null) === 'cancelled') {
            if ($appointment->status === 'completed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot cancel an already completed appointment.',
                ], 422);
            }
            $data['cancelled_at'] = now();
        }
        if (($data['status'] ?? null) === 'completed') {
            $data['completed_at'] = now();
        }

        $appointment->update($data);

        return response()->json(['success' => true, 'data' => $appointment]);
    }

    /**
     * DELETE /appointments/{id} — Cancel/delete appointment.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $appointment = Appointment::findOrFail($id);
        $user = $request->user();

        // Doctors can only delete their own appointments
        if ($user->isDoctor() && (string) $appointment->doctor_id !== (string) $user->_id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }
        // Patients can only delete their own appointments
        if ($user->isPatient()) {
            $patient = $user->patientProfile;
            if (!$patient || (string) $appointment->patient_id !== (string) $patient->_id) {
                return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
            }
        }

        $appointment->delete();
        return response()->json(['success' => true, 'message' => 'Appointment deleted.']);
    }

    private function sendNotifications(Appointment $appointment): void
    {
        // Notify patient — skip if patient or user_id is missing
        $patientUserId = $appointment->patient?->user_id ?? null;
        if ($patientUserId) {
            Notification::create([
                'user_id' => $patientUserId,
                'title'   => 'Appointment Scheduled',
                'message' => "Your appointment has been scheduled for {$appointment->scheduled_at->format('M d, Y H:i')}.",
                'type'    => 'appointment',
                'data'    => ['appointment_id' => (string) $appointment->_id],
                'is_read' => false,
            ]);
        }

        // Notify doctor
        if ($appointment->doctor_id) {
            Notification::create([
                'user_id' => $appointment->doctor_id,
                'title'   => 'New Appointment',
                'message' => "New appointment scheduled for {$appointment->scheduled_at->format('M d, Y H:i')}.",
                'type'    => 'appointment',
                'data'    => ['appointment_id' => (string) $appointment->_id],
                'is_read' => false,
            ]);
        }
    }
}
