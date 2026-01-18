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
      $table->unsignedBigInteger('period_id')->nullable()->change();
    });

    Schema::table('periods', function (Blueprint $table) {
      $table->foreignId('farm_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('periods', function (Blueprint $table) {
      $table->dropForeign(['farm_id']);
      $table->dropColumn('farm_id');
    });

    Schema::table('farms', function (Blueprint $table) {
      // We won't strictly revert nullable change to avoid data loss on rollback if nulls exist.
    });
  }
};
