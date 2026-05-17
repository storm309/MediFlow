<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class MasterAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if master admin already exists
        $existing = User::where('role', 'admin')->where('is_master_admin', true)->exists();

        if (!$existing) {
            User::create([
                'name'                => 'Master Admin',
                'email'               => 'admin@mediflow.local',
                'password'            => 'MediFlow@2024', // MUST be changed on first login
                'phone'               => null,
                'role'                => 'admin',
                'is_active'           => true,
                'is_master_admin'     => true,
                'is_verified'         => true,
                'verification_status' => 'none',
                'verified_at'         => now(),
            ]);

            $this->command->info('✅ Master Admin account created');
            $this->command->warn('   Email: admin@mediflow.local');
            $this->command->warn('   Password: MediFlow@2024');
            $this->command->info('   ⚠️  CHANGE PASSWORD IMMEDIATELY on first login!');
        } else {
            $this->command->info('✓ Master admin already exists');
        }
    }
}
