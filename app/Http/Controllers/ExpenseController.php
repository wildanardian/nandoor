<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Expense;
use App\Models\FarmActivity;

class ExpenseController extends Controller
{
  public function store(Request $request)
  {
    $validated = $request->validate([
      'farm_activity_id' => 'required|exists:farm_activities,id',
      'type' => 'required|in:fertilizer,chemical,labor,tool,other',
      'description' => 'required|string|max:255',
      'amount' => 'required|numeric|min:0',
      'expense_date' => 'required|date',
    ]);

    $activity = FarmActivity::with('farmingStep')->findOrFail($validated['farm_activity_id']);

    if ($activity->farmingStep && $activity->farmingStep->isLocked()) {
      return back()->with('error', 'Tahapan ini sudah dikunci. Tidak bisa menambah biaya.');
    }

    $activity->expenses()->create([
      'period_id' => $activity->farmingStep->period_id, // Propagate period
      'farm_id' => $activity->farm_id,     // Propagate farm
      'type' => $validated['type'],
      'description' => $validated['description'],
      'amount' => $validated['amount'],
      'expense_date' => $validated['expense_date'],
    ]);

    return back()->with('success', 'Biaya berhasil ditambahkan.');
  }
}
