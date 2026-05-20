<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Appointment extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'appointments';

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'title',
        'description',
        'scheduled_at',
        'duration',       // minutes
        'type',           // consultation | follow_up | emergency | routine
        'status',         // scheduled | confirmed | cancelled | completed | no_show
        'location',
        'meeting_link',
        'notes',
        'cancelled_reason',
        'cancelled_at',
        'completed_at',
    ];

    protected $casts = [
        '_id'          => 'string',
        'scheduled_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'completed_at' => 'datetime',
        'duration'     => 'integer',
    ];

    protected $attributes = [
        'status' => 'scheduled',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function scopeUpcoming($query)
    {
        return $query->where('scheduled_at', '>', now())->where('status', 'scheduled');
    }
}
