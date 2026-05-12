<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Alert extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'alerts';

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'metric_id',
        'type',        // critical | emergency | fever | diabetes | info
        'message',
        'severity',    // emergency | critical | warning | info
        'status',      // unread | read | resolved | dismissed
        'resolved_at',
        'resolved_by',
        'notes',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
    ];

    // Default values
    protected $attributes = [
        'status' => 'unread',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function metric()
    {
        return $this->belongsTo(HealthMetric::class, 'metric_id');
    }

    public function scopeUnresolved($query)
    {
        return $query->whereIn('status', ['unread', 'read']);
    }

    public function scopeCritical($query)
    {
        return $query->whereIn('severity', ['critical', 'emergency']);
    }
}
