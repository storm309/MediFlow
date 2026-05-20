<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Patient extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'patients';

    protected $fillable = [
        'user_id',
        'doctor_id',
        'age',
        'gender',
        'blood_group',
        'phone',
        'address',
        'emergency_contact',
        'medical_history',
        'allergies',
        'current_medications',
        'is_critical',
        'last_checkup',
    ];

    protected $casts = [
        '_id'                 => 'string',
        'age'                 => 'integer',
        'is_critical'         => 'boolean',
        'last_checkup'        => 'datetime',
        'medical_history'     => 'array',
        'allergies'           => 'array',
        'current_medications' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function healthMetrics()
    {
        return $this->hasMany(HealthMetric::class, 'patient_id');
    }

    public function alerts()
    {
        return $this->hasMany(Alert::class, 'patient_id');
    }

    public function reports()
    {
        return $this->hasMany(Report::class, 'patient_id');
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'patient_id');
    }

    public function latestMetric()
    {
        return $this->hasOne(HealthMetric::class, 'patient_id')->latest('timestamp');
    }
}
