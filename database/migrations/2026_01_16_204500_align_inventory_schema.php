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
    // 1. Inventory Items
    Schema::table('inventory_items', function (Blueprint $table) {
      // Drop user_id if exists (it was in the previous migration view)
      $table->dropForeign(['user_id']);
      $table->dropColumn('user_id');
      // Drop static stock if we strictly follow "calculated only"
      $table->dropColumn('current_quantity');

      // Add new requirements
      $table->foreignId('farm_id')->after('id')->constrained()->cascadeOnDelete();
      $table->string('category')->after('name')->nullable(); // pupuk, obat, etc
      $table->integer('min_stock')->default(0)->after('unit');
    });

    // 2. Inventory Purchases
    Schema::table('inventory_purchases', function (Blueprint $table) {
      $table->foreignId('farm_id')->after('id')->constrained()->cascadeOnDelete();
    });

    // 3. Inventory Usages
    Schema::table('inventory_usages', function (Blueprint $table) {
      $table->foreignId('farm_id')->after('id')->constrained()->cascadeOnDelete();

      // Allow nullable farming_step_id
      $table->foreignId('farming_step_id')->nullable()->after('period_id')->constrained()->nullOnDelete();
      $table->text('notes')->nullable()->after('usage_date');

      // Drop old column if it existed and is replaced by farming_step_id or redundant
      // The previous migration had 'farm_activity_id'. 
      // If we want to keep it as relation to generic activity, we can, but user asked for farming_step_id
      // Let's make farm_activity_id nullable or drop it if unused. For now I'll make it nullable to avoid breaking if used elsewhere
      $table->dropForeign(['farm_activity_id']);
      $table->dropColumn('farm_activity_id');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    // basic reverse
    Schema::table('inventory_items', function (Blueprint $table) {
      $table->foreignId('user_id')->constrained()->cascadeOnDelete();
      $table->decimal('current_quantity', 12, 2)->default(0);
      $table->dropForeign(['farm_id']);
      $table->dropColumn(['farm_id', 'category', 'min_stock']);
    });
  }
};
