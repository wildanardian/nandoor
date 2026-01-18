<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CropType extends Model
{
  protected $fillable = [
    'name',
    'slug',
    'description',
    'is_active',
  ];

  protected $casts = [
    'is_active' => 'boolean',
  ];

  public function farms()
  {
    return $this->hasMany(Farm::class);
  }

  public function masterFarmingSteps()
  {
    return $this->hasMany(MasterFarmingStep::class);
  }
}
