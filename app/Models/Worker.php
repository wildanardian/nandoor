<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Worker extends Model
{
  protected $fillable = [
    'name',
    'phone',
    'notes',
    // 'is_active' is now global soft-active or system active
    'is_active',
  ];

  protected $casts = [
    'is_active' => 'boolean',
  ];

  public function farms()
  {
    return $this->belongsToMany(Farm::class, 'farm_workers')
      ->withPivot('is_active', 'joined_at')
      ->withTimestamps()
      ->using(FarmWorker::class);
  }

  public function payments()
  {
    return $this->hasMany(WorkerPayment::class);
  }

  public function scopeActive(Builder $query)
  {
    return $query->where('is_active', true);
  }

  public function scopeByFarm(Builder $query, $farmId)
  {
    return $query->whereHas('farms', function ($q) use ($farmId) {
      $q->where('farms.id', $farmId);
    });
  }
}
