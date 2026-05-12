<?php

namespace App\Services;

use App\Models\Patient;
use App\Models\User;
use App\Repositories\PatientRepository;
use App\Repositories\UserRepository;
use App\Models\ActivityLog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PatientService
{
    public function __construct(
        protected PatientRepository $patientRepo,
        protected UserRepository    $userRepo,
    ) {}

    /**
     * Create a patient profile linked to a user.
     */
    public function createPatient(array $userData, array $profileData): array
    {
        // Create User account
        $user = $this->userRepo->create([
            'name'      => $userData['name'],
            'email'     => $userData['email'],
            'password'  => $userData['password'],
            'role'      => 'patient',
            'phone'     => $userData['phone'] ?? null,
            'is_active' => true,
        ]);

        // Create Patient profile
        $patient = $this->patientRepo->create(array_merge($profileData, [
            'user_id'    => (string) $user->_id,
            'is_critical'=> false,
        ]));

        $this->logActivity(null, 'create', 'patient', (string) $patient->_id, "Patient created: {$user->email}");

        return ['user' => $user, 'patient' => $patient];
    }

    /**
     * Retrieve paginated patients list (with optional search and doctor filter).
     */
    public function list(int $perPage = 15, ?string $search = null, ?string $doctorId = null): LengthAwarePaginator
    {
        return $this->patientRepo->paginateWithUser($perPage, $search, $doctorId);
    }

    /**
     * Get patient profile for a given user ID.
     */
    public function getByUserId(string $userId): ?Patient
    {
        return $this->patientRepo->findByUserId($userId);
    }

    /**
     * Update patient profile data.
     */
    public function updateProfile(string $patientId, array $data): Patient
    {
        $patient = $this->patientRepo->update($patientId, $data);
        $this->logActivity(null, 'update', 'patient', $patientId, "Patient profile updated");
        return $patient;
    }

    /**
     * Assign a doctor to a patient.
     */
    public function assignDoctor(string $patientId, string $doctorId): Patient
    {
        return $this->patientRepo->update($patientId, ['doctor_id' => $doctorId]);
    }

    private function logActivity(?string $userId, string $action, string $entityType, string $entityId, string $description): void
    {
        ActivityLog::create([
            'user_id'     => $userId,
            'action'      => $action,
            'entity_type' => $entityType,
            'entity_id'   => $entityId,
            'description' => $description,
        ]);
    }
}
