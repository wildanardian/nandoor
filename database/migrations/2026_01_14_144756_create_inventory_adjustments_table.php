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
    Schema::create('inventory_adjustments', function (Blueprint $table) {
      $table->id();
      $table->foreignId('inventory_item_id')->constrained()->cascadeOnDelete();
      $table->enum('type', ['rusak', 'hilang', 'selisih', 'koreksi', 'konversi']);
      $table->decimal('quantity', 12, 2);
      $table->date('adjustment_date');
      $table->text('notes')->nullable();
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('inventory_adjustments');
  }
};
