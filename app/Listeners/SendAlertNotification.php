<?php

namespace App\Listeners;

use App\Events\AlertCreated;
use App\Models\Notification;
use App\Models\Patient;

class SendAlertNotification
{
    public function handle(AlertCreated $event): void
    {
        $alert   = $event->alert;
        $patient = Patient::with('user:_id,name')->find($alert->patient_id);

        if (!$patient) return;

        $patientName = $patient->user->name ?? 'Patient';

        // Notify the doctor
        if ($patient->doctor_id) {
            Notification::create([
                'user_id'    => $patient->doctor_id,
                'title'      => "⚠️ {$alert->severity} Alert – {$patientName}",
                'message'    => $alert->message,
                'type'       => 'alert',
                'data'       => [
                    'alert_id'   => (string) $alert->_id,
                    'patient_id' => $alert->patient_id,
                    'severity'   => $alert->severity,
                ],
                'action_url' => "/patients/{$alert->patient_id}",
                'is_read'    => false,
            ]);
        }

        // Notify the patient
        Notification::create([
            'user_id'    => $patient->user_id,
            'title'      => "Health Alert: {$alert->type}",
            'message'    => $alert->message,
            'type'       => 'alert',
            'data'       => ['alert_id' => (string) $alert->_id],
            'is_read'    => false,
        ]);
    }
}
