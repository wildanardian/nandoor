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
    // 1. Enhance crop_types table
    Schema::table('crop_types', function (Blueprint $table) {
      $table->string('slug')->nullable()->after('name');
      $table->boolean('is_active')->default(true)->after('description');
    });

    // 2. Add crop_type_id to master_farming_steps
    Schema::table('master_farming_steps', function (Blueprint $table) {
      $table->foreignId('crop_type_id')->nullable()->after('plant_type_id')->constrained('crop_types')->nullOnDelete();
    });

    // 3. Migrate Data
    $plantTypes = \Illuminate\Support\Facades\DB::table('plant_types')->get();

    foreach ($plantTypes as $plantType) {
      // Find or Create in crop_types
      $cropType = \Illuminate\Support\Facades\DB::table('crop_types')
        ->where('name', $plantType->name)
        ->first();

      if (!$cropType) {
        $id = \Illuminate\Support\Facades\DB::table('crop_types')->insertGetId([
          'name' => $plantType->name,
          'slug' => $plantType->slug,
          'description' => null,
          'is_active' => $plantType->is_active,
          'created_at' => now(),
          'updated_at' => now(),
        ]);
        $cropType = \Illuminate\Support\Facades\DB::table('crop_types')->find($id);
      } else {
        \Illuminate\Support\Facades\DB::table('crop_types')
          ->where('id', $cropType->id)
          ->update([
            'slug' => $plantType->slug,
            'is_active' => $plantType->is_active
          ]);
      }

      // 4. Update References
      \Illuminate\Support\Facades\DB::table('farms')
        ->where('plant_type_id', $plantType->id)
        ->update(['crop_type_id' => $cropType->id]);

      \Illuminate\Support\Facades\DB::table('master_farming_steps')
        ->where('plant_type_id', $plantType->id)
        ->update(['crop_type_id' => $cropType->id]);
    }
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('master_farming_steps', function (Blueprint $table) {
      $table->dropForeign(['crop_type_id']);
      $table->dropColumn('crop_type_id');
    });

    Schema::table('crop_types', function (Blueprint $table) {
      $table->dropColumn(['slug', 'is_active']);
    });
  }
};
