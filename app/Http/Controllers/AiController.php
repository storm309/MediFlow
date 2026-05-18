<?php

namespace App\Http\Controllers;

use App\Models\AiAnalysis;
use App\Models\ChatHistory;
use App\Services\GeminiService;
use App\Services\HealthMetricService;
use App\Services\PatientService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AiController extends Controller
{
    public function __construct(
        protected GeminiService       $gemini,
        protected HealthMetricService $metricService,
        protected PatientService      $patientService,
    ) {}

    // ── Risk Analysis ──────────────────────────────────────────────────────────

    /**
     * POST /ai/risk/{patientId}
     * Analyse a patient's latest vitals and return AI risk predictions.
     */
    public function analyseRisk(Request $request, string $patientId): JsonResponse
    {
        try {
            // Fetch latest vitals + recent history
            $latest  = $this->metricService->getLatest($patientId);
            $history = $this->metricService->getRecent($patientId, 20)->toArray();

            if (!$latest) {
                return response()->json([
                    'success' => false,
                    'message' => 'No health metrics found for this patient.',
                ], 404);
            }

            // Optionally fetch patient context
            $patient = [];
            try {
                $p = $this->patientService->findByUserId($patientId);
                $patient = ['name' => $p?->name ?? 'Patient', 'age' => $p?->age ?? null];
            } catch (\Exception $e) {}

            $vitals = [
                'heart_rate'               => $latest->heart_rate,
                'spo2'                     => $latest->spo2,
                'blood_pressure_systolic'  => $latest->blood_pressure_systolic,
                'blood_pressure_diastolic' => $latest->blood_pressure_diastolic,
                'temperature'              => $latest->temperature,
                'sugar_level'              => $latest->sugar_level,
            ];

            $result = $this->gemini->analyseRisk($vitals, $history, $patient);

            // Persist the AI analysis for audit/history
            AiAnalysis::create([
                'patient_id'  => $patientId,
                'type'        => 'risk_analysis',
                'input'       => $vitals,
                'result'      => $result,
                'risk_score'  => $result['risk_score'] ?? 0,
                'severity'    => $result['severity'] ?? 'normal',
            ]);

            return response()->json(['success' => true, 'data' => $result]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'AI analysis failed. Please try again.',
                'error'   => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * GET /ai/risk/{patientId}/history
     * Get past AI analyses for a patient.
     */
    public function riskHistory(string $patientId): JsonResponse
    {
        $analyses = AiAnalysis::where('patient_id', $patientId)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json(['success' => true, 'data' => $analyses]);
    }

    // ── AI Chat ────────────────────────────────────────────────────────────────

    /**
     * POST /ai/chat
     * Send a message to the AI healthcare assistant.
     */
    public function chat(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'message'      => 'required|string|max:1000',
            'session_id'   => 'sometimes|string|max:64',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user      = $request->user();
        $sessionId = $request->session_id ?? 'default';
        $message   = $request->message;

        try {
            // Load conversation history for this session
            $history = ChatHistory::where('user_id', (string) $user->_id)
                ->where('session_id', $sessionId)
                ->orderBy('created_at', 'asc')
                ->limit(12)
                ->get()
                ->map(fn ($m) => ['role' => $m->role, 'content' => $m->content])
                ->toArray();

            // Build user context from auth data
            $context = [
                'user_name' => $user->name,
                'user_role' => $user->role,
            ];

            // Call Gemini
            $response = $this->gemini->chat($message, $history, $context);

            // Persist both turns
            ChatHistory::create([
                'user_id'    => (string) $user->_id,
                'session_id' => $sessionId,
                'role'       => 'user',
                'content'    => $message,
            ]);
            ChatHistory::create([
                'user_id'    => (string) $user->_id,
                'session_id' => $sessionId,
                'role'       => 'assistant',
                'content'    => $response,
            ]);

            return response()->json([
                'success'  => true,
                'data'     => ['message' => $response, 'session_id' => $sessionId],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Chat unavailable at this time.',
                'error'   => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * GET /ai/chat/history
     * Retrieve chat history for the authenticated user.
     */
    public function chatHistory(Request $request): JsonResponse
    {
        $sessionId = $request->get('session_id', 'default');

        $history = ChatHistory::where('user_id', (string) $request->user()->_id)
            ->where('session_id', $sessionId)
            ->orderBy('created_at', 'asc')
            ->limit(50)
            ->get(['role', 'content', 'created_at']);

        return response()->json(['success' => true, 'data' => $history]);
    }

    /**
     * DELETE /ai/chat/history
     * Clear chat history for the current session.
     */
    public function clearChat(Request $request): JsonResponse
    {
        $sessionId = $request->get('session_id', 'default');

        ChatHistory::where('user_id', (string) $request->user()->_id)
            ->where('session_id', $sessionId)
            ->delete();

        return response()->json(['success' => true, 'message' => 'Chat history cleared.']);
    }

    // ── Report Summary ─────────────────────────────────────────────────────────

    /**
     * POST /ai/report-summary/{patientId}
     * Generate an AI narrative summary for a health report.
     */
    public function reportSummary(Request $request, string $patientId): JsonResponse
    {
        try {
            $averages = $this->metricService->getAverages($patientId, 'weekly');
            $patient  = ['name' => $request->get('patient_name', 'Patient')];
                // Fetch actual alerts for the patient
                $alerts = Alert::where('patient_id', $patientId)
                    ->whereBetween('created_at', [
                        now()->startOfWeek(),
                        now()->endOfWeek()
                    ])
                    ->get()
                    ->toArray();
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Could not generate AI summary.',
            ], 500);
        }
    }
}
