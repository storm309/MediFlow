<?php

namespace App\Services;

use App\Models\HealthMetric;
use App\Models\Alert;
use App\Models\Patient;
use App\Repositories\HealthMetricRepository;
use App\Events\HealthMetricUpdated;
use App\Events\AlertCreated;
use Illuminate\Support\Facades\Broadcast;

class HealthMetricService
{
    public function __construct(
        protected HealthMetricRepository $metricRepo,
    ) {}

    /**
     * Record new health metrics, detect alerts, and broadcast real-time updates.
     */
    public function record(string $patientId, array $data): HealthMetric
    {
        $data['patient_id'] = $patientId;
        $data['timestamp']  = $data['timestamp'] ?? now();
        $data['source']     = $data['source'] ?? 'manual';

        $metric = $this->metricRepo->create($data);

        // Broadcast real-time metric update to doctor/admin channels
        broadcast(new HealthMetricUpdated($metric))->toOthers();

        // Detect and create alerts
        $this->processAlerts($metric);

        // Update patient critical flag
        $this->updateCriticalStatus($metric);

        return $metric;
    }

    /**
     * Get metrics for a patient with pagination.
     */
    public function getHistory(string $patientId, int $perPage = 20)
    {
        return $this->metricRepo->paginateByPatient($patientId, $perPage);
    }

    /**
     * Get recent metrics for live charts.
     */
    public function getRecent(string $patientId, int $limit = 50): \Illuminate\Database\Eloquent\Collection
    {
        return $this->metricRepo->getByPatient($patientId, $limit);
    }

    /**
     * Get latest single metric reading.
     */
    public function getLatest(string $patientId): ?HealthMetric
    {
        return $this->metricRepo->getLatest($patientId);
    }

    /**
     * Generate aggregated averages for a date range.
     */
    public function getAverages(string $patientId, string $period = 'weekly'): array
    {
        [$start, $end] = $this->getPeriodRange($period);
        return $this->metricRepo->getAverages($patientId, $start, $end);
    }

    // ── Private Helpers ────────────────────────────────────────────────────────

    private function processAlerts(HealthMetric $metric): void
    {
        $conditions = $metric->detectAlerts();

        foreach ($conditions as $condition) {
            $alert = Alert::create([
                'patient_id' => $metric->patient_id,
                'metric_id'  => (string) $metric->_id,
                'type'       => $condition['type'],
                'message'    => $condition['message'],
                'severity'   => $condition['severity'],
                'status'     => 'unread',
            ]);

            // Broadcast alert to the patient channel and doctor
            broadcast(new AlertCreated($alert));
        }
    }

    private function updateCriticalStatus(HealthMetric $metric): void
    {
        // Emergency: immediately life-threatening thresholds
        $isEmergency = ($metric->spo2 !== null && $metric->spo2 < 85)
            || ($metric->heart_rate !== null && $metric->heart_rate > 130);

        $isCritical = $isEmergency
            || ($metric->heart_rate ?? 0) > 110
            || ($metric->spo2 ?? 100) < 90
            || ($metric->temperature ?? 0) > 103;

        Patient::where('_id', $metric->patient_id)
            ->update(['is_critical' => $isCritical, 'is_emergency' => $isEmergency, 'last_checkup' => now()]);

        // Send emergency notifications to doctor and admin when newly critical
        if ($isEmergency) {
            $patient = Patient::with('user:_id,name')->find($metric->patient_id);
            if (!$patient) return;

            $patientName = $patient->user?->name ?? 'Unknown Patient';
            $detail = [];
            if ($metric->spo2 !== null && $metric->spo2 < 85) {
                $detail[] = "SpO2 critically low: {$metric->spo2}%";
            }
            if ($metric->heart_rate !== null && $metric->heart_rate > 130) {
                $detail[] = "Heart rate dangerously high: {$metric->heart_rate} bpm";
            }
            $detailText = implode(', ', $detail);

            // Notify assigned doctor
            if ($patient->doctor_id) {
                \App\Models\Notification::create([
                    'user_id'  => (string) $patient->doctor_id,
                    'title'    => '🚨 EMERGENCY — Immediate Attention Required',
                    'message'  => "Patient {$patientName}: {$detailText}. Please respond immediately.",
                    'type'     => 'alert',
                    'priority' => 'emergency',
                    'is_read'  => false,
                ]);
            }

            // Notify all admins
            $admins = \App\Models\User::where('role', 'admin')->pluck('_id');
            foreach ($admins as $adminId) {
                \App\Models\Notification::create([
                    'user_id'  => (string) $adminId,
                    'title'    => '🚨 EMERGENCY — ' . $patientName,
                    'message'  => $detailText . '. Doctor has been notified.',
                    'type'     => 'alert',
                    'priority' => 'emergency',
                    'is_read'  => false,
                ]);
            }
        }
    }

    private function getPeriodRange(string $period): array
    {
        return match ($period) {
            'daily'   => [now()->startOfDay(), now()->endOfDay()],
            'weekly'  => [now()->startOfWeek(), now()->endOfWeek()],
            'monthly' => [now()->startOfMonth(), now()->endOfMonth()],
            default   => [now()->startOfWeek(), now()->endOfWeek()],
        };
    }
}
