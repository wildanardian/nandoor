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
      $table->boolean('is_archived')->default(false)->after('area_measured_at');
    });

    // Modifying ENUMs is tricky in various DBs.
    // Assuming MySQL, we can use raw statement or specialized package.
    // Or if using standard Schema builder with some DBs it works.
    // But for SQLite (testing) or others it might vary.
    // Given existing code uses enum, I will attempt to modify it.
    // Or better, just ensure we can insert 'editor' without strict schema check if it wasn't enum?
    // Ah, earlier migration used $table->enum(...).

    // Strategy: Change column type to string (varchar) to support anything or re-define enum.
    // Let's redefine enum.

    Schema::table('farm_user_access', function (Blueprint $table) {
      // Note: DBAL might be needed for changing column.
      // If DBAL is missing, raw statement is safer.
      // But let's try standard way first or raw.
      // Raw MySQL: ALTER TABLE farm_user_access MODIFY COLUMN role ENUM('owner','manager','editor','viewer');

      $table->enum('role', ['owner', 'manager', 'editor', 'viewer'])->change();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('farms', function (Blueprint $table) {
      $table->dropColumn('is_archived');
    });

    Schema::table('farm_user_access', function (Blueprint $table) {
      $table->enum('role', ['owner', 'manager', 'viewer'])->change();
    });
  }
};
