<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\User;

abstract class Controller
{
    /**
     * Check if the given user is authorised to access the patient resource
     * identified by $patientId (the Patient model _id).
     *
     * Rules:
     *  - Admins: always allowed.
     *  - Doctors: allowed only if the patient is assigned to them.
     *  - Patients: allowed only if it is their own patient profile.
     *
     * Returns the Patient model on success, aborts 403/404 otherwise.
     */
    protected function authorizePatientAccess(?User $user, string $patientId): Patient
    {
        if (!$user) {
            abort(401, 'Unauthenticated.');
        }

        $patient = Patient::find($patientId);
        if (!$patient) {
            abort(404, 'Patient not found.');
        }

        if ($user->isAdmin()) {
            return $patient;
        }

        if ($user->isDoctor()) {
            if ((string) $patient->doctor_id !== (string) $user->_id) {
                abort(403, 'You are not assigned to this patient.');
            }
            return $patient;
        }

        if ($user->isPatient()) {
            $own = $user->patientProfile;
            if (!$own || (string) $own->_id !== (string) $patient->_id) {
                abort(403, 'You can only access your own records.');
            }
            return $patient;
        }

        abort(403, 'Unauthorized.');
    }
}
