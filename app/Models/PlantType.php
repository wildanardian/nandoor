<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlantType extends Model
{
  protected $fillable = ['name', 'slug', 'is_active'];

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
