<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class AiAnalysis extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'ai_analyses';

    protected $fillable = [
        'patient_id',
        'type',        // risk_analysis | report_summary
        'input',       // vitals snapshot
        'result',      // full AI response array
        'risk_score',  // 0-100
        'severity',    // normal | warning | critical | emergency
    ];

    protected $casts = [
        '_id'        => 'string',
        'input'      => 'array',
        'result'     => 'array',
        'risk_score' => 'integer',
    ];
}
