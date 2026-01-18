<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class FarmWorker extends Pivot
{
  protected $table = 'farm_workers';

  protected $fillable = [
    'farm_id',
    'worker_id',
    'is_active',
    'joined_at',
  ];

  protected $casts = [
    'is_active' => 'boolean',
    'joined_at' => 'date',
  ];
}
