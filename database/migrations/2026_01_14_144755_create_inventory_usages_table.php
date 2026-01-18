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
    Schema::create('inventory_usages', function (Blueprint $table) {
      $table->id();
      $table->foreignId('inventory_item_id')->constrained()->cascadeOnDelete();
      $table->foreignId('farm_activity_id')->constrained()->cascadeOnDelete();
      $table->foreignId('period_id')->constrained()->cascadeOnDelete();
      $table->decimal('quantity_used', 12, 2);
      $table->date('usage_date');
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('inventory_usages');
  }
};
