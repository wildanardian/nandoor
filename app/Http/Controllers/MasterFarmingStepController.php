<?php

namespace App\Http\Controllers;

use App\Models\CropType;
use App\Models\MasterFarmingStep;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class MasterFarmingStepController extends Controller
{
  public function index()
  {
    $steps = MasterFarmingStep::with('cropType')
      ->orderBy('step_order')
      ->get()
      ->groupBy(function ($item) {
        return $item->crop_type ? $item->crop_type : 'umum';
      });

    // $plantTypes = \App\Models\CropType::where('is_active', true)->get();
    // dd($steps->toArray());

    return Inertia::render('MasterFarmingSteps/Index', [
      'steps' => $steps,
      'cropTypes' => CropType::all(),
    ]);
  }

  public function store(Request $request)
  {
    $validated = $request->validate([
      'name' => 'required|string|max:255',
      'crop_type_id' => 'nullable|exists:crop_types,id',
      'step_order' => [
        'required',
        'integer',
        'min:1',
      ],
      'description' => 'nullable|string',
      'is_active' => 'boolean',
    ]);

    // Manually ensure uniqueness of step_order within the same scope
    $exists = MasterFarmingStep::where('step_order', $request->step_order)
      ->where('crop_type_id', $request->crop_type_id)
      ->when(is_null($request->crop_type_id), function ($query) {
        return $query->whereNotIn('crop_type', ['padi', 'tebu']);
      })
      ->exists();

    if ($exists) {
      return back()->withErrors(['step_order' => 'Urutan step sudah ada untuk jenis tanaman ini.']);
    }

    MasterFarmingStep::create($validated);

    return redirect()->back()->with('success', 'Master step created successfully.');
  }

  public function update(Request $request, $id)
  {
    $step = MasterFarmingStep::findOrFail($id);

    $validated = $request->validate([
      'name' => 'required|string|max:255',
      'crop_type_id' => 'nullable|exists:crop_types,id',
      'step_order' => [
        'required',
        'integer',
        'min:1',
      ],
      'description' => 'nullable|string',
      'is_active' => 'boolean',
    ]);

    // Uniqueness check excluding current record
    // Uniqueness check excluding current record
    $exists = MasterFarmingStep::where('step_order', $request->step_order)
      ->where('crop_type_id', $request->crop_type_id)
      ->where('id', '!=', $id)
      ->when(is_null($request->crop_type_id), function ($query) {
        // If checking for Umum (Null ID), ignore legacy typed records (padi/tebu) that might also have null ID
        return $query->whereNotIn('crop_type', ['padi', 'tebu']);
      })
      ->exists();

    if ($exists) {
      return back()->withErrors(['step_order' => 'Urutan step sudah ada untuk jenis tanaman ini.']);
    }

    $step->update($validated);

    return redirect()->back()->with('success', 'Master step updated successfully.');
  }

  public function destroy($id)
  {
    $step = MasterFarmingStep::findOrFail($id);
    $step->update(['is_active' => false]);

    return redirect()->back()->with('success', 'Master step deactivated successfully.');
  }

  public function reorder(Request $request)
  {
    $validated = $request->validate([
      'crop_type_id' => 'nullable|exists:crop_types,id',
      'ordered_ids' => 'required|array',
      'ordered_ids.*' => 'integer|exists:master_farming_steps,id',
    ]);

    $cropTypeId = $validated['crop_type_id'];
    $orderedIds = $validated['ordered_ids'];

    \Illuminate\Support\Facades\DB::transaction(function () use ($cropTypeId, $orderedIds) {
      foreach ($orderedIds as $index => $id) {
        MasterFarmingStep::where('id', $id)
          ->where('crop_type_id', $cropTypeId) // Ensure safety
          ->update(['step_order' => $index + 1]);
      }
    });

    return redirect()->back()->with('success', 'Urutan tahapan berhasil diperbarui.');
  }
}
