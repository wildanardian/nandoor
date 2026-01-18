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
    Schema::table('workers', function (Blueprint $table) {
      $table->dropForeign(['user_id']);
      $table->dropColumn('user_id');
      $table->foreignId('farm_id')->after('id')->constrained()->cascadeOnDelete();
      $table->text('notes')->nullable()->after('phone');
      $table->boolean('is_active')->default(true)->after('notes');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('workers', function (Blueprint $table) {
      $table->dropForeign(['farm_id']);
      $table->dropColumn(['farm_id', 'notes', 'is_active']);
      $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    });
  }
};
