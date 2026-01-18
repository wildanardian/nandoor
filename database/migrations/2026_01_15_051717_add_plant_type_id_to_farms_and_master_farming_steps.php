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
    Schema::table('farms', function (Blueprint $table) {
      $table->foreignId('plant_type_id')->nullable()->constrained('plant_types')->nullOnDelete();
    });

    Schema::table('master_farming_steps', function (Blueprint $table) {
      $table->foreignId('plant_type_id')->nullable()->constrained('plant_types')->nullOnDelete();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('farms', function (Blueprint $table) {
      $table->dropForeign(['plant_type_id']);
      $table->dropColumn('plant_type_id');
    });

    Schema::table('master_farming_steps', function (Blueprint $table) {
      $table->dropForeign(['plant_type_id']);
      $table->dropColumn('plant_type_id');
    });
  }
};
