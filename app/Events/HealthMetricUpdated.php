<?php

namespace App\Events;

use App\Models\HealthMetric;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class HealthMetricUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public readonly HealthMetric $metric) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("patient.{$this->metric->patient_id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'metric.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'id'                        => (string) $this->metric->_id,
            'patient_id'                => $this->metric->patient_id,
            'heart_rate'                => $this->metric->heart_rate,
            'spo2'                      => $this->metric->spo2,
            'blood_pressure_systolic'   => $this->metric->blood_pressure_systolic,
            'blood_pressure_diastolic'  => $this->metric->blood_pressure_diastolic,
            'temperature'               => $this->metric->temperature,
            'sugar_level'               => $this->metric->sugar_level,
            'respiratory_rate'          => $this->metric->respiratory_rate,
            'timestamp'                 => $this->metric->timestamp?->toISOString(),
        ];
    }
}
