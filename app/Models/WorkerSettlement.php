<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkerSettlement extends Model
{
  protected $fillable = [
    'worker_id',
    'total_earnings',
    'total_kasbon',
    'cash_paid',
    'settlement_date',
    'notes',
  ];

  protected $casts = [
    'total_earnings' => 'decimal:2',
    'total_kasbon' => 'decimal:2',
    'cash_paid' => 'decimal:2',
    'settlement_date' => 'date',
  ];

  public function worker()
  {
    return $this->belongsTo(Worker::class);
  }
}
