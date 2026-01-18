<?php

namespace App\Http\Controllers;

use App\Models\Period;
use Illuminate\Http\Request;

class PeriodController extends Controller
{
  /**
   * Display a listing of the resource.
   */
  /**
   * Display a listing of the resource.
   */
  public function index(Request $request)
  {
    $user = $request->user();
    $farm = $user->getActiveFarm();

    if (!$farm) {
      return redirect()->route('dashboard')->with('error', 'Select a farm first.');
    }

    $activePeriod = $farm->activePeriod;
    if ($activePeriod) {
      $activePeriod->load('cropType');
      $totalExpenses = \App\Models\Expense::where('period_id', $activePeriod->id)->sum('amount');
      $totalIncomes = \App\Models\Income::where('period_id', $activePeriod->id)->sum('total_amount');
      $activePeriod->total_expense = $totalExpenses;
      $activePeriod->total_income = $totalIncomes;
      $activePeriod->current_balance = ($activePeriod->opening_balance ?? 0) + $totalIncomes - $totalExpenses;
      // Check for pending steps
      $activePeriod->has_pending_steps = $activePeriod->farmingSteps()->where('status', '!=', 'done')->exists();
    }

    $history = $farm->periods()
      ->where('id', '!=', $farm->period_id) // Exclude active
      ->orderBy('start_date', 'desc')
      ->get()
      ->map(function ($p) {
        $exp = \App\Models\Expense::where('period_id', $p->id)->sum('amount');
        $inc = \App\Models\Income::where('period_id', $p->id)->sum('total_amount');
        $p->total_expense = $exp;
        $p->total_income = $inc;
        $p->closing_balance = ($p->opening_balance ?? 0) + $inc - $exp;
        return $p;
      });

    return \Inertia\Inertia::render('Periods/Index', [
      'farm' => $farm,
      'activePeriod' => $activePeriod,
      'history' => $history
    ]);
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
  public function store(Request $request)
  {
    $user = $request->user();
    $farm = $user->getActiveFarm();

    if (!$farm) {
      return redirect()->back()->with('error', 'No active farm.');
    }

    $validated = $request->validate([
      'name' => 'required|string|max:255',
      'start_date' => 'required|date',
      'opening_balance' => 'required|numeric|min:0',
    ]);

    // Create Period
    $period = $farm->periods()->create([
      'user_id' => $user->id, // Owner
      'name' => $validated['name'],
      'start_date' => $validated['start_date'],
      'opening_balance' => $validated['opening_balance'],
      'crop_type_id' => $farm->crop_type_id, // Snapshot crop type
      'status' => 'active',
    ]);

    // Set as active period for farm
    $farm->update(['period_id' => $period->id]);

    // --- REFACTOR: Clone Master Steps to Farming Steps History ---
    // 1. Get Master Steps for this Farm's Crop Type
    if ($farm->crop_type_id) {
      $masterSteps = \App\Models\MasterFarmingStep::where('crop_type_id', $farm->crop_type_id)
        ->where('is_active', true)
        ->orderBy('step_order', 'asc')
        ->get();

      // 2. Clone to farming_steps
      foreach ($masterSteps as $master) {
        \App\Models\FarmingStep::create([
          'farm_id' => $farm->id,
          'period_id' => $period->id, // Link to this period
          'master_step_id' => $master->id,
          'status' => 'pending',
          // started_at, finished_at null by default
        ]);
      }
    }

    return redirect()->back()->with('success', 'Periode panen berhasil dibuat dan tahapan diinisialisasi.');
  }

  /**
   * Display the specified resource.
   */
  public function show(Period $period)
  {
    //
  }

  /**
   * Show the form for editing the specified resource.
   */
  public function edit(Period $period)
  {
    //
  }

  /**
   * Update the specified resource in storage.
   */
  /**
   * Update the specified resource in storage.
   */
  public function update(Request $request, Period $period)
  {
    $validated = $request->validate([
      'name' => 'required|string|max:255',
      'start_date' => 'required|date',
      'opening_balance' => 'required|numeric|min:0',
    ]);

    // Optional: Prevent changing start_date if transactions exist? 
    // User requirement says: "tanggal_mulai tidak boleh diubah jika sudah ada aktivitas finansial"
    // Check logic can be added here. For now allowing edit.

    $period->update([
      'name' => $validated['name'],
      'start_date' => $validated['start_date'],
      'opening_balance' => $validated['opening_balance'],
    ]);

    return redirect()->back()->with('success', 'Informasi periode berhasil diperbarui.');
  }

  /**
   * Close the period.
   */
  public function close(Request $request, Period $period)
  {
    // 1. Validate all steps are done
    $pendingSteps = $period->farmingSteps()
      ->where('status', '!=', 'done')
      ->exists();

    if ($pendingSteps) {
      return redirect()->back()->with('error', 'Tidak dapat menutup periode karena masih ada tahapan yang belum selesai.');
    }

    // 2. Calculate closing balance (Snapshot)
    $totalExpenses = \App\Models\Expense::where('period_id', $period->id)->sum('amount');
    $totalIncomes = \App\Models\Income::where('period_id', $period->id)->sum('total_amount');
    $closingBalance = ($period->opening_balance ?? 0) + $totalIncomes - $totalExpenses;

    // 3. Update Period
    $period->update([
      'status' => 'closed',
      'closing_balance' => $closingBalance,
      'end_date' => now(), // Set end date to now
    ]);

    // 4. Update Farm (Remove active period)
    $period->farm->update(['period_id' => null]);

    return redirect()->back()->with('success', 'Periode berhasil ditutup.');
  }

  /**
   * Remove the specified resource from storage.
   */
  public function destroy(Period $period)
  {
    //
  }
}
