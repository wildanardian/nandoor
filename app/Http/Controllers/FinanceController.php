<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Income;
use App\Models\FarmActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class FinanceController extends Controller
{
  public function index(Request $request)
  {
    /** @var \App\Models\User $user */
    $user = Auth::user();
    $farm = $user->getActiveFarm();
    if (!$farm) return redirect()->route('dashboard');

    $period = $farm->activePeriod;
    if (!$period) return redirect()->route('dashboard'); // Or handle edge case

    $filterType = $request->input('type', 'all'); // all, expense, income

    // 1. Fetch Expenses (Scoped to Farm & Period)
    $expensesQuery = Expense::where('farm_id', $farm->id)
      ->where('period_id', $period->id)
      ->with('farmActivity.farmingStep'); // Eager load for "step" name

    // 2. Fetch Incomes (Scoped to Farm & Period)
    $incomesQuery = Income::where('farm_id', $farm->id)
      ->where('period_id', $period->id);

    // 3. Calculate Summary (Before filtering)
    $totalExpense = (clone $expensesQuery)->sum('amount');
    $totalIncome = (clone $incomesQuery)->sum('total_amount');
    // Saldo Kas = Initial + Income - Expense
    // Check Period model for initial balance field. Schema says 'opening_balance'
    $initialBalance = $period->opening_balance ?? 0;
    $saldoKas = $initialBalance + $totalIncome - $totalExpense;
    $netIncome = $totalIncome - $totalExpense;

    // 4. Prepare Transactions List based on Filter
    $transactions = collect([]);

    if ($filterType === 'all' || $filterType === 'expense') {
      $expenses = $expensesQuery->orderBy('expense_date', 'desc')->get()->map(function ($e) {
        return [
          'id' => 'exp-' . $e->id, // Unique ID for list
          'raw_id' => $e->id,
          'date' => $e->expense_date->format('d M'), // specific format requested
          'full_date' => $e->expense_date->format('Y-m-d'),
          'type' => 'expense',
          'desc' => $e->description,
          'step' => $e->farmActivity ? $e->farmActivity->farmingStep->name : '-',
          'amount' => $e->amount,
          'timestamp' => $e->expense_date->timestamp, // For sorting union
        ];
      });
      $transactions = $transactions->concat($expenses);
    }

    if ($filterType === 'all' || $filterType === 'income') {
      $incomes = $incomesQuery->orderBy('income_date', 'desc')->get()->map(function ($i) {
        return [
          'id' => 'inc-' . $i->id,
          'raw_id' => $i->id,
          'date' => $i->income_date->format('d M'),
          'full_date' => $i->income_date->format('Y-m-d'),
          'type' => 'income',
          'desc' => $i->description,
          'step' => '-', // Incomes usually linked to Harvest/Sales, maybe plot. Schema: farm_plot_id.
          'amount' => $i->total_amount,
          'timestamp' => $i->income_date->timestamp,
        ];
      });
      $transactions = $transactions->concat($incomes);
    }

    // 5. Sort Combined List
    $sortedTransactions = $transactions->sortByDesc('timestamp')->values();

    // 6. Active Activities for Dropdown
    $activeActivities = FarmActivity::where('farm_id', $farm->id)
      ->with('farmingStep')
      ->whereIn('status', ['pending', 'in_progress'])
      ->get()
      ->map(function ($act) {
        return [
          'id' => $act->id,
          'name' => $act->farmingStep->name . ' (' . ($act->start_date ? $act->start_date->format('d M') : 'tba') . ')',
        ];
      });

    return Inertia::render('Finance/Index', [
      'farm' => $farm,
      'period' => $period,
      'summary' => [
        'saldo_kas' => $saldoKas,
        'total_expense' => $totalExpense,
        'total_income' => $totalIncome,
        'net_income' => $netIncome,
      ],
      'transactions' => $sortedTransactions,
      'activeActivities' => $activeActivities,
      'filters' => [
        'type' => $filterType
      ]
    ]);
  }

  public function storeExpense(Request $request)
  {
    $user = Auth::user();
    $farm = $user->getActiveFarm();
    if (!$farm) abort(403);
    $period = $farm->activePeriod;

    $validated = $request->validate([
      'description' => 'required|string|max:255',
      'amount' => 'required|numeric|min:0',
      'expense_date' => 'required|date',
      'farm_activity_id' => 'nullable|exists:farm_activities,id',
      'type' => 'required|in:fertilizer,chemical,labor,tool,other',
    ]);

    Expense::create([
      'farm_id' => $farm->id,
      'period_id' => $period->id, // Important: scoped to active period
      'farm_activity_id' => $validated['farm_activity_id'],
      'description' => $validated['description'],
      'amount' => $validated['amount'],
      'expense_date' => $validated['expense_date'],
      'type' => $validated['type'],
    ]);

    return back()->with('success', 'Pengeluaran berhasil dicatat.');
  }

  public function storeIncome(Request $request)
  {
    $user = Auth::user();
    $farm = $user->getActiveFarm();
    if (!$farm) abort(403);
    $period = $farm->activePeriod;

    $validated = $request->validate([
      'description' => 'required|string|max:255',
      'quantity' => 'required|numeric|min:0',
      'price_per_unit' => 'required|numeric|min:0',
      'total_amount' => 'required|numeric|min:0', // Or calc backend?
      'income_date' => 'required|date',
      // 'farm_plot_id' => 'nullable...' // Optional for now
    ]);

    // Simple validation check: total should be approx qty * price
    // But trust frontend/user input for flexibility? 
    // Schema has all 3 fields.

    Income::create([
      'farm_id' => $farm->id,
      'period_id' => $period->id,
      'description' => $validated['description'],
      'quantity' => $validated['quantity'],
      'price_per_unit' => $validated['price_per_unit'],
      'total_amount' => $validated['total_amount'],
      'income_date' => $validated['income_date'],
    ]);

    return back()->with('success', 'Pemasukan berhasil dicatat.');
  }
}
