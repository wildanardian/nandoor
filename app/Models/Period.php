<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Period extends Model
{
  protected $fillable = [
    'user_id',
    'farm_id',
    'crop_type_id',
    'name',
    'start_date',
    'end_date',
    'opening_balance',
    'closing_balance',
    'status',
  ];

  protected $casts = [
    'start_date' => 'date',
    'end_date' => 'date',
  ];

  public function user()
  {
    return $this->belongsTo(User::class);
  }

  public function farm()
  {
    return $this->belongsTo(Farm::class);
  }

  public function cropType()
  {
    return $this->belongsTo(CropType::class);
  }

  public function farmingSteps()
  {
    return $this->hasMany(FarmingStep::class);
  }
}
