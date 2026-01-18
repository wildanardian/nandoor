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
    // 1. Update Users Table
    Schema::table('users', function (Blueprint $table) {
      $table->string('role')->change();
    });

    // Map existing data: 'owner' & 'admin' -> 'admin', others -> 'umum'
    DB::table('users')->whereIn('role', ['owner', 'admin'])->update(['role' => 'admin']);
    DB::table('users')->whereNotIn('role', ['admin'])->update(['role' => 'umum']);

    Schema::table('users', function (Blueprint $table) {
      $table->enum('role', ['admin', 'umum'])->default('umum')->change();
    });

    // 2. Update Farm User Access Table
    Schema::table('farm_user_access', function (Blueprint $table) {
      $table->string('role')->change();
    });

    // Map existing data: 'owner' -> 'pemilik', others -> 'anggota'
    DB::table('farm_user_access')->where('role', 'owner')->update(['role' => 'pemilik']);
    DB::table('farm_user_access')->whereNot('role', 'pemilik')->update(['role' => 'anggota']);

    Schema::table('farm_user_access', function (Blueprint $table) {
      $table->enum('role', ['pemilik', 'anggota'])->default('anggota')->change();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('users', function (Blueprint $table) {
      $table->string('role')->change();
    });

    // Revert mapping best effort
    DB::table('users')->where('role', 'umum')->update(['role' => 'member']);

    Schema::table('users', function (Blueprint $table) {
      $table->enum('role', ['owner', 'admin', 'member'])->default('member')->change();
    });

    Schema::table('farm_user_access', function (Blueprint $table) {
      $table->string('role')->change();
    });

    DB::table('farm_user_access')->where('role', 'pemilik')->update(['role' => 'owner']);
    DB::table('farm_user_access')->where('role', 'anggota')->update(['role' => 'viewer']);

    Schema::table('farm_user_access', function (Blueprint $table) {
      $table->enum('role', ['owner', 'manager', 'viewer'])->default('viewer')->change();
    });
  }
};
