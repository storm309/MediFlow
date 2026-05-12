<?php

namespace App\Http\Controllers;

use App\Services\HealthMetricService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class HealthMetricController extends Controller
{
    public function __construct(protected HealthMetricService $metricService) {}

    /**
     * GET /patients/{patientId}/metrics — Paginated history.
     */
    public function index(Request $request, string $patientId): JsonResponse
    {
        $perPage = min((int) $request->get('per_page', 20), 100);
        $metrics = $this->metricService->getHistory($patientId, $perPage);
        return response()->json(['success' => true, 'data' => $metrics]);
    }

    /**
     * GET /patients/{patientId}/metrics/recent — Recent readings for live charts.
     */
    public function recent(Request $request, string $patientId): JsonResponse
    {
        $limit   = min((int) $request->get('limit', 50), 200);
        $metrics = $this->metricService->getRecent($patientId, $limit);
        return response()->json(['success' => true, 'data' => $metrics]);
    }

    /**
     * GET /patients/{patientId}/metrics/latest — Single latest reading.
     */
    public function latest(string $patientId): JsonResponse
    {
        $metric = $this->metricService->getLatest($patientId);
        return response()->json(['success' => true, 'data' => $metric]);
    }

    /**
     * POST /patients/{patientId}/metrics — Record new health reading.
     */
    public function store(Request $request, string $patientId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'heart_rate'               => 'sometimes|numeric|min:0|max:300',
            'spo2'                     => 'sometimes|numeric|min:0|max:100',
            'blood_pressure_systolic'  => 'sometimes|numeric|min:0|max:300',
            'blood_pressure_diastolic' => 'sometimes|numeric|min:0|max:200',
            'temperature'              => 'sometimes|numeric|min:85|max:115',
            'sugar_level'              => 'sometimes|numeric|min:0|max:600',
            'respiratory_rate'         => 'sometimes|numeric|min:0|max:60',
            'weight'                   => 'sometimes|numeric|min:0|max:500',
            'ecg_data'                 => 'sometimes|array',
            'timestamp'                => 'sometimes|date',
            'source'                   => 'sometimes|in:manual,device,simulation',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $metric = $this->metricService->record($patientId, $validator->validated());

        return response()->json(['success' => true, 'message' => 'Metric recorded.', 'data' => $metric], 201);
    }

    /**
     * GET /patients/{patientId}/metrics/averages — Period averages for reports.
     */
    public function averages(Request $request, string $patientId): JsonResponse
    {
        $period   = $request->get('period', 'weekly');
        $averages = $this->metricService->getAverages($patientId, $period);
        return response()->json(['success' => true, 'data' => $averages]);
    }
}
