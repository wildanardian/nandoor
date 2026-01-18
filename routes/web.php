<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\FarmController;
use App\Http\Controllers\FarmingStepController;
use App\Http\Controllers\MasterFarmingStepController;
use App\Http\Controllers\PeriodController;
use Illuminate\Http\Request;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WorkerAssignmentController;
use App\Http\Controllers\WorkerController;
use App\Models\Farm;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
  return redirect()->route('dashboard');
});

// ----Route With Auth Middleware
Route::middleware('auth')->group(function () {
  Route::controller(ProfileController::class)->group(function () {
    Route::get('/profile', 'edit')->name('profile.edit');
    Route::patch('/profile', 'update')->name('profile.update');
    Route::delete('/profile', 'destroy')->name('profile.destroy');
  });

  Route::controller(DashboardController::class)->group(function () {
    Route::get('/dashboard', 'index')->name('dashboard');
    Route::post('/dashboard/complete-onboarding', 'completeOnboarding')->name('dashboard.complete-onboarding');
  });

  Route::controller(FarmingStepController::class)->prefix('farming-steps')->group(function () {
    Route::get('/', 'index')->name('farming-steps.index');
    Route::get('/{id}', 'detail')->name('farming-steps.detail');
    Route::post('/{id}/start', 'start')->name('farming-steps.start');
    Route::post('/{id}/complete', 'complete')->name('farming-steps.complete');
    Route::post('/{id}/lock', 'lock')->name('farming-steps.lock');
    Route::post('/{id}/skip', 'skip')->name('farming-steps.skip');
    Route::post('/generate', 'generate')->name('farming-steps.generate');
  });

  Route::controller(WorkerController::class)->middleware('active_farm')->group(function () {
    Route::get('/workers', 'index')->name('workers.index');
    Route::get('/workers/search', 'search')->name('workers.search');
    Route::post('/workers', 'store')->name('workers.store');
    Route::put('/workers/{id}', 'update')->name('workers.update');
    Route::patch('/workers/{id}/deactivate', 'deactivate')->name('workers.deactivate');
    Route::post('/workers/kasbon', 'storeKasbon')->name('workers.store-kasbon');
    Route::post('/workers/settlement', 'storeSettlement')->name('workers.store-settlement');
    Route::post('/workers/work-completion', 'storeWorkCompletion')->name('workers.store-work-completion');
  });

  Route::controller(ExpenseController::class)->group(function () {
    Route::post('/expenses', 'store')->name('expenses.store');
  });

  Route::controller(WorkerAssignmentController::class)->group(function () {
    Route::post('/worker-assignments', 'store')->name('worker-assignments.store');
  });

  Route::controller(PeriodController::class)->group(function () {
    Route::get('/periods', 'index')->name('periods.index');
    Route::post('/periods', 'store')->name('periods.store');
    // Period Close
    Route::post('/periods/{period}/close', 'close')->name('periods.close');
    // Period Update
    Route::put('/periods/{period}', 'update')->name('periods.update'); // Added update route as well since it was missing in list
  });

  Route::controller(MasterFarmingStepController::class)->group(function () {
    Route::get('/master-farming-steps', 'index')->name('master-farming-steps.index');
    Route::post('/master-farming-steps', 'store')->name('master-farming-steps.store');
    Route::post('/master-farming-steps/reorder', 'reorder')->name('master-farming-steps.reorder');
    Route::put('/master-farming-steps/{id}', 'update')->name('master-farming-steps.update');
    Route::delete('/master-farming-steps/{id}', 'destroy')->name('master-farming-steps.destroy');
  });

  Route::controller(\App\Http\Controllers\FinanceController::class)->group(function () {
    Route::get('/finance', 'index')->name('finance.index');
    Route::post('/finance/expense', 'storeExpense')->name('finance.store-expense');
    Route::post('/finance/income', 'storeIncome')->name('finance.store-income');
  });

  Route::controller(\App\Http\Controllers\UserController::class)->group(function () {
    Route::get('/users', 'index')->name('users.index');
    Route::post('/users', 'store')->name('users.store');
    Route::put('/users/{id}', 'update')->name('users.update');
    Route::delete('/users/{id}', 'destroy')->name('users.destroy');
  });

  Route::controller(\App\Http\Controllers\InventoryController::class)->group(function () {
    Route::get('/inventory', 'index')->name('inventory.index');
    Route::post('/inventory/store', 'store')->name('inventory.store');
    Route::post('/inventory/purchase', 'storePurchase')->name('inventory.purchase');
    Route::post('/inventory/usage', 'storeUsage')->name('inventory.usage');
  });

  Route::controller(FarmController::class)->group(function () {
    Route::post('/farms/switch', 'switch')->name('farms.switch');
    Route::post('/farms', 'store')->name('farms.store');
    Route::put('/farms/{farm}', 'update')->name('farms.update');
    Route::delete('/farms/{farm}', 'destroy')->name('farms.destroy');
    Route::post('/farms/{farm}/archive', 'archive')->name('farms.archive');
  });

  // Farm Plots
  Route::controller(\App\Http\Controllers\FarmPlotController::class)->group(function () {
    Route::post('/farms/{farm}/plots', 'store')->name('farm-plots.store');
    Route::put('/farm-plots/{farmPlot}', 'update')->name('farm-plots.update');
    Route::delete('/farm-plots/{farmPlot}', 'destroy')->name('farm-plots.destroy');
  });

  // Farm User Access
  // Farm User Access
  Route::controller(\App\Http\Controllers\FarmUserAccessController::class)->group(function () {
    Route::post('/farms/{farm}/users', 'store')->name('farm-user-access.store');
    Route::put('/farms/{farm}/users/{userId}', 'update')->name('farm-user-access.update');
    Route::delete('/farms/{farm}/users/{userId}', 'destroy')->name('farm-user-access.destroy');
  });
});




