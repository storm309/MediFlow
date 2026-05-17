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

        $appointment = Appointment::create($validator->validated());

        // Notify patient and doctor
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
        $data = $validator->validated();

        if (($data['status'] ?? '') === 'cancelled') {
            $data['cancelled_at'] = now();
        }
        if (($data['status'] ?? '') === 'completed') {
            $data['completed_at'] = now();
        }

        $appointment->update($data);

        return response()->json(['success' => true, 'data' => $appointment]);
    }

    /**
     * DELETE /appointments/{id} — Cancel/delete appointment.
     */
    public function destroy(string $id): JsonResponse
    {
        Appointment::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Appointment deleted.']);
    }

    private function sendNotifications(Appointment $appointment): void
    {
        // Notify patient
        Notification::create([
            'user_id' => $appointment->patient->user_id ?? null,
            'title'   => 'Appointment Scheduled',
            'message' => "Your appointment has been scheduled for {$appointment->scheduled_at->format('M d, Y H:i')}.",
            'type'    => 'appointment',
            'data'    => ['appointment_id' => (string) $appointment->_id],
            'is_read' => false,
        ]);

        // Notify doctor
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
