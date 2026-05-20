<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Report extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'reports';

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'title',
        'summary',
        'period',          // daily | weekly | monthly
        'period_start',
        'period_end',
        'avg_heart_rate',
        'avg_spo2',
        'avg_temperature',
        'avg_blood_pressure_systolic',
        'avg_blood_pressure_diastolic',
        'avg_sugar_level',
        'alerts_count',
        'critical_alerts_count',
        'metrics_count',
        'doctor_notes',
        'status',          // generated | reviewed | finalized
        'pdf_path',
    ];

    protected $casts = [
        '_id'                             => 'string',
        'period_start'                    => 'datetime',
        'period_end'                      => 'datetime',
        'avg_heart_rate'                  => 'float',
        'avg_spo2'                        => 'float',
        'avg_temperature'                 => 'float',
        'avg_blood_pressure_systolic'     => 'float',
        'avg_blood_pressure_diastolic'    => 'float',
        'avg_sugar_level'                 => 'float',
        'alerts_count'                    => 'integer',
        'critical_alerts_count'           => 'integer',
        'metrics_count'                   => 'integer',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }
}
