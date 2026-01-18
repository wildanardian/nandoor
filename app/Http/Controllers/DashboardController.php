<?php

namespace App\Http\Controllers;

use App\Models\CropType;
use App\Models\Expense;
use App\Models\FarmingStep;
use App\Models\Income;
use App\Models\Period;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
  /**
   * Display a listing of the resource.
   */
  public function index(Request $request)
  {
    /** @var \App\Models\User $user */
    $user = Auth::user();
    $farm = $user->getActiveFarm();
    $farmingSteps = [];

    if ($farm) {
      $farmingSteps = FarmingStep::where('farm_id', $farm->id)
        ->with('masterStep')
        ->get()
        ->sortBy(function ($step) {
          return $step->masterStep->step_order ?? $step->id;
        })
        ->map(function ($step) {
          // Normalize status for frontend
          // 'done' -> Green with checkmark
          // 'active' -> Yellow with pulse
          // 'pending' -> Gray

          $status = 'pending';

          if (in_array($step->status, ['finished', 'locked'])) {
            $status = 'done';
          } elseif ($step->status === 'in_progress') {
            $status = 'active';
          }

          return [
            'id' => $step->id,
            'name' => $step->name,
            'status' => $status,
          ];
        })
        ->values();
    }

    $cropTypeMissing = $farm && is_null($farm->crop_type_id);
    $hasActivePeriod = $farm && $farm->activePeriod()->exists();

    // Financial Data
    $totalBalance = 0;
    $periodExpense = 0;
    $periodIncome = 0;
    $lastPayments = [];

    if ($farm) {
      // Total Balance (All time)
      // Formula: Sum(Opening Balance All Periods) + Sum(All Incomes) - Sum(All Expenses)
      $totalOpeningBalance = Period::where('farm_id', $farm->id)->sum('opening_balance');
      $totalIncomeAllTime = Income::where('farm_id', $farm->id)->sum('total_amount');
      $totalExpenseAllTime = Expense::where('farm_id', $farm->id)->sum('amount');

      $totalBalance = $totalOpeningBalance + $totalIncomeAllTime - $totalExpenseAllTime;

      // Current Period Stats
      $activePeriod = $farm->activePeriod;
      if ($activePeriod) {
        $periodExpense = Expense::where('period_id', $activePeriod->id)->sum('amount');
        $periodIncome = Income::where('period_id', $activePeriod->id)->sum('total_amount');
      }

      // Last Payments (Expenses)
      $lastPayments = Expense::where('farm_id', $farm->id)
        ->latest('expense_date')
        ->latest('created_at')
        ->take(10)
        ->get()
        ->map(function ($expense) {
          return [
            'id' => $expense->id,
            'title' => $expense->name ?: $expense->description, // Fallback to description if name empty
            'date' => $expense->expense_date ? $expense->expense_date->translatedFormat('d M Y') : $expense->created_at->translatedFormat('d M Y'),
            'amount' => $expense->amount,
            // You might want to include category or receiver info if available
            // For now using 'name' as main label as per existing data structure usually having 'name' or 'description'
          ];
        });
    }

    $activeWorkers = [];
    $inventoryItems = [];
    $activeActivities = [];

    if ($farm) {
      $activeWorkers = $farm->workers()
        ->where('workers.is_active', true)
        ->wherePivot('is_active', true)
        ->get();

      $inventoryItems = \App\Models\InventoryItem::where('farm_id', $farm->id)
        ->withSum('purchases', 'quantity')
        ->withSum('usages', 'quantity_used')
        ->get()
        ->map(function ($item) {
          $item->stock = ($item->purchases_sum_quantity ?? 0) - ($item->usages_sum_quantity_used ?? 0);
          return $item;
        })
        ->values();

      $activeActivities = $farm->farmActivities()
        ->whereIn('status', ['in_progress', 'pending'])
        ->get()
        ->map(function ($activity) {
          $statusLabel = match ($activity->status) {
            'in_progress' => 'Sedang Berlangsung',
            'pending' => 'Menunggu',
            'done' => 'Selesai',
            default => $activity->status,
          };
          return [
            'id' => $activity->id,
            'name' => $activity->farmingStep->name . ' (' . $statusLabel . ')',
          ];
        });
    }

    // Onboarding Status Calculation
    $onboarding = [
      'has_farm' => $farm !== null,
      'has_plots' => $farm && $farm->plots()->exists(),
      'has_period' => $farm && $farm->periods()->exists(), // Any period (active or history) counts as "created"
      'has_active_period' => $hasActivePeriod, // Specifically for the "Period Aktif" check
      'has_farming_steps' => count($farmingSteps) > 0,
      'has_activity' => $farm && (
        \App\Models\Expense::where('farm_id', $farm->id)->exists() ||
        \App\Models\Income::where('farm_id', $farm->id)->exists() ||
        $farm->workers()->exists() ||
        \App\Models\InventoryItem::where('farm_id', $farm->id)->exists()
      ),
      'is_completed' => $farm && $farm->onboarding_completed_at !== null,
    ];

    return Inertia::render('Dashboard', [
      'farmingSteps' => $farmingSteps,
      'cropTypeMissing' => $cropTypeMissing,
      'hasActivePeriod' => $hasActivePeriod,
      'summary' => [
        'totalBalance' => $totalBalance,
        'periodExpense' => $periodExpense,
        'periodIncome' => $periodIncome,
      ],
      'lastPayments' => $lastPayments,
      'activeWorkers' => $activeWorkers,
      'inventoryItems' => $inventoryItems,
      'activeActivities' => $activeActivities,
      'onboarding' => $onboarding,
    ]);
  }

  public function completeOnboarding(Request $request)
  {
    /** @var \App\Models\User $user */
    $user = Auth::user();
    $farm = $user->getActiveFarm();

    if ($farm) {
      $farm->update(['onboarding_completed_at' => now()]);
    }

    return redirect()->back();
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
    //
  }

  /**
   * Display the specified resource.
   */
  public function show(string $id)
  {
    //
  }

  /**
   * Show the form for editing the specified resource.
   */
  public function edit(string $id)
  {
    //
  }

  /**
   * Update the specified resource in storage.
   */
  public function update(Request $request, string $id)
  {
    //
  }

  /**
   * Remove the specified resource from storage.
   */
  public function destroy(string $id)
  {
    //
  }
}
