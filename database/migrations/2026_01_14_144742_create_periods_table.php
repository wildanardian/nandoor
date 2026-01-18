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
    Schema::create('periods', function (Blueprint $table) {
      $table->id();
      $table->foreignId('user_id')->constrained()->cascadeOnDelete();
      $table->string('name');
      $table->date('start_date');
      $table->date('end_date')->nullable();
      $table->decimal('opening_balance', 15, 2)->default(0);
      $table->decimal('closing_balance', 15, 2)->default(0);
      $table->enum('status', ['active', 'closed'])->default('active');
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('periods');
  }
};
