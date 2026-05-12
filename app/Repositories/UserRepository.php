<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class UserRepository extends BaseRepository
{
    public function __construct(User $model)
    {
        parent::__construct($model);
    }

    public function findByEmail(string $email): ?User
    {
        return $this->model->where('email', $email)->first();
    }

    public function findByRole(string $role): \Illuminate\Database\Eloquent\Collection
    {
        return $this->model->where('role', $role)->get();
    }

    public function paginateByRole(string $role, int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->where('role', $role)->latest()->paginate($perPage);
    }

    public function searchByRole(string $role, string $search, int $perPage = 15): LengthAwarePaginator
    {
        return $this->model
            ->where('role', $role)
            ->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($perPage);
    }

    public function countByRole(string $role): int
    {
        return $this->model->where('role', $role)->count();
    }
}
