<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryUsage extends Model
{
  protected $fillable = [
    'inventory_item_id',
    'farm_id',
    'period_id',
    'farming_step_id',
    'quantity_used',
    'usage_date',
    'notes'
  ];

  protected $casts = [
    'usage_date' => 'date',
    'quantity_used' => 'decimal:2',
  ];

  public function item()
  {
    return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
  }

  public function farmingStep()
  {
    return $this->belongsTo(FarmingStep::class);
  }
}
