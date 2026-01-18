<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  /**
   * Run the migrations.
   */
  public function up(): void
  {
    Schema::create('inventory_purchases', function (Blueprint $table) {
      $table->id();
      $table->foreignId('inventory_item_id')->constrained()->cascadeOnDelete();
      $table->foreignId('period_id')->constrained()->cascadeOnDelete();
      $table->foreignId('expense_id')->constrained()->cascadeOnDelete();
      $table->decimal('quantity', 12, 2);
      $table->decimal('price_per_unit', 15, 2);
      $table->date('purchase_date');
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('inventory_purchases');
  }
};
