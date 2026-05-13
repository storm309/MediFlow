<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * GeminiService — Wraps Google Gemini 2.5 Flash API calls.
 * All prompts, parsing, and retries are centralised here.
 */
class GeminiService
{
    private string $apiKey;
    private string $model;
    private int    $maxTokens;
    private string $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

    public function __construct()
    {
        $this->apiKey    = config('services.gemini.api_key');
        $this->model     = config('services.gemini.model', 'gemini-2.5-flash');
        $this->maxTokens = (int) config('services.gemini.max_tokens', 2048);
    }

    /**
     * Analyse patient vitals and return a structured risk prediction.
     *
     * @param  array  $vitals   Latest vitals (heart_rate, spo2, bp_sys, bp_dia, temp, sugar)
     * @param  array  $history  Array of recent metric snapshots for trend analysis
     * @param  array  $patient  Basic patient info (name, age, conditions)
     * @return array  { risk_score, risks[], summary, recommendations[], severity }
     */
    public function analyseRisk(array $vitals, array $history = [], array $patient = []): array
    {
        $cacheKey = 'ai_risk_' . md5(json_encode($vitals));

        // Cache for 15 minutes — Gemini calls are expensive
        return Cache::remember($cacheKey, 900, function () use ($vitals, $history, $patient) {
            $prompt = $this->buildRiskPrompt($vitals, $history, $patient);
            $raw    = $this->callGemini($prompt);

            return $this->parseRiskResponse($raw);
        });
    }

    /**
     * Chat assistant — single-turn or multi-turn conversation.
     *
     * @param  string  $message    The user's latest message
     * @param  array   $chatHistory  Previous messages [{ role, content }]
     * @param  array   $context    Patient/user context to inject
     * @return string  AI response text
     */
    public function chat(string $message, array $chatHistory = [], array $context = []): string
    {
        $prompt = $this->buildChatPrompt($message, $chatHistory, $context);
        return $this->callGemini($prompt);
    }

    /**
     * Generate a smart natural-language health summary for PDF reports.
     */
    public function generateReportSummary(array $averages, array $alerts, array $patient): string
    {
        $prompt = $this->buildReportSummaryPrompt($averages, $alerts, $patient);
        return $this->callGemini($prompt);
    }

    // ── Private: Prompt Builders ───────────────────────────────────────────────

    private function buildRiskPrompt(array $vitals, array $history, array $patient): string
    {
        $vitalsJson  = json_encode($vitals, JSON_PRETTY_PRINT);
        $historyJson = count($history) ? json_encode(array_slice($history, -10), JSON_PRETTY_PRINT) : 'No history available';
        $patientInfo = $patient ? "Patient: {$patient['name']}, Age: {$patient['age'] ?? 'unknown'}" : 'Patient info not available';

        return <<<PROMPT
You are MediFlow's clinical AI engine. Analyze the following patient vitals and return a JSON risk assessment.

{$patientInfo}

Current Vitals:
{$vitalsJson}

Recent Trend (last 10 readings):
{$historyJson}

Analyze for these risks:
- hypertension (systolic > 140 or diastolic > 90)
- cardiac_risk (heart rate abnormal + bp elevated)
- oxygen_emergency (SpO2 < 92)
- diabetes_risk (blood sugar > 200 fasting or > 140 post-meal)
- fever_severity (temperature > 100.4°F)

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "risk_score": 0-100,
  "severity": "normal|warning|critical|emergency",
  "risks": [
    { "type": "risk_name", "level": "low|medium|high|critical", "detail": "short explanation" }
  ],
  "summary": "2-3 sentence clinical summary for the doctor",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}
PROMPT;
    }

    private function buildChatPrompt(string $message, array $history, array $context): string
    {
        $contextBlock = '';
        if (!empty($context)) {
            $contextBlock = "Patient context: " . json_encode($context) . "\n\n";
        }

        $historyBlock = '';
        foreach (array_slice($history, -6) as $msg) {
            $role = $msg['role'] === 'user' ? 'Patient' : 'MediFlow AI';
            $historyBlock .= "{$role}: {$msg['content']}\n";
        }

        return <<<PROMPT
You are MediFlow Assistant, a compassionate and knowledgeable healthcare AI. You help patients understand their health metrics, explain medical terms simply, and provide general health guidance. Always recommend consulting a doctor for serious concerns. Never diagnose. Be friendly, concise, and reassuring.

{$contextBlock}Conversation so far:
{$historyBlock}
Patient: {$message}
MediFlow AI:
PROMPT;
    }

    private function buildReportSummaryPrompt(array $averages, array $alerts, array $patient): string
    {
        $avgJson    = json_encode($averages, JSON_PRETTY_PRINT);
        $alertCount = count($alerts);
        $name       = $patient['name'] ?? 'the patient';

        return <<<PROMPT
You are a clinical AI assistant generating a health report summary.

Patient: {$name}
Average Vitals (reporting period):
{$avgJson}

Total alerts this period: {$alertCount}

Write a professional 3-4 sentence health summary suitable for a medical report. Include overall health status, notable trends, and key observations. Be clinical but readable.
PROMPT;
    }

    // ── Private: API Call ──────────────────────────────────────────────────────

    /**
     * Make the HTTP call to Gemini and return the text response.
     * Retries once on failure.
     */
    private function callGemini(string $prompt, int $attempt = 1): string
    {
        try {
            $response = Http::timeout(30)
                ->post("{$this->baseUrl}/{$this->model}:generateContent?key={$this->apiKey}", [
                    'contents' => [
                        ['parts' => [['text' => $prompt]]]
                    ],
                    'generationConfig' => [
                        'maxOutputTokens' => $this->maxTokens,
                        'temperature'     => 0.3,
                    ],
                ]);

            if ($response->failed()) {
                throw new \RuntimeException('Gemini API error: ' . $response->body());
            }

            return $response->json('candidates.0.content.parts.0.text', '');

        } catch (\Exception $e) {
            Log::error('GeminiService error', ['attempt' => $attempt, 'error' => $e->getMessage()]);

            // Retry once after 1 second
            if ($attempt === 1) {
                sleep(1);
                return $this->callGemini($prompt, 2);
            }

            throw $e;
        }
    }

    // ── Private: Response Parsers ──────────────────────────────────────────────

    private function parseRiskResponse(string $raw): array
    {
        // Strip potential markdown fences
        $clean = preg_replace('/```json|```/i', '', $raw);
        $clean = trim($clean);

        $data = json_decode($clean, true);

        if (!$data || !isset($data['risk_score'])) {
            // Return safe fallback if parsing fails
            return [
                'risk_score'      => 0,
                'severity'        => 'normal',
                'risks'           => [],
                'summary'         => 'AI analysis unavailable at this time.',
                'recommendations' => ['Please consult your doctor for a manual assessment.'],
            ];
        }

        return $data;
    }
}
