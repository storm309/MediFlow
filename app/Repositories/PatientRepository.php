<?php

namespace App\Repositories;

use App\Models\Patient;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PatientRepository extends BaseRepository
{
    public function __construct(Patient $model)
    {
        parent::__construct($model);
    }

    public function paginateWithUser(int $perPage = 15, ?string $search = null, ?string $doctorId = null): LengthAwarePaginator
    {
        $query = $this->model->with('user:_id,name,email,phone,avatar');

        if ($doctorId) {
            $query->where('doctor_id', $doctorId);
        }

        if ($search) {
            // Filter by related user name or email
            $userIds = \App\Models\User::where('role', 'patient')
                ->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })->pluck('_id');
            $query->whereIn('user_id', $userIds);
        }

        return $query->latest()->paginate($perPage);
    }

    public function findByUserId(string $userId): ?Patient
    {
        return $this->model->where('user_id', $userId)->first();
    }

    public function findByDoctorId(string $doctorId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->model->where('doctor_id', $doctorId)->with('user:_id,name,email')->get();
    }

    public function markCritical(string $patientId, bool $critical = true): Patient
    {
        $patient = $this->findOrFail($patientId);
        $patient->update(['is_critical' => $critical]);
        return $patient;
    }
}
