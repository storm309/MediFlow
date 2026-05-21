<?php

namespace App\Http\Controllers;

use App\Models\Alert;
use App\Repositories\PatientRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AlertController extends Controller
{
    public function __construct(protected PatientRepository $patientRepo) {}

    /**
     * GET /alerts — Paginated alerts with filters.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage   = min((int) $request->get('per_page', 20), 100);
        $severity  = $request->get('severity');
        $status    = $request->get('status');
        $patientId = $request->get('patient_id');

        $query = Alert::with(['patient.user:_id,name', 'doctor:_id,name,specialization']);

        // Doctors see alerts for their patients only
        if ($request->user()->isDoctor()) {
            $patientIds = $this->patientRepo
                ->findByDoctorId((string) $request->user()->_id)
                ->pluck('_id')
                ->map(fn ($id) => (string) $id);
            $query->whereIn('patient_id', $patientIds);
        }

        if ($patientId) $query->where('patient_id', $patientId);
        if ($severity)  $query->where('severity', $severity);
        if ($status)    $query->where('status', $status);

        $alerts = $query->latest()->paginate($perPage);

        return response()->json(['success' => true, 'data' => $alerts]);
    }

    /**
     * GET /alerts/{id} — Single alert detail.
     */
    public function show(string $id): JsonResponse
    {
        $alert = Alert::with(['patient.user:_id,name,email', 'doctor:_id,name', 'metric'])->findOrFail($id);
        return response()->json(['success' => true, 'data' => $alert]);
    }

    /**
     * PATCH /alerts/{id}/status — Update alert status (read/resolved/dismissed).
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:read,resolved,dismissed',
            'notes'  => 'sometimes|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $alert = Alert::findOrFail($id);
        $updateData = ['status' => $request->status];

        if ($request->status === 'resolved') {
            $updateData['resolved_at'] = now();
            $updateData['resolved_by'] = (string) $request->user()->_id;
        }

        if ($request->notes) {
            $updateData['notes'] = $request->notes;
        }

        $alert->update($updateData);

        return response()->json(['success' => true, 'data' => $alert, 'message' => 'Alert updated.']);
    }

    /**
     * GET /alerts/stats — Alert statistics for dashboard.
     */
    public function stats(Request $request): JsonResponse
    {
        // Build base match filter
        $matchFilter = [];

        if ($request->user()->isDoctor()) {
            $patientIds = $this->patientRepo
                ->findByDoctorId((string) $request->user()->_id)
                ->pluck('_id')
                ->map(fn ($id) => (string) $id)
                ->values()
                ->toArray();
            $matchFilter = ['patient_id' => ['$in' => $patientIds]];
        }

        // Single aggregation with $facet instead of 5 separate queries
        $todayStart = new \MongoDB\BSON\UTCDateTime(now()->startOfDay()->getTimestamp() * 1000);
        $pipeline = [];
        if (!empty($matchFilter)) {
            $pipeline[] = ['$match' => $matchFilter];
        }
        $pipeline[] = ['$facet' => [
                'total'    => [['$count' => 'count']],
                'unread'   => [['$match' => ['status' => 'unread']], ['$count' => 'count']],
                'critical' => [['$match' => ['severity' => ['$in' => ['critical', 'emergency']]]], ['$count' => 'count']],
                'today'    => [['$match' => ['created_at' => ['$gte' => $todayStart]]], ['$count' => 'count']],
                'resolved' => [['$match' => ['status' => 'resolved']], ['$count' => 'count']],
        ]];

        $cursor = Alert::raw(fn ($col) => $col->aggregate($pipeline));
        $row    = iterator_to_array($cursor)[0] ?? [];

        $stats = [
            'total'    => $row['total'][0]['count']    ?? 0,
            'unread'   => $row['unread'][0]['count']   ?? 0,
            'critical' => $row['critical'][0]['count'] ?? 0,
            'today'    => $row['today'][0]['count']    ?? 0,
            'resolved' => $row['resolved'][0]['count'] ?? 0,
        ];

        return response()->json(['success' => true, 'data' => $stats]);
    }
}
