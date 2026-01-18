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
    Schema::create('worker_settlements', function (Blueprint $table) {
      $table->id();
      $table->foreignId('worker_id')->constrained()->cascadeOnDelete();
      $table->decimal('total_earnings', 15, 2);
      $table->decimal('total_kasbon', 15, 2);
      $table->decimal('cash_paid', 15, 2);
      $table->date('settlement_date');
      $table->text('notes')->nullable();
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('worker_settlements');
  }
};
