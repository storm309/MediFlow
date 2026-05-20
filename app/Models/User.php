<?php

namespace App\Models;

use Illuminate\Auth\Authenticatable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Notifications\Notifiable;
use MongoDB\Laravel\Eloquent\Model;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Model implements AuthenticatableContract, JWTSubject
{
    use Authenticatable, Notifiable;

    protected $connection = 'mongodb';
    protected $collection = 'users';

    protected $fillable = [
        'name', 'email', 'password', 'role', 'avatar',
        'phone', 'is_active', 'last_login', 'google_id',
        'email_verified_at', 'password_reset_token', 'password_reset_expires_at',
        'is_master_admin', 'is_verified', 'verification_status', 'medical_license',
        'specialization', 'qualifications', 'verification_notes', 'verified_at', 'verified_by',
    ];

    protected $hidden = ['password', 'remember_token', 'password_reset_token'];

    protected $casts = [
        '_id'                       => 'string',
        'email_verified_at'         => 'datetime',
        'last_login'                => 'datetime',
        'password_reset_expires_at' => 'datetime',
        'verified_at'               => 'datetime',
        'is_active'                 => 'boolean',
        'is_verified'               => 'boolean',
        'is_master_admin'           => 'boolean',
        'password'                  => 'hashed',
    ];

    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return ['role' => $this->role, 'email' => $this->email, 'name' => $this->name];
    }

    public function patientProfile()
    {
        return $this->hasOne(Patient::class, 'user_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class, 'user_id');
    }

    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class, 'user_id');
    }

    public function isAdmin(): bool   { return $this->role === 'admin'; }
    public function isDoctor(): bool  { return $this->role === 'doctor'; }
    public function isPatient(): bool { return $this->role === 'patient'; }
    public function isMasterAdmin(): bool { return $this->is_master_admin === true; }
    public function isDoctorVerified(): bool { return $this->isDoctor() && $this->is_verified === true; }
    public function isDoctorPending(): bool { return $this->isDoctor() && $this->verification_status === 'pending'; }
}
