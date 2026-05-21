<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Patient;
use App\Models\Alert;
use App\Models\ActivityLog;
use App\Models\Appointment;
use App\Helpers\PhoneHelper;
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
        // Aggregate user counts by role in one query
        $userCursor = User::raw(fn ($col) => $col->aggregate([
            ['$group' => ['_id' => '$role', 'count' => ['$sum' => 1]]],
        ]));
        $userCounts  = collect(iterator_to_array($userCursor))->pluck('count', '_id');
        $totalPatients = (int) ($userCounts['patient'] ?? 0);
        $totalDoctors  = (int) ($userCounts['doctor']  ?? 0);
        $totalAdmins   = (int) ($userCounts['admin']   ?? 0);

        // Aggregate alert stats in one query
        $todayStart  = new \MongoDB\BSON\UTCDateTime(now()->startOfDay()->getTimestamp() * 1000);
        $todayStartU = new \MongoDB\BSON\UTCDateTime(now()->startOfDay()->getTimestamp() * 1000);
        $alertCursor = Alert::raw(fn ($col) => $col->aggregate([
            ['$facet' => [
                'total'    => [['$count' => 'count']],
                'unread'   => [['$match' => ['status' => 'unread']], ['$count' => 'count']],
                'critical' => [['$match' => ['severity' => ['$in' => ['critical', 'emergency']]]], ['$count' => 'count']],
                'today'    => [['$match' => ['created_at' => ['$gte' => $todayStart]]], ['$count' => 'count']],
            ]],
        ]));
        $alertRow = iterator_to_array($alertCursor)[0] ?? [];

        // Remaining stats (smaller collections, fast)
        $criticalPatients  = Patient::where('is_critical', true)->count();
        $appointmentsToday = Appointment::whereDate('scheduled_at', today())->count();
        $newUsersToday     = User::whereDate('created_at', today())->count();

        return response()->json([
            'success' => true,
            'data'    => [
                'total_users'        => $totalPatients + $totalDoctors + $totalAdmins,
                'total_patients'     => $totalPatients,
                'total_doctors'      => $totalDoctors,
                'total_admins'       => $totalAdmins,
                'total_alerts'       => $alertRow['total'][0]['count']    ?? 0,
                'unread_alerts'      => $alertRow['unread'][0]['count']   ?? 0,
                'critical_alerts'    => $alertRow['critical'][0]['count'] ?? 0,
                'today_alerts'       => $alertRow['today'][0]['count']    ?? 0,
                'appointments_today' => $appointmentsToday,
                'critical_patients'  => $criticalPatients,
                'new_users_today'    => $newUsersToday,
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
            'phone'     => 'sometimes|string',
            'is_active' => 'sometimes|boolean',
            'role'      => 'sometimes|in:admin,doctor,patient',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $data = $validator->validated();

            // Format phone number with +91 prefix
            if (!empty($data['phone'])) {
                $data['phone'] = PhoneHelper::format($data['phone']);
                if ($data['phone'] === null) {
                    return response()->json([
                        'success' => false,
                        'errors' => ['phone' => ['Invalid phone number. Use Indian format (e.g., 9876543210 or +919876543210)']]
                    ], 422);
                }
            }

            $user = User::findOrFail($id);
            $user->update($data);

            return response()->json(['success' => true, 'data' => $user]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
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
        $perPage    = min((int) $request->get('per_page', 20), 100);
        $action     = $request->get('action');
        $entityType = $request->get('entity_type');
        $search     = $request->get('search');

        $logs = ActivityLog::with('user:_id,name,email,role')
            ->when($action,     fn ($q) => $q->where('action', $action))
            ->when($entityType, fn ($q) => $q->where('entity_type', $entityType))
            ->when($search,     fn ($q) => $q->where('description', 'like', "%{$search}%"))
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

        $sevenDaysAgo = new \MongoDB\BSON\UTCDateTime($now->copy()->subDays(7)->getTimestamp() * 1000);

        // All alert analytics in one aggregation
        $alertAnalyticsCursor = Alert::raw(fn ($col) => $col->aggregate([
            ['$facet' => [
                'by_severity'    => [
                    ['$group' => ['_id' => '$severity', 'count' => ['$sum' => 1]]],
                ],
                'last_7_days'    => [
                    ['$match' => ['created_at' => ['$gte' => $sevenDaysAgo]]],
                    ['$group' => [
                        '_id'   => ['$dateToString' => ['format' => '%Y-%m-%d', 'date' => '$created_at']],
                        'count' => ['$sum' => 1],
                    ]],
                    ['$sort'    => ['_id' => 1]],
                    ['$project' => ['date' => '$_id', 'count' => 1, '_id' => 0]],
                ],
            ]],
        ]));
        $alertAnalytics = iterator_to_array($alertAnalyticsCursor)[0] ?? [];
        $severityMap    = collect($alertAnalytics['by_severity'] ?? [])->pluck('count', '_id');

        // User counts by role in one aggregation
        $userRoleCursor = User::raw(fn ($col) => $col->aggregate([
            ['$group' => ['_id' => '$role', 'count' => ['$sum' => 1]]],
        ]));
        $userRoleMap = collect(iterator_to_array($userRoleCursor))->pluck('count', '_id');

        return response()->json([
            'success' => true,
            'data'    => [
                'alerts_by_severity' => [
                    'emergency' => (int) ($severityMap['emergency'] ?? 0),
                    'critical'  => (int) ($severityMap['critical']  ?? 0),
                    'warning'   => (int) ($severityMap['warning']   ?? 0),
                    'info'      => (int) ($severityMap['info']      ?? 0),
                ],
                'alerts_last_7_days' => array_values($alertAnalytics['last_7_days'] ?? []),
                'users_by_role' => [
                    'admin'   => (int) ($userRoleMap['admin']   ?? 0),
                    'doctor'  => (int) ($userRoleMap['doctor']  ?? 0),
                    'patient' => (int) ($userRoleMap['patient'] ?? 0),
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
        $doctors = User::where('role', 'doctor')
            ->where('is_active', true)
            ->select('_id', 'name', 'email', 'phone', 'specialization', 'verification_status')
            ->orderBy('name')
            ->get();
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

    /**
     * POST /admin/create-doctor — Create new doctor account (Admin only).
     */
    public function createDoctor(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name'           => 'required|string|max:255',
            'email'          => 'required|email|unique:mongodb.users,email',
            'password'       => 'required|string|min:8',
            'phone'          => 'sometimes|string',
            'medical_license' => 'required|string|max:50',
            'specialization' => 'required|string|max:100',
            'qualifications' => 'sometimes|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $data = $validator->validated();

            // Format phone number with +91 prefix
            if (!empty($data['phone'])) {
                $data['phone'] = PhoneHelper::format($data['phone']);
                if ($data['phone'] === null) {
                    return response()->json([
                        'success' => false,
                        'errors' => ['phone' => ['Invalid phone number. Use Indian format (e.g., 9876543210 or +919876543210)']]
                    ], 422);
                }
            }

            $doctor = User::create([
                'name'                => $data['name'],
                'email'               => $data['email'],
                'password'            => $data['password'],
                'phone'               => $data['phone'] ?? null,
                'role'                => 'doctor',
                'is_active'           => true,
                'is_verified'         => false,
                'verification_status' => 'pending',
                'medical_license'     => $data['medical_license'],
                'specialization'      => $data['specialization'],
                'qualifications'      => $data['qualifications'] ?? null,
            ]);

            // Send verification pending notification
            $this->createNotification($doctor->_id, 'Account Created - Pending Verification', 'system',
                'Your doctor account has been created by admin. Please wait for verification.');

            return response()->json([
                'success' => true,
                'message' => "Doctor account created. Verification status: pending",
                'data'    => $doctor,
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /admin/pending-doctors — Get all pending doctor verifications.
     */
    public function getPendingDoctors(): JsonResponse
    {
        $doctors = User::where('role', 'doctor')
            ->where('verification_status', 'pending')
            ->select('_id', 'name', 'email', 'phone', 'medical_license', 'specialization', 'qualifications', 'created_at')
            ->latest()
            ->get();

        return response()->json(['success' => true, 'data' => $doctors]);
    }

    /**
     * POST /admin/verify-doctor — Verify doctor credentials.
     */
    public function verifyDoctor(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'doctor_id' => 'required|string',
            'status'    => 'required|in:verified,rejected',
            'notes'     => 'sometimes|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $doctor = User::where('role', 'doctor')->findOrFail($request->doctor_id);

            if ($doctor->verification_status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => "Doctor is already {$doctor->verification_status}.",
                ], 422);
            }

            $doctor->update([
                'verification_status' => $request->status,
                'is_verified'         => $request->status === 'verified',
                'verification_notes'  => $request->notes ?? null,
                'verified_at'         => now(),
                'verified_by'         => (string)$request->user()->_id,
            ]);

            // Notify doctor
            if ($request->status === 'verified') {
                $message = 'Congratulations! Your doctor account has been verified and is now active.';
                $title = 'Account Verified ✅';
            } else {
                $message = "Your doctor account verification was rejected. Reason: " . ($request->notes ?? 'Not specified');
                $title = 'Verification Rejected';
            }

            $this->createNotification($doctor->_id, $title, 'system', $message);

            return response()->json([
                'success' => true,
                'message' => "Doctor {$request->status} successfully.",
                'data'    => $doctor,
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
