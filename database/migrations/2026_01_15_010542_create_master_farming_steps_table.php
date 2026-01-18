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
    Schema::create('master_farming_steps', function (Blueprint $table) {
      $table->id();
      $table->string('name');
      $table->enum('crop_type', ['umum', 'padi', 'tebu']);
      $table->integer('step_order');
      $table->text('description')->nullable();
      $table->boolean('is_active')->default(true);
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('master_farming_steps');
  }
};
