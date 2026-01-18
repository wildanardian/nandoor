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
    // Warn: This will wipe existing farming_steps data as structure changes completely.
    // Assuming development env or acceptable data loss for refactor.
    // If needed we could migrate data, but logic is too different.

    Schema::table('farming_steps', function (Blueprint $table) {
      // Drop old columns
      $table->dropForeign(['crop_type_id']); // Assuming constraint name
      $table->dropColumn(['crop_type_id', 'name', 'step_order', 'is_repeatable', 'is_active']);

      // Add new columns
      $table->foreignId('farm_id')->constrained()->cascadeOnDelete()->after('id');
      $table->foreignId('period_id')->nullable()->constrained()->nullOnDelete()->after('farm_id');
      $table->foreignId('master_step_id')->constrained('master_farming_steps')->cascadeOnDelete()->after('period_id');

      $table->enum('status', ['pending', 'active', 'done', 'skipped'])->default('pending')->after('master_step_id');
      $table->date('started_at')->nullable()->after('status');
      $table->date('finished_at')->nullable()->after('started_at');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('farming_steps', function (Blueprint $table) {
      // Drop new
      $table->dropForeign(['farm_id']);
      $table->dropForeign(['period_id']);
      $table->dropForeign(['master_step_id']);
      $table->dropColumn(['farm_id', 'period_id', 'master_step_id', 'status', 'started_at', 'finished_at']);

      // Restore old (approximate)
      $table->foreignId('crop_type_id')->nullable()->constrained();
      $table->string('name')->nullable();
      $table->integer('step_order')->default(0);
      $table->boolean('is_repeatable')->default(false);
      $table->boolean('is_active')->default(true);
    });
  }
};