Route::get('/farm-settings', function (Request $request) {
  /** @var \App\Models\User $user */
  $user = $request->user();
  $farm = $user->getActiveFarm();

  if ($farm) {
    $farm->load(['plots' => function ($query) {
      $query->withCount('activities');
    }, 'users']);
  }

  // Active Period Stats
  $activePeriod = $farm ? $farm->activePeriod : null;
  if ($activePeriod) {
    $totalExpenses = \App\Models\Expense::where('period_id', $activePeriod->id)->sum('amount');
    $totalIncomes = \App\Models\Income::where('period_id', $activePeriod->id)->sum('total_amount');
    $activePeriod->total_expense = $totalExpenses;
    $activePeriod->total_income = $totalIncomes;
    $activePeriod->current_balance = ($activePeriod->opening_balance ?? 0) + $totalIncomes - $totalExpenses;
  }

  $cropTypes = \App\Models\CropType::where('is_active', true)->get();

  $potentialUsers = [];
  if ($farm) {
    $existingUserIds = $farm->users->pluck('id')->toArray();
    // Also exclude the owner (who is owner_id) from being added again if logic implies
    // But if owner relies on pivot for 'pemilik' role equality, handle carefully.
    // Assuming owner always has access via owner_id check in policies.
    // We exclude owner_id from "Add User" list.
    $existingUserIds[] = $farm->owner_id;

    $potentialUsers = \App\Models\User::whereNotIn('id', $existingUserIds)
      ->where('is_active', true)
      ->orderBy('name')
      ->get(['id', 'name', 'email']);
  }

  return Inertia::render('FarmSettings/Index', [
    'farm' => $farm,
    'activePeriod' => $activePeriod, // Pass explicitly with stats
    'plantTypes' => $cropTypes,
    'cropTypes' => $cropTypes,
    'potentialUsers' => $potentialUsers,
  ]);
})->middleware(['auth', 'verified'])->name('farm-settings.index');

require __DIR__ . '/auth.php';
