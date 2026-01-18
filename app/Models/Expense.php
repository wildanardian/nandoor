<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
  protected $fillable = [
    'period_id',
    'farm_id',
    'farm_activity_id',
    'type',
    'description',
    'amount',
    'expense_date',
  ];

  protected $casts = [
    'expense_date' => 'date',
  ];

  public function farmActivity()
  {
    return $this->belongsTo(FarmActivity::class);
  }

  public function farm()
  {
    return $this->belongsTo(Farm::class);
  }

  public function period()
  {
    return $this->belongsTo(Period::class);
  }
}
