<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
  protected $fillable = [
    'farm_id',
    'name',
    'category',
    'unit',
    'min_stock'
  ];

  public function purchases()
  {
    return $this->hasMany(InventoryPurchase::class);
  }

  public function usages()
  {
    return $this->hasMany(InventoryUsage::class);
  }
}
