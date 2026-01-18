<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
  /**
   * Run the migrations.
   */
  public function up(): void
  {
    // 1. Create step_activity_logs table
    Schema::dropIfExists('step_activity_logs');
    Schema::create('step_activity_logs', function (Blueprint $table) {
      $table->id();
      $table->foreignId('farming_step_id')->constrained()->cascadeOnDelete();
      $table->string('action'); // e.g., 'started', 'finished', 'cost_added'
      $table->text('description')->nullable();
      $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
      $table->timestamps();
    });

    // 2. Modify farming_steps.status
    // A. Expand Enum to include new values
    DB::statement("ALTER TABLE farming_steps MODIFY COLUMN status ENUM('pending', 'active', 'done', 'skipped', 'draft', 'in_progress', 'finished', 'locked') DEFAULT 'draft'");

    // B. Convert old statuses
    DB::statement("UPDATE farming_steps SET status = 'draft' WHERE status = 'pending'");
    DB::statement("UPDATE farming_steps SET status = 'in_progress' WHERE status = 'active'");
    DB::statement("UPDATE farming_steps SET status = 'finished' WHERE status IN ('done', 'skipped')");

    // C. Restrict Enum to new values
    DB::statement("ALTER TABLE farming_steps MODIFY COLUMN status ENUM('draft', 'in_progress', 'finished', 'locked') DEFAULT 'draft'");


    // 3. Modify farm_activities.status
    // A. Expand Enum
    // Note: checking existing values first. Previous schema had ['pending', 'in_progress', 'done']
    DB::statement("ALTER TABLE farm_activities MODIFY COLUMN status ENUM('pending', 'in_progress', 'done', 'draft', 'finished', 'locked') DEFAULT 'draft'");

    // B. Convert old statuses
    DB::statement("UPDATE farm_activities SET status = 'draft' WHERE status = 'pending'");
    DB::statement("UPDATE farm_activities SET status = 'finished' WHERE status = 'done'");
    // in_progress stays in_progress

    // C. Restrict Enum
    DB::statement("ALTER TABLE farm_activities MODIFY COLUMN status ENUM('draft', 'in_progress', 'finished', 'locked') DEFAULT 'draft'");
  }

  public function down(): void
  {
    Schema::dropIfExists('step_activity_logs');

    // Revert is risky due to data loss, simplified revert:
    Schema::table('farming_steps', function (Blueprint $table) {
      // We can't easily revert 'locked' or distinguish 'draft' from 'pending' without more logic
      // For now just allow the old values back
      $table->enum('status', ['pending', 'active', 'done', 'skipped'])->default('pending')->change();
    });

    Schema::table('farm_activities', function (Blueprint $table) {
      $table->enum('status', ['pending', 'in_progress', 'done'])->default('pending')->change();
    });
  }
};
