<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Income extends Model
{
  protected $fillable = [
    'period_id',
    'farm_id',
    'farm_plot_id',
    'description',
    'quantity',
    'price_per_unit',
    'total_amount',
    'income_date',
  ];

  protected $casts = [
    'income_date' => 'date',
  ];
}
