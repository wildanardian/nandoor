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
    Schema::table('worker_payments', function (Blueprint $table) {
      $table->foreignId('farm_activity_id')->nullable()->change();
      $table->enum('status', ['paid', 'unpaid'])->default('paid')->after('payment_type');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('worker_payments', function (Blueprint $table) {
      $table->foreignId('farm_activity_id')->nullable(false)->change();
      $table->dropColumn('status');
    });
  }
};
