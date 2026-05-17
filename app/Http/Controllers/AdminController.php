<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Patient;
use App\Models\Alert;
use App\Models\ActivityLog;
use App\Models\Appointment;
use App\Repositories\UserRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    public function __construct(protected UserRepository $userRepo) {}

    /**
     * GET /admin/dashboard — Dashboard summary statistics.
     */
    public function dashboard(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => [
                'total_patients'   => User::where('role', 'patient')->count(),
                'total_doctors'    => User::where('role', 'doctor')->count(),
                'total_alerts'     => Alert::count(),
                'unread_alerts'    => Alert::where('status', 'unread')->count(),
                'critical_alerts'  => Alert::whereIn('severity', ['critical', 'emergency'])->count(),
                'today_alerts'     => Alert::whereDate('created_at', today())->count(),
                'appointments_today' => Appointment::whereDate('scheduled_at', today())->count(),
                'critical_patients'  => Patient::where('is_critical', true)->count(),
                'new_users_today'    => User::whereDate('created_at', today())->count(),
            ],
        ]);
    }

    /**
     * GET /admin/users — Manage all users.
     */
    public function users(Request $request): JsonResponse
    {
        $perPage = min((int) $request->get('per_page', 20), 100);
        $role    = $request->get('role');
        $search  = $request->get('search');

        if ($search && $role) {
            $users = $this->userRepo->searchByRole($role, $search, $perPage);
        } elseif ($role) {
            $users = $this->userRepo->paginateByRole($role, $perPage);
        } else {
            $users = User::when($search, fn ($q) =>
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
            )->latest()->paginate($perPage);
        }

        return response()->json(['success' => true, 'data' => $users]);
    }

    /**
     * PUT /admin/users/{id} — Update any user.
     */
    public function updateUser(Request $request, string $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name'      => 'sometimes|string|max:255',
            'phone'     => 'sometimes|string|max:20',
            'is_active' => 'sometimes|boolean',
            'role'      => 'sometimes|in:admin,doctor,patient',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = User::findOrFail($id);
        $user->update($validator->validated());

        return response()->json(['success' => true, 'data' => $user]);
    }

    /**
     * DELETE /admin/users/{id} — Delete user.
     */
    public function deleteUser(string $id): JsonResponse
    {
        User::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'User deleted.']);
    }

    /**
     * GET /admin/activity-logs — System activity logs.
     */
    public function activityLogs(Request $request): JsonResponse
    {
        $perPage = min((int) $request->get('per_page', 20), 100);
        $logs    = ActivityLog::with('user:_id,name,email,role')
            ->latest()
            ->paginate($perPage);

        return response()->json(['success' => true, 'data' => $logs]);
    }

    /**
     * GET /admin/analytics — Platform-wide analytics.
     */
    public function analytics(): JsonResponse
    {
        $now = now();

        $alertsByDay = Alert::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', $now->copy()->subDays(7))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => [
                'alerts_by_severity' => [
                    'emergency' => Alert::where('severity', 'emergency')->count(),
                    'critical'  => Alert::where('severity', 'critical')->count(),
                    'warning'   => Alert::where('severity', 'warning')->count(),
                    'info'      => Alert::where('severity', 'info')->count(),
                ],
                'alerts_last_7_days' => $alertsByDay,
                'users_by_role' => [
                    'admin'   => User::where('role', 'admin')->count(),
                    'doctor'  => User::where('role', 'doctor')->count(),
                    'patient' => User::where('role', 'patient')->count(),
                ],
                'critical_patients' => Patient::where('is_critical', true)->with('user:_id,name')->get(),
            ],
        ]);
    }

    /**
     * POST /admin/assign-doctor — Assign or update doctor for a patient.
     */
    public function assignDoctor(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|string',
            'doctor_id'  => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $patient = Patient::findOrFail($request->patient_id);
        $doctor  = User::where('_id', $request->doctor_id)->where('role', 'doctor')->firstOrFail();

        $patient->update(['doctor_id' => (string) $doctor->_id]);

        // Notify doctor and patient
        $this->createNotification($patient->user_id, 'Patient assigned to you', 'system', "Dr. {$doctor->name} has been assigned to your care.");
        $this->createNotification($doctor->_id, 'New patient assigned', 'system', "Patient {$patient->user->name} has been assigned to you.");

        return response()->json([
            'success' => true,
            'message' => "Dr. {$doctor->name} assigned to patient successfully.",
            'data'    => $patient->load('user', 'doctor'),
        ]);
    }

    /**
     * POST /admin/unassign-doctor — Remove doctor from patient.
     */
    public function unassignDoctor(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $patient = Patient::findOrFail($request->patient_id);
        $doctorName = $patient->doctor?->name ?? 'Doctor';

        $patient->update(['doctor_id' => null]);

        $this->createNotification($patient->user_id, 'Doctor unassigned', 'system', "Your doctor {$doctorName} has been unassigned.");

        return response()->json(['success' => true, 'message' => 'Doctor unassigned successfully.', 'data' => $patient]);
    }

    /**
     * GET /admin/doctors — Get all doctors for assignment.
     */
    public function getDoctors(): JsonResponse
    {
        $doctors = User::where('role', 'doctor')->select('_id', 'name', 'email', 'phone', 'is_active')->get();
        return response()->json(['success' => true, 'data' => $doctors]);
    }

    /**
     * Helper: Create notification.
     */
    private function createNotification(string $userId, string $title, string $type, string $message): void
    {
        try {
            \App\Models\Notification::create([
                'user_id'    => $userId,
                'type'       => $type,
                'title'      => $title,
                'message'    => $message,
                'is_read'    => false,
            ]);
        } catch (\Exception $e) {
            // Log silently if notification fails
        }
    }
}
