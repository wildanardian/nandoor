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
    Schema::create('farms', function (Blueprint $table) {
      $table->id();
      $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
      $table->foreignId('period_id')->constrained()->cascadeOnDelete();
      $table->foreignId('crop_type_id')->constrained()->cascadeOnDelete();
      $table->string('name');
      $table->decimal('area_ha', 8, 2);
      $table->date('area_measured_at')->nullable();
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('farms');
  }
};
