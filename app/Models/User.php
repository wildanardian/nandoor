<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
  /** @use HasFactory<\Database\Factories\UserFactory> */
  use HasFactory, Notifiable;

  /* Roles */
  const ROLE_ADMIN = 'admin';
  const ROLE_UMUM = 'umum';


  /**
   * The attributes that are mass assignable.
   *
   * @var list<string>
   */
  protected $fillable = [
    'name',
    'username',
    'email',
    'role',
    'is_active',
    'password',
  ];

  /**
   * The attributes that should be hidden for serialization.
   *
   * @var list<string>
   */
  protected $hidden = [
    'password',
    'remember_token',
  ];

  /**
   * Get the attributes that should be cast.
   *
   * @return array<string, string>
   */
  protected function casts(): array
  {
    return [
      'email_verified_at' => 'datetime',
      'password' => 'hashed',
      'is_active' => 'boolean',
    ];
  }

  /**
   * Scope a query to only include active users.
   */
  public function scopeActive($query)
  {
    return $query->where('is_active', true);
  }

  public function farms()
  {
    return $this->hasMany(Farm::class, 'owner_id');
  }

  public function accessibleFarms()
  {
    return $this->belongsToMany(Farm::class, 'farm_user_access')
      ->withPivot('role')
      ->withTimestamps();
  }

  /**
   * Get the currently active farm for the user.
   * Uses session 'active_farm_id' or falls back to first available.
   */
  public function getActiveFarm(): ?Farm
  {
    $farmId = session('active_farm_id');

    if ($farmId) {
      // Check if user still has access
      $farm = $this->farms()->find($farmId) ?? $this->accessibleFarms()->find($farmId);
      if ($farm) {
        return $farm;
      }
    }

    // Fallback: First owned or First accessible
    $fallbackFarm = $this->farms()->first() ?? $this->accessibleFarms()->first();

    if ($fallbackFarm) {
      session(['active_farm_id' => $fallbackFarm->id]);
      return $fallbackFarm;
    }

    return null;
  }

  public function canAccessFarm(Farm $farm): bool
  {
    return $this->id === $farm->owner_id ||
      $this->accessibleFarms()->where('farm_id', $farm->id)->exists();
  }

  public function isAdmin(): bool
  {
    return $this->role === self::ROLE_ADMIN;
  }
}
