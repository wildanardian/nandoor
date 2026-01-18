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
    // 1. Drop active foreign keys first
    Schema::table('farms', function (Blueprint $table) {
      $table->dropForeign(['plant_type_id']);
      $table->dropColumn('plant_type_id');
    });

    Schema::table('master_farming_steps', function (Blueprint $table) {
      $table->dropForeign(['plant_type_id']);
      $table->dropColumn('plant_type_id');
    });

    // 2. Drop the table
    Schema::dropIfExists('plant_types');
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    // Re-create table (simplified)
    Schema::create('plant_types', function (Blueprint $table) {
      $table->id();
      $table->string('name');
      $table->string('slug')->unique();
      $table->boolean('is_active')->default(true);
      $table->timestamps();
    });

    Schema::table('farms', function (Blueprint $table) {
      $table->foreignId('plant_type_id')->nullable()->constrained('plant_types')->nullOnDelete();
    });

    Schema::table('master_farming_steps', function (Blueprint $table) {
      $table->foreignId('plant_type_id')->nullable()->constrained('plant_types')->nullOnDelete();
    });
  }
};
