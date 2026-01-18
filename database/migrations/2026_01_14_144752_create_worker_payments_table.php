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
    Schema::create('worker_payments', function (Blueprint $table) {
      $table->id();
      $table->foreignId('worker_id')->constrained()->cascadeOnDelete();
      $table->foreignId('farm_activity_id')->constrained()->cascadeOnDelete();
      $table->enum('payment_type', ['kasbon', 'bayar']);
      $table->decimal('amount', 15, 2);
      $table->date('payment_date');
      $table->text('notes')->nullable();
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('worker_payments');
  }
};
