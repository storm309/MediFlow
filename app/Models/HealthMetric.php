<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class HealthMetric extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'health_metrics';

    protected $fillable = [
        'patient_id',
        'heart_rate',
        'spo2',
        'blood_pressure_systolic',
        'blood_pressure_diastolic',
        'temperature',
        'sugar_level',
        'ecg_data',
        'respiratory_rate',
        'weight',
        'timestamp',
        'source',  // manual | device | simulation
    ];

    protected $casts = [
        '_id'                        => 'string',
        'heart_rate'                 => 'float',
        'spo2'                       => 'float',
        'blood_pressure_systolic'    => 'float',
        'blood_pressure_diastolic'   => 'float',
        'temperature'                => 'float',
        'sugar_level'                => 'float',
        'respiratory_rate'           => 'float',
        'weight'                     => 'float',
        'ecg_data'                   => 'array',
        'timestamp'                  => 'datetime',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    /**
     * Evaluate alert conditions against this metric.
     * Returns an array of alert type strings.
     */
    public function detectAlerts(): array
    {
        $alerts = [];

        if ($this->heart_rate > 110) {
            $alerts[] = ['type' => 'critical', 'message' => "Heart rate critical: {$this->heart_rate} bpm", 'severity' => 'critical'];
        }

        if ($this->spo2 < 90) {
            $alerts[] = ['type' => 'emergency', 'message' => "SpO2 dangerously low: {$this->spo2}%", 'severity' => 'emergency'];
        }

        if ($this->temperature > 102) {
            $alerts[] = ['type' => 'fever', 'message' => "High temperature: {$this->temperature}°F", 'severity' => 'warning'];
        }

        if ($this->sugar_level && ($this->sugar_level > 200 || $this->sugar_level < 70)) {
            $alerts[] = ['type' => 'diabetes', 'message' => "Abnormal blood sugar: {$this->sugar_level} mg/dL", 'severity' => 'warning'];
        }

        return $alerts;
    }
}
