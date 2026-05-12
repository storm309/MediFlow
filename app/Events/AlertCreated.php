<?php

namespace App\Events;

use App\Models\Alert;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AlertCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public readonly Alert $alert) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("patient.{$this->alert->patient_id}"),
            new Channel('alerts'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'alert.created';
    }

    public function broadcastWith(): array
    {
        return [
            'id'         => (string) $this->alert->_id,
            'patient_id' => $this->alert->patient_id,
            'type'       => $this->alert->type,
            'message'    => $this->alert->message,
            'severity'   => $this->alert->severity,
            'status'     => $this->alert->status,
            'created_at' => $this->alert->created_at?->toISOString(),
        ];
    }
}
