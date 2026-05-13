<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class UploadedFile extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'uploaded_files';

    protected $fillable = [
        'user_id',
        'patient_id',
        'type',        // report | prescription | scan | xray | other
        'label',       // display name
        'filename',    // uuid-based safe filename
        'path',        // storage path
        'mime_type',
        'size_bytes',
    ];

    protected $casts = [
        'size_bytes' => 'integer',
    ];
}
