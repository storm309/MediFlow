<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Patient;
use App\Models\HealthMetric;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // --- Admin ---
        User::where('email', 'admin@mediflow.com')->delete();
        User::create([
            'name'      => 'System Admin',
            'email'     => 'admin@mediflow.com',
            'password'  => Hash::make('password'),
            'role'      => 'admin',
            'is_active' => true,
        ]);

        // --- Doctor ---
        User::where('email', 'doctor@mediflow.com')->delete();
        $doctor = User::create([
            'name'      => 'Dr. Sarah Johnson',
            'email'     => 'doctor@mediflow.com',
            'password'  => Hash::make('password'),
            'role'      => 'doctor',
            'is_active' => true,
        ]);

        // --- Patient 1 ---
        User::where('email', 'patient@mediflow.com')->delete();
        $patientUser = User::create([
            'name'      => 'John Doe',
            'email'     => 'patient@mediflow.com',
            'password'  => Hash::make('password'),
            'role'      => 'patient',
            'is_active' => true,
        ]);

        Patient::where('user_id', (string) $patientUser->_id)->delete();
        $patient = Patient::create([
            'user_id'   => (string) $patientUser->_id,
            'doctor_id' => (string) $doctor->_id,
            'age'       => 42,
            'gender'    => 'male',
            'blood_group' => 'O+',
            'phone'     => '+1-555-0100',
            'address'   => '123 Main St, Springfield',
            'medical_history'     => ['Hypertension', 'Type 2 Diabetes'],
            'allergies'           => ['Penicillin'],
            'current_medications' => ['Metformin 500mg', 'Lisinopril 10mg'],
            'is_critical'         => false,
        ]);

        // Seed some health metrics for the patient
        $now = now();
        for ($i = 20; $i >= 0; $i--) {
            HealthMetric::create([
                'patient_id'               => (string) $patient->_id,
                'heart_rate'               => rand(68, 95),
                'spo2'                     => rand(94, 99),
                'blood_pressure_systolic'  => rand(110, 135),
                'blood_pressure_diastolic' => rand(70, 90),
                'temperature'              => round(97.5 + (rand(0, 30) / 10), 1),
                'sugar_level'              => rand(85, 150),
                'respiratory_rate'         => rand(14, 20),
                'weight'                   => 78.5,
                'source'                   => 'manual',
                'timestamp'                => $now->copy()->subMinutes($i * 15),
            ]);
        }

        $this->command->info('✅ MediFlow seeded: admin@mediflow.com | doctor@mediflow.com | patient@mediflow.com — password: password');
    }
}

