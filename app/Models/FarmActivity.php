<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FarmActivity extends Model
{
  protected $guarded = ['id'];

  protected $casts = [
    'start_date' => 'date',
    'end_date' => 'date',
  ];

  public function farm()
  {
    return $this->belongsTo(Farm::class);
  }

  public function farmingStep()
  {
    return $this->belongsTo(FarmingStep::class);
  }

  public function expenses()
  {
    return $this->hasMany(Expense::class);
  }

  public function workerAssignments()
  {
    return $this->hasMany(WorkerAssignment::class);
  }

  public function workerPayments()
  {
    return $this->hasMany(WorkerPayment::class);
  }
}
