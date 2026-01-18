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
    Schema::create('farm_activities', function (Blueprint $table) {
      $table->id();
      $table->foreignId('farm_id')->constrained()->cascadeOnDelete();
      $table->foreignId('farm_plot_id')->nullable()->constrained()->nullOnDelete();
      $table->foreignId('farming_step_id')->constrained()->cascadeOnDelete();
      $table->date('start_date')->nullable();
      $table->date('end_date')->nullable();
      $table->enum('status', ['pending', 'in_progress', 'done'])->default('pending');
      $table->text('notes')->nullable();
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('farm_activities');
  }
};
