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
    Schema::create('incomes', function (Blueprint $table) {
      $table->id();
      $table->foreignId('period_id')->constrained()->cascadeOnDelete();
      $table->foreignId('farm_id')->constrained()->cascadeOnDelete();
      $table->foreignId('farm_plot_id')->nullable()->constrained()->nullOnDelete();
      $table->string('description');
      $table->decimal('quantity', 12, 2);
      $table->decimal('price_per_unit', 15, 2);
      $table->decimal('total_amount', 15, 2);
      $table->date('income_date');
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('incomes');
  }
};
