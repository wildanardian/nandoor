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
    Schema::create('farm_workers', function (Blueprint $table) {
      $table->id();
      $table->foreignId('farm_id')->constrained()->cascadeOnDelete();
      $table->foreignId('worker_id')->constrained()->cascadeOnDelete();
      $table->boolean('is_active')->default(true);
      $table->date('joined_at')->nullable();
      $table->timestamps();

      $table->unique(['farm_id', 'worker_id']);
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('farm_workers');
  }
};
