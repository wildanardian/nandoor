<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Farm extends Model
{
  protected $fillable = ['owner_id', 'period_id', 'name', 'crop_type_id', 'area_ha', 'area_measured_at', 'is_archived', 'onboarding_completed_at'];

  protected $casts = [
    'is_archived' => 'boolean',
  ];

  public function hasActivePeriod()
  {
    return $this->periods()->where('status', 'active')->exists();
  }

  public function activePeriod()
  {
    return $this->belongsTo(Period::class, 'period_id');
  }

  public function periods()
  {
    return $this->hasMany(Period::class);
  }

  public function owner()
  {
    return $this->belongsTo(User::class, 'owner_id');
  }

  public function plots()
  {
    return $this->hasMany(FarmPlot::class);
  }

  public function farmUserAccesses()
  {
    // Using a pivot model if exists, or just accessing the table/relationship
    // If we want to manipulate the pivot table directly, maybe hasMany(FarmUserAccess::class) if it's a model
    // Given we didn't create a pivot model yet, let's use the users relationship with pivot
    // But user requested "farm_user_access". Maybe distinct model "FarmUserAccess"?
    // I'll stick to users() with pivot for retrieval.
    // And I can create a Model for 'FarmUserAccess' if I want to list them easily.
    // Let's create `FarmUserAccess` model as well for better control.
    return $this->hasMany(FarmUserAccess::class, 'farm_id'); // Assuming I create this model
  }

  // Helper to get users directly
  public function users()
  {
    return $this->belongsToMany(User::class, 'farm_user_access', 'farm_id', 'user_id')
      ->withPivot('id', 'role')
      ->withTimestamps();
  }

  public function cropType()
  {
    return $this->belongsTo(CropType::class);
  }

  public function farmActivities()
  {
    return $this->hasMany(FarmActivity::class);
  }

  public function workers()
  {
    return $this->belongsToMany(Worker::class, 'farm_workers')
      ->withPivot('is_active', 'joined_at')
      ->withTimestamps()
      ->using(FarmWorker::class);
  }

  public function farmingSteps()
  {
    return $this->hasMany(FarmingStep::class);
  }
}
