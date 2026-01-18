<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PlantTypeSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $types = [
      ['name' => 'Padi', 'slug' => 'padi'],
      ['name' => 'Tebu', 'slug' => 'tebu'],
    ];

    foreach ($types as $type) {
      \App\Models\PlantType::firstOrCreate(
        ['slug' => $type['slug']],
        ['name' => $type['name'], 'is_active' => true]
      );
    }
  }
}
