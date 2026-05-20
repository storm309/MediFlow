<?php

namespace App\Console\Commands;

use App\Models\Alert;
use App\Models\Appointment;
use App\Models\HealthMetric;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Console\Command;

class CreateMongoIndexes extends Command
{
    protected $signature   = 'mongo:indexes';
    protected $description = 'Create MongoDB indexes for query performance';

    public function handle(): int
    {
        $this->info('Creating MongoDB indexes...');

        $this->makeIndexes(HealthMetric::class, 'health_metrics', [
            ['patient_id' => 1, 'timestamp' => -1],   // most common query pattern
            ['patient_id' => 1],
            ['timestamp'  => -1],
        ]);

        $this->makeIndexes(Alert::class, 'alerts', [
            ['patient_id' => 1, 'status' => 1],
            ['status'     => 1],
            ['severity'   => 1],
            ['created_at' => -1],
        ]);

        $this->makeIndexes(User::class, 'users', [
            ['role'       => 1],
            ['created_at' => -1],
        ]);

        $this->makeIndexes(Patient::class, 'patients', [
            ['user_id'     => 1],
            ['doctor_id'   => 1],
            ['is_critical' => 1],
        ]);

        $this->makeIndexes(Appointment::class, 'appointments', [
            ['patient_id'    => 1, 'scheduled_at' => -1],
            ['doctor_id'     => 1, 'scheduled_at' => -1],
            ['scheduled_at'  => -1],
        ]);

        $this->info('Done! All indexes created.');
        return self::SUCCESS;
    }

    private function makeIndexes(string $modelClass, string $collection, array $indexes): void
    {
        try {
            $db  = app($modelClass)->getConnection()->getMongoDB();
            $col = $db->selectCollection($collection);

            foreach ($indexes as $index) {
                $col->createIndex($index);
                $keys = implode(', ', array_map(
                    fn ($k, $v) => "{$k}:{$v}",
                    array_keys($index),
                    array_values($index)
                ));
                $this->line("  <fg=green>✓</> {$collection} [{$keys}]");
            }
        } catch (\Exception $e) {
            $this->warn("  Failed on {$collection}: " . $e->getMessage());
        }
    }
}
