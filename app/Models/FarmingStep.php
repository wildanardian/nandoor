<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FarmingStep extends Model
{
  protected $fillable = [
    'farm_id',
    'period_id',
    'master_step_id',
    'status', // pending, active, done, skipped
    'started_at',
    'finished_at',
  ];

  protected $casts = [
    'started_at' => 'date',
    'finished_at' => 'date',
  ];

  public function farm()
  {
    return $this->belongsTo(Farm::class);
  }

  public function period()
  {
    return $this->belongsTo(Period::class);
  }

  public function masterStep()
  {
    return $this->belongsTo(MasterFarmingStep::class, 'master_step_id');
  }

  public function farmActivities()
  {
    return $this->hasMany(FarmActivity::class);
  }

  public function farmActivity()
  {
    return $this->hasOne(FarmActivity::class);
  }

  // Helper accessors
  public function getNameAttribute()
  {
    return $this->masterStep ? $this->masterStep->name : 'Unknown Step';
  }

  public const STATUS_DRAFT = 'draft';
  public const STATUS_IN_PROGRESS = 'in_progress';
  public const STATUS_FINISHED = 'finished';
  public const STATUS_LOCKED = 'locked';

  public function canBeEdited(): bool
  {
    return in_array($this->status, [self::STATUS_IN_PROGRESS, self::STATUS_FINISHED]);
  }

  public function isLocked(): bool
  {
    return $this->status === self::STATUS_LOCKED;
  }

  public function logs()
  {
    return $this->hasMany(StepActivityLog::class);
  }
}
