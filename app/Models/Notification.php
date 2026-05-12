<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Notification extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'notifications';

    protected $fillable = [
        'user_id',
        'title',
        'message',
        'type',         // alert | report | appointment | system | info
        'data',         // JSON extra payload
        'is_read',
        'read_at',
        'action_url',
    ];

    protected $casts = [
        'data'    => 'array',
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];

    protected $attributes = [
        'is_read' => false,
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }
}
