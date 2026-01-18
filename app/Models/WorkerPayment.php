<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class WorkerPayment extends Model
{
  protected $fillable = [
    'worker_id',
    'farm_activity_id',
    'payment_type', // 'kasbon', 'bayar'
    'payment_type', // 'kasbon', 'bayar'
    'amount',
    'amount_paid', // For tracking debt repayment
    'payment_date',
    'notes',
    'status', // 'paid', 'unpaid' (for kasbon)
  ];

  protected $casts = [
    'payment_date' => 'date',
    'amount' => 'decimal:2',
  ];

  public function worker()
  {
    return $this->belongsTo(Worker::class);
  }

  public function activity()
  {
    return $this->belongsTo(FarmActivity::class, 'farm_activity_id');
  }

  // Scopes
  public function scopeKasbon(Builder $query)
  {
    return $query->where('payment_type', 'kasbon');
  }

  public function scopePayment(Builder $query)
  {
    return $query->where('payment_type', 'bayar');
  }

  public function scopeUnpaid(Builder $query)
  {
    return $query->where('status', 'unpaid');
  }
}
