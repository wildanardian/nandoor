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
    Schema::table('worker_assignments', function (Blueprint $table) {
      $table->decimal('wage', 15, 2)->nullable()->after('farm_activity_id');
      $table->enum('status', ['pending', 'done'])->default('pending')->after('wage');
    });

    Schema::table('worker_payments', function (Blueprint $table) {
      $table->decimal('amount_paid', 15, 2)->default(0)->after('amount');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('worker_assignments', function (Blueprint $table) {
      $table->dropColumn(['wage', 'status']);
    });

    Schema::table('worker_payments', function (Blueprint $table) {
      $table->dropColumn('amount_paid');
    });
  }
};
