<?php

namespace App\Repositories;

use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

abstract class BaseRepository
{
    protected Model $model;

    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    public function all(array $columns = ['*']): Collection
    {
        return $this->model->get($columns);
    }

    public function paginate(int $perPage = 15, array $filters = [], array $columns = ['*']): LengthAwarePaginator
    {
        return $this->model->paginate($perPage, $columns);
    }

    public function find(string $id): ?Model
    {
        return $this->model->find($id);
    }

    public function findOrFail(string $id): Model
    {
        return $this->model->findOrFail($id);
    }

    public function create(array $data): Model
    {
        return $this->model->create($data);
    }

    public function update(string $id, array $data): Model
    {
        $record = $this->findOrFail($id);
        $record->update($data);
        return $record->fresh();
    }

    public function delete(string $id): bool
    {
        return (bool) $this->model->findOrFail($id)->delete();
    }

    public function findBy(string $field, mixed $value): ?Model
    {
        return $this->model->where($field, $value)->first();
    }

    public function findAllBy(string $field, mixed $value): Collection
    {
        return $this->model->where($field, $value)->get();
    }

    public function count(array $conditions = []): int
    {
        $query = $this->model->newQuery();
        foreach ($conditions as $field => $value) {
            $query->where($field, $value);
        }
        return $query->count();
    }
}
