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
        // Use MongoDB aggregation pipeline — avoids loading all records into PHP
        $pipeline = [
            [
                '$match' => [
                    'patient_id' => $patientId,
                    'timestamp'  => [
                        '$gte' => new \MongoDB\BSON\UTCDateTime($start->getTimestamp() * 1000),
                        '$lte' => new \MongoDB\BSON\UTCDateTime($end->getTimestamp() * 1000),
                    ],
                ],
            ],
            [
                '$group' => [
                    '_id'                          => null,
                    'avg_heart_rate'               => ['$avg' => '$heart_rate'],
                    'avg_spo2'                     => ['$avg' => '$spo2'],
                    'avg_temperature'              => ['$avg' => '$temperature'],
                    'avg_blood_pressure_systolic'  => ['$avg' => '$blood_pressure_systolic'],
                    'avg_blood_pressure_diastolic' => ['$avg' => '$blood_pressure_diastolic'],
                    'avg_sugar_level'              => ['$avg' => '$sugar_level'],
                    'metrics_count'                => ['$sum' => 1],
                ],
            ],
        ];

        $cursor = $this->model->raw(fn ($col) => $col->aggregate($pipeline));
        $data   = iterator_to_array($cursor);

        if (empty($data)) {
            return [];
        }

        $row = $data[0];
        return [
            'avg_heart_rate'               => round((float) ($row['avg_heart_rate'] ?? 0), 1),
            'avg_spo2'                     => round((float) ($row['avg_spo2'] ?? 0), 1),
            'avg_temperature'              => round((float) ($row['avg_temperature'] ?? 0), 1),
            'avg_blood_pressure_systolic'  => round((float) ($row['avg_blood_pressure_systolic'] ?? 0), 1),
            'avg_blood_pressure_diastolic' => round((float) ($row['avg_blood_pressure_diastolic'] ?? 0), 1),
            'avg_sugar_level'              => round((float) ($row['avg_sugar_level'] ?? 0), 1),
            'metrics_count'                => (int) ($row['metrics_count'] ?? 0),
        ];
    }
}
