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
    Schema::create('expenses', function (Blueprint $table) {
      $table->id();
      $table->foreignId('period_id')->constrained()->cascadeOnDelete();
      $table->foreignId('farm_id')->nullable()->constrained()->nullOnDelete();
      $table->foreignId('farm_activity_id')->nullable()->constrained()->nullOnDelete();
      $table->enum('type', ['fertilizer', 'chemical', 'labor', 'tool', 'other']);
      $table->string('description');
      $table->decimal('amount', 15, 2);
      $table->date('expense_date');
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('expenses');
  }
};
