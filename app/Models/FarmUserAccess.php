<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FarmUserAccess extends Model
{
  protected $table = 'farm_user_access'; // Explicit table name

  protected $fillable = [
    'farm_id',
    'user_id',
    'role',
  ];

  public function farm()
  {
    return $this->belongsTo(Farm::class);
  }

  public function user()
  {
    return $this->belongsTo(User::class);
  }
}
