<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryPurchase extends Model
{
  protected $fillable = [
    'inventory_item_id',
    'farm_id',
    'period_id',
    'expense_id',
    'quantity',
    'price_per_unit',
    'purchase_date'
  ];

  protected $casts = [
    'purchase_date' => 'date',
    'quantity' => 'decimal:2',
    'price_per_unit' => 'decimal:2',
  ];

  public function item()
  {
    return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
  }
}
