<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\UserRepository;
use App\Repositories\PatientRepository;
use App\Repositories\HealthMetricRepository;
use App\Services\AuthService;
use App\Services\PatientService;
use App\Services\HealthMetricService;
use App\Services\ReportService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(UserRepository::class);
        $this->app->singleton(PatientRepository::class);
        $this->app->singleton(HealthMetricRepository::class);
        $this->app->singleton(AuthService::class);
        $this->app->singleton(PatientService::class);
        $this->app->singleton(HealthMetricService::class);
        $this->app->singleton(ReportService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
