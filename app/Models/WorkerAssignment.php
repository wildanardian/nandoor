<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkerAssignment extends Model
{
  protected $fillable = [
    'worker_id',
    'farm_plot_id',
    'farm_activity_id',
    'assigned_at',
    'wage',
    'status', // pending, done
    'payment_status', // unpaid, paid
  ];

  protected $casts = [
    'assigned_at' => 'date',
    'wage' => 'decimal:2',
  ];

  public function scopeUnpaid($query)
  {
    return $query->where('payment_status', 'unpaid');
  }

  public function activity()
  {
    return $this->belongsTo(FarmActivity::class, 'farm_activity_id');
  }

  public function worker()
  {
    return $this->belongsTo(Worker::class);
  }

  public function farmPlot()
  {
    return $this->belongsTo(FarmPlot::class);
  }
}
