<?php

namespace App\Providers;

use App\Events\AlertCreated;
use App\Events\HealthMetricUpdated;
use App\Listeners\SendAlertNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        AlertCreated::class => [
            SendAlertNotification::class,
        ],
    ];

    public function boot(): void
    {
        parent::boot();
    }
}
