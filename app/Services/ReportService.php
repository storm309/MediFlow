<?php

namespace App\Services;

use App\Models\Report;
use App\Models\Patient;
use App\Repositories\HealthMetricRepository;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class ReportService
{
    public function __construct(
        protected HealthMetricRepository $metricRepo,
    ) {}

    /**
     * Generate a health report for a patient over a given period.
     */
    public function generate(string $patientId, string $period = 'weekly', ?string $doctorId = null): Report
    {
        [$start, $end] = $this->getPeriodRange($period);

        $averages = $this->metricRepo->getAverages($patientId, $start, $end);
        $alertsCount = \App\Models\Alert::where('patient_id', $patientId)
            ->whereBetween('created_at', [$start, $end])
            ->count();
        $criticalAlertsCount = \App\Models\Alert::where('patient_id', $patientId)
            ->whereBetween('created_at', [$start, $end])
            ->whereIn('severity', ['critical', 'emergency'])
            ->count();

        $patient = Patient::with('user:_id,name,email')->findOrFail($patientId);

        return Report::create([
            'patient_id'                      => $patientId,
            'doctor_id'                       => $doctorId,
            'title'                           => ucfirst($period) . " Health Report – " . ($patient->user->name ?? 'Patient'),
            'period'                          => $period,
            'period_start'                    => $start,
            'period_end'                      => $end,
            'avg_heart_rate'                  => $averages['avg_heart_rate'] ?? null,
            'avg_spo2'                        => $averages['avg_spo2'] ?? null,
            'avg_temperature'                 => $averages['avg_temperature'] ?? null,
            'avg_blood_pressure_systolic'     => $averages['avg_blood_pressure_systolic'] ?? null,
            'avg_blood_pressure_diastolic'    => $averages['avg_blood_pressure_diastolic'] ?? null,
            'avg_sugar_level'                 => $averages['avg_sugar_level'] ?? null,
            'alerts_count'                    => $alertsCount,
            'critical_alerts_count'           => $criticalAlertsCount,
            'metrics_count'                   => $averages['metrics_count'] ?? 0,
            'status'                          => 'generated',
        ]);
    }

    /**
     * Render a PDF of the given report and return the file path.
     */
    public function generatePdf(string $reportId): string
    {
        $report  = Report::with(['patient.user', 'doctor'])->findOrFail($reportId);
        $metrics = $this->metricRepo->getByPeriod(
            $report->patient_id,
            $report->period_start,
            $report->period_end
        );

        $pdf  = Pdf::loadView('reports.pdf', compact('report', 'metrics'));
        $path = "reports/{$reportId}.pdf";
        Storage::disk('local')->put($path, $pdf->output());

        $report->update(['pdf_path' => $path]);

        return $path;
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
