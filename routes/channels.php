<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\User;

// Public channel for system alerts
Broadcast::channel('alerts', function ($user) {
    return $user !== null;
});

// Private channel per patient for health metrics
Broadcast::channel('patient.{patientId}', function (User $user, string $patientId) {
    return $user->role === 'admin'
        || ($user->role === 'patient' && \App\Models\Patient::where('_id', $patientId)->where('user_id', (string) $user->_id)->exists())
        || ($user->role === 'doctor' && \App\Models\Patient::where('_id', $patientId)->where('doctor_id', (string) $user->_id)->exists());
});

// Doctor-specific channel
Broadcast::channel('doctor.{doctorId}', function (User $user, string $doctorId) {
    return $user->id === $doctorId || $user->role === 'admin';
});
