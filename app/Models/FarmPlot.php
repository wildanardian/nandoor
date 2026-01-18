<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FarmPlot extends Model
{
  protected $fillable = [
    'farm_id',
    'name',
    'area_ha',
  ];

  protected $casts = [
    'area_ha' => 'decimal:2',
  ];

  public function farm()
  {
    return $this->belongsTo(Farm::class);
  }

  public function activities()
  {
    return $this->hasMany(FarmActivity::class);
  }
}
