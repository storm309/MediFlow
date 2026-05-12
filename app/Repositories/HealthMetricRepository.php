<?php

namespace App\Repositories;

use App\Models\HealthMetric;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class HealthMetricRepository extends BaseRepository
{
    public function __construct(HealthMetric $model)
    {
        parent::__construct($model);
    }

    public function getByPatient(string $patientId, int $limit = 50): Collection
    {
        return $this->model
            ->where('patient_id', $patientId)
            ->orderBy('timestamp', 'desc')
            ->limit($limit)
            ->get();
    }

    public function paginateByPatient(string $patientId, int $perPage = 20): LengthAwarePaginator
    {
        return $this->model
            ->where('patient_id', $patientId)
            ->orderBy('timestamp', 'desc')
            ->paginate($perPage);
    }

    public function getLatest(string $patientId): ?HealthMetric
    {
        return $this->model
            ->where('patient_id', $patientId)
            ->orderBy('timestamp', 'desc')
            ->first();
    }

    public function getByPeriod(string $patientId, \Carbon\Carbon $start, \Carbon\Carbon $end): Collection
    {
        return $this->model
            ->where('patient_id', $patientId)
            ->whereBetween('timestamp', [$start, $end])
            ->orderBy('timestamp', 'asc')
            ->get();
    }

    public function getAverages(string $patientId, \Carbon\Carbon $start, \Carbon\Carbon $end): array
    {
        $metrics = $this->getByPeriod($patientId, $start, $end);

        if ($metrics->isEmpty()) {
            return [];
        }

        return [
            'avg_heart_rate'                => round($metrics->avg('heart_rate'), 1),
            'avg_spo2'                      => round($metrics->avg('spo2'), 1),
            'avg_temperature'               => round($metrics->avg('temperature'), 1),
            'avg_blood_pressure_systolic'   => round($metrics->avg('blood_pressure_systolic'), 1),
            'avg_blood_pressure_diastolic'  => round($metrics->avg('blood_pressure_diastolic'), 1),
            'avg_sugar_level'               => round($metrics->avg('sugar_level'), 1),
            'metrics_count'                 => $metrics->count(),
        ];
    }
}
