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
    Schema::table('periods', function (Blueprint $table) {
      $table->foreignId('crop_type_id')->nullable()->after('farm_id')->constrained('crop_types')->nullOnDelete();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('periods', function (Blueprint $table) {
      $table->dropForeign(['crop_type_id']);
      $table->dropColumn('crop_type_id');
    });
  }
};
