<?php

namespace App\Http\Controllers;

use App\Models\FarmPlot;
use Illuminate\Http\Request;

class FarmPlotController extends Controller
{
  /**
   * Display a listing of the resource.
   */
  public function index()
  {
    //
  }

  /**
   * Show the form for creating a new resource.
   */
  public function create()
  {
    //
  }

  /**
   * Store a newly created resource in storage.
   */
  public function store(Request $request, \App\Models\Farm $farm)
  {
    if (!$request->user()->canAccessFarm($farm)) {
      abort(403, 'Unauthorized');
    }

    $validated = $request->validate([
      'name' => 'required|string|max:255',
      'area_ha' => 'required|numeric|min:0.01',
    ]);

    // Validate total area
    $currentTotal = $farm->plots()->sum('area_ha');
    if (($currentTotal + $validated['area_ha']) > $farm->area_ha) {
      return redirect()->back()->withErrors(['area_ha' => 'Total luas petak melebihi luas sawah (' . $farm->area_ha . ' Ha). Sisa: ' . ($farm->area_ha - $currentTotal) . ' Ha']);
    }

    $farm->plots()->create($validated);

    return redirect()->back()->with('success', 'Petak sawah berhasil ditambahkan.');
  }

  public function update(Request $request, FarmPlot $farmPlot)
  {
    $farm = $farmPlot->farm;
    if (!$request->user()->canAccessFarm($farm)) {
      abort(403, 'Unauthorized');
    }

    $validated = $request->validate([
      'name' => 'required|string|max:255',
      'area_ha' => 'required|numeric|min:0.01',
    ]);

    // Validate total area (exclude current plot)
    $currentTotal = $farm->plots()->where('id', '!=', $farmPlot->id)->sum('area_ha');
    if (($currentTotal + $validated['area_ha']) > $farm->area_ha) {
      return redirect()->back()->withErrors(['area_ha' => 'Total luas petak melebihi luas sawah (' . $farm->area_ha . ' Ha). Sisa: ' . ($farm->area_ha - $currentTotal) . ' Ha']);
    }

    $farmPlot->update($validated);

    return redirect()->back()->with('success', 'Petak sawah berhasil diperbarui.');
  }

  public function destroy(Request $request, FarmPlot $farmPlot)
  {
    $farm = $farmPlot->farm;
    if (!$request->user()->canAccessFarm($farm)) {
      abort(403, 'Unauthorized');
    }

    $farmPlot->delete();

    return redirect()->back()->with('success', 'Petak sawah berhasil dihapus.');
  }
}
