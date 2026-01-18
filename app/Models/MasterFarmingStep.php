<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MasterFarmingStep extends Model
{
  use HasFactory;

  protected $fillable = [
    'name',
    'crop_type',
    // 'crop_type_id',
    'step_order',
    'description',
    'is_active',
  ];

  protected $casts = [
    'is_active' => 'boolean',
    'step_order' => 'integer',
  ];

  public function cropType()
  {
    return $this->belongsTo(CropType::class);
  }

  public function farmingSteps()
  {
    return $this->hasMany(FarmingStep::class, 'master_step_id');
  }
}
