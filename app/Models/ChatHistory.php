<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class ChatHistory extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'chat_histories';

    protected $casts = [
        '_id' => 'string',
    ];

    protected $fillable = [
        'user_id',
        'session_id',
        'role',    // user | assistant
        'content',
    ];
}
