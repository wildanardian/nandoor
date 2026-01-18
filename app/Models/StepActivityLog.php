<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StepActivityLog extends Model
{
  protected $fillable = ['farming_step_id', 'action', 'description', 'actor_id'];

  public function step()
  {
    return $this->belongsTo(FarmingStep::class, 'farming_step_id');
  }

  public function actor()
  {
    return $this->belongsTo(User::class, 'actor_id');
  }
}
