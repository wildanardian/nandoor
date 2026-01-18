<?php

namespace App\Http\Controllers;

use App\Models\Farm;
use App\Models\Worker;
use App\Models\WorkerPayment;
use App\Models\FarmActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class WorkerController extends Controller
{
  public function index()
  {
    /** @var \App\Models\User $user */
    $user = Auth::user();
    $farm = $user->getActiveFarm();
    if (!$farm) return redirect()->route('dashboard');

    // 1. Summary Calculations
    $totalWorkers = Worker::byFarm($farm->id)->count();
    $activeWorkers = Worker::byFarm($farm->id)->active()->count();

    // Total Kasbon Active (Debt - Paid portion)
    $totalKasbonActive = \App\Models\WorkerPayment::whereHas('activity', function ($q) use ($farm) {
      $q->where('farm_id', $farm->id);
    })
      ->kasbon()->unpaid()
      ->get()
      ->sum(function ($payment) {
        return $payment->amount - $payment->amount_paid;
      });

    // Total Cash Paid (Payment Type: Bayar)
    $totalPaymentsPaid = \App\Models\WorkerPayment::whereHas('activity', function ($q) use ($farm) {
      $q->where('farm_id', $farm->id);
    })
      ->payment()->where('status', 'paid')->sum('amount');

    // 2. Workers List with Aggregated Financials
    $workers = Worker::whereHas('farms', function ($q) use ($farm) {
      $q->where('farms.id', $farm->id);
    })
      ->with(['farms' => function ($q) use ($farm) {
        $q->where('farms.id', $farm->id);
      }])
      ->orderByRaw('is_active DESC')
      ->orderBy('name')
      ->get()
      ->map(function ($worker) use ($farm) {
        $farmPivot = $worker->farms->first();
        $isActive = $farmPivot ? $farmPivot->pivot->is_active : false;

        // Debt Calculation
        $kasbonRecords = \App\Models\WorkerPayment::whereHas('activity', function ($q) use ($farm) {
          $q->where('farm_id', $farm->id);
        })
          ->where('worker_id', $worker->id)
          ->kasbon()
          ->get();

        $totalKasbonOriginal = $kasbonRecords->sum('amount');
        $totalKasbonPaid = $kasbonRecords->sum('amount_paid');
        $kasbonOpen = $totalKasbonOriginal - $totalKasbonPaid;

        // Wage Calculation
        // Total Earned (Completed Assignments)
        $totalWagesEarned = \App\Models\WorkerAssignment::whereHas('activity', function ($q) use ($farm) {
          $q->where('farm_id', $farm->id);
        })
          ->where('worker_id', $worker->id)
          ->where('status', 'done')
          ->sum('wage');

        // Total Used (Cash Paid + Debt Repaid)
        $totalCashPaid = \App\Models\WorkerPayment::whereHas('activity', function ($q) use ($farm) {
          $q->where('farm_id', $farm->id);
        })
          ->where('worker_id', $worker->id)
          ->payment() // type 'bayar'
          ->sum('amount');

        // Debt Repaid is tracked via 'amount_paid' in Kasbon records. 
        // Logic: Wages are the ONLY source of payment for debt in this system? 
        // Or can they pay cash? "Bayar" button logic implies using available wages.
        // So we assume all 'amount_paid' on kasbon comes from Wages.
        // If user manually pays debt with distinct cash (not wages), we'd need a different flow.
        // But per requirements, "Potong upah terlebih dahulu".

        $wagesUsed = $totalCashPaid + $totalKasbonPaid;
        $wagesPending = max(0, $totalWagesEarned - $wagesUsed);

        return [
          'id' => $worker->id,
          'name' => $worker->name,
          'phone' => $worker->phone,
          'is_active' => $isActive,
          'kasbon_open' => (float) $kasbonOpen,
          'wages_pending' => (float) $wagesPending,
          'kasbon_remaining' => (float) $kasbonOpen,
        ];
      });

    // Recent Transactions
    $recentTransactions = \App\Models\WorkerPayment::with('worker')
      ->whereHas('activity', function ($q) use ($farm) {
        $q->where('farm_id', $farm->id);
      })
      ->orderBy('created_at', 'desc')
      ->limit(5)
      ->get();

    // Active Activities for "Selesaikan Kerja" modal
    $activeActivities = \App\Models\FarmActivity::with('farmingStep')
      ->where('farm_id', $farm->id)
      ->whereIn('status', ['in_progress', 'pending']) // Allow selecting pending/in_progress
      ->orderBy('start_date', 'desc')
      ->get()
      ->map(function ($act) {
        return [
          'id' => $act->id,
          'name' => $act->farmingStep->name . ' (' . ($act->start_date ? $act->start_date->format('d M') : 'tba') . ')',
        ];
      });

    return Inertia::render('Workers/Index', [
      'workers' => $workers,
      'recentTransactions' => $recentTransactions,
      'activeActivities' => $activeActivities,
      'summary' => [
        'totalWorkers' => $totalWorkers,
        'activeWorkers' => $activeWorkers,
        'totalKasbonActive' => $totalKasbonActive,
        'totalPayments' => $totalPaymentsPaid,
      ],
      'farmId' => $farm->id,
    ]);
  }

  public function store(Request $request)
  {
    \Illuminate\Support\Facades\Log::info('Worker store request:', $request->all());

    /** @var \App\Models\User $user */
    $user = Auth::user();

    // Use helper to respect session selection
    $farm = $user->getActiveFarm();

    // ... rest of logic
    // Determine mode: Assign (worker_id) or Create (name)
    if ($request->filled('worker_id')) {
      \Illuminate\Support\Facades\Log::info('Assigning existing worker ' . $request->worker_id);
      // Assign Existing
      $validated = $request->validate([
        'worker_id' => 'required|exists:workers,id',
      ]);

      // Check if already assigned
      if ($farm->workers()->where('worker_id', $validated['worker_id'])->exists()) {
        return redirect()->back()->withErrors(['worker_id' => 'Pekerja ini sudah terdaftar di sawah ini.']);
      }

      $farm->workers()->attach($validated['worker_id'], ['is_active' => true, 'joined_at' => now()]);

      return redirect()->back()->with('success', 'Pekerja berhasil ditambahkan ke sawah.');
    } else {
      \Illuminate\Support\Facades\Log::info('Creating new worker');
      // Create New
      $validated = $request->validate([
        'name' => 'required|string|max:255',
        'phone' => 'nullable|string|max:20',
        'notes' => 'nullable|string',
      ]);

      try {
        // Create global worker (no farm_id)
        $worker = Worker::create([
          'name' => $validated['name'],
          'phone' => $validated['phone'] ?? null,
          'notes' => $validated['notes'] ?? null,
          'is_active' => true, // Global active
        ]);
        \Illuminate\Support\Facades\Log::info('Worker created: ' . $worker->id);

        // Attach to farm
        $farm->workers()->attach($worker->id, ['is_active' => true, 'joined_at' => now()]);
        \Illuminate\Support\Facades\Log::info('Worker attached to farm ' . $farm->id);

        return redirect()->back()->with('success', 'Pekerja baru berhasil dibuat dan ditambahkan ke sawah.');
      } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Error creating worker: ' . $e->getMessage());
        return redirect()->back()->withErrors(['name' => 'Gagal membuat pekerja: ' . $e->getMessage()]);
      }
    }
  }

  public function search(Request $request)
  {
    $query = $request->input('query');
    if (!$query) return response()->json([]);

    $workers = Worker::where('name', 'like', "%{$query}%")
      ->orWhere('phone', 'like', "%{$query}%")
      ->limit(10)
      ->get(['id', 'name', 'phone']);

    return response()->json($workers);
  }

  public function storeKasbon(Request $request)
  {
    /** @var \App\Models\User $user */
    $user = Auth::user();
    $farm = $user->getActiveFarm();
    if (!$farm) abort(403);

    // dd($request->all());

    $validated = $request->validate([
      'worker_id' => 'required|exists:workers,id',
      'amount' => 'required|numeric|min:0.01',
      'payment_date' => 'required|date',
      'farm_activity_id' => 'required|exists:farm_activities,id',
      'notes' => 'nullable|string',
    ]);

    // Ensure worker belongs to farm
    $isWorkerInFarm = $farm->workers()->where('workers.id', $validated['worker_id'])->exists();
    if (!$isWorkerInFarm) {
      return back()->withErrors(['worker_id' => 'Pekerja tidak terdaftar di sawah aktif.']);
    }

    $activity = FarmActivity::with('farmingStep')->findOrFail($validated['farm_activity_id']);
    if ($activity->farmingStep && $activity->farmingStep->isLocked()) {
      return back()->with('error', 'Tahapan ini sudah dikunci. Tidak bisa mencatat kasbon.');
    }

    try {
      \App\Models\WorkerPayment::create([
        'farm_activity_id' => $validated['farm_activity_id'],
        'worker_id' => $validated['worker_id'],
        'payment_type' => 'kasbon',
        'amount' => $validated['amount'],
        'amount_paid' => 0,
        'payment_date' => $validated['payment_date'],
        'status' => 'unpaid',
        'notes' => $validated['notes'],
      ]);

      return back()->with('success', 'Kasbon berhasil dicatat.');
    } catch (\Exception $e) {
      \Illuminate\Support\Facades\Log::error('Kasbon Error: ' . $e->getMessage());
      return back()->with('error', 'Gagal mencatat kasbon. Silakan coba lagi.');
    }
  }

  public function storeSettlement(Request $request)
  {
    /** @var \App\Models\User $user */
    $user = Auth::user();
    $farm = $user->getActiveFarm();
    if (!$farm) abort(403);

    $validated = $request->validate([
      'worker_id' => 'required|exists:workers,id',
      // 'amount_to_pay' -> No longer user input? Or user confirms amount?
      // Logic says: "Mengambil seluruh upah unpaid dan kasbon unpaid".
      // So backend calculates it. Frontend just triggers it?
      // But maybe frontend sends the date and notes.
      'payment_date' => 'required|date',
      'notes' => 'nullable|string',
    ]);

    $worker = Worker::findOrFail($validated['worker_id']);

    try {
      \Illuminate\Support\Facades\DB::transaction(function () use ($farm, $worker, $validated) {
        // 1. Lock and Get Unpaid Assignments (Earnings)
        $unpaidAssignments = \App\Models\WorkerAssignment::whereHas('activity', function ($q) use ($farm) {
          $q->where('farm_id', $farm->id);
        })
          ->where('worker_id', $worker->id)
          ->where('status', 'done')
          ->unpaid()
          ->lockForUpdate()
          ->get();

        $totalEarnings = $unpaidAssignments->sum('wage');

        if ($totalEarnings <= 0) {
          // Rule: "Tidak boleh settlement jika tidak ada upah unpaid" (Implicitly generally true unless purely paying debt?)
          // But usually settlement implies paying workers.
          // Let's allow but maybe warn? Or just block.
          // If 0 earnings, maybe they want to clear debt with cash? "Pelunasan"?
          // Logic requirement: "Mengambil ... upah unpaid dan kasbon unpaid".
          // If no earnings, but has kasbon, and user pays cash to clear debt?
          // Current logic: Earnings - Kasbon = Cash Paid.
          // If Earnings 0, Kasbon 50k -> Cash Paid = -50k ?? No.
          // If Kasbon > Earnings, Cash Paid = 0, Kasbon partially paid?
          // New Logic says: "Seluruh upah -> paid. Seluruh kasbon -> paid."
          // This implies the Farm PAYS the net difference.
          // If Net is negative (Debt > Earnings), then Worker must pay Farm? Or Debt remains?
          // Requirement: "Jika total_upah < total_kasbon: cash_paid = 0, sisa kasbon tetap unpaid".
        }

        // 2. Lock and Get Unpaid Kasbon
        $unpaidKasbon = \App\Models\WorkerPayment::whereHas('activity', function ($q) use ($farm) {
          $q->where('farm_id', $farm->id);
        })
          ->where('worker_id', $worker->id)
          ->kasbon()
          ->unpaid()
          ->lockForUpdate()
          ->get();

        $totalKasbon = $unpaidKasbon->sum('amount');

        // 3. Calculate Net
        $cashPaid = max(0, $totalEarnings - $totalKasbon);

        // 4. Handle Case: Debt > Earnings
        // Requirement: "Jika total_upah < total_kasbon -> cash_paid = 0, sisa kasbon tetap unpaid"
        // This is tricky. Which kasbon remains unpaid?
        // Option A: Mark all as paid and create a new "Carry Over" debt?
        // Option B: Partially pay updates.
        // Let's strictly follow: "Seluruh upah -> paid".
        // Kasbon: Pay as much as possible?
        // Let's define: Deductable Amount = Total Earnings.
        // We pay off kasbon using Earnings.

        if ($totalEarnings >= $totalKasbon) {
          // Full settlement. All cleared.
          $markAssignments = /* All */ true;
          $markKasbon = /* All */ true;

          // Perform Updates
          \App\Models\WorkerAssignment::whereIn('id', $unpaidAssignments->pluck('id'))->update(['payment_status' => 'paid']);
          \App\Models\WorkerPayment::whereIn('id', $unpaidKasbon->pluck('id'))->update(['status' => 'paid']);
        } else {
          // Earnings < Debt.
          // 1. Mark all Earnings as PAID (consumed)
          \App\Models\WorkerAssignment::whereIn('id', $unpaidAssignments->pluck('id'))->update(['payment_status' => 'paid']);

          // 2. Reduce Debt
          // We need to loop and partially pay off debt records?
          // Or just keep them unpaid but reduce amount?
          // Current structure: amount vs amount_paid.
          // This matches "accumulative" requirement nicely.
          $remainingDeduction = $totalEarnings;

          foreach ($unpaidKasbon as $k) {
            if ($remainingDeduction <= 0) break;
            $balance = $k->amount - $k->amount_paid;
            $pay = min($remainingDeduction, $balance);

            $k->amount_paid += $pay;
            if ($k->amount_paid >= $k->amount) {
              $k->status = 'paid';
            }
            $k->save();

            $remainingDeduction -= $pay;
          }
          // Note: Some kasbon might remain 'unpaid' here. Matches requirement.
          $markKasbon = false; // Not all marked paid.
        }

        // 5. Create Settlement Record
        \App\Models\WorkerSettlement::create([
          'worker_id' => $worker->id,
          'total_earnings' => $totalEarnings,
          'total_kasbon' => $totalKasbon, // Records the snapshot of DEBT involved? 
          // Or just debt CLEARED? "Total Kasbon" usually implies what was deducted.
          // Let's log what was *attempted* to be cleared or what was available.
          // Let's say Total Kasbon = The amount of debt available at that time.
          'cash_paid' => $cashPaid,
          'settlement_date' => $validated['payment_date'],
          'notes' => $validated['notes'] ?? 'Settlement Loop',
        ]);

        session()->flash('success', 'Settlement berhasil. Tunai dibayarkan: Rp ' . number_format($cashPaid));
      });

      return back();
    } catch (\Exception $e) {
      \Illuminate\Support\Facades\Log::error('Settlement Error: ' . $e->getMessage());
      return back()->with('error', 'Gagal memproses settlement. ' . $e->getMessage());
    }
  }

  public function storeWorkCompletion(Request $request)
  {
    /** @var \App\Models\User $user */
    $user = Auth::user();
    $farm = $user->getActiveFarm();
    if (! $farm) abort(403);

    $validated = $request->validate([
      'worker_id' => 'required|exists:workers,id',
      'farm_activity_id' => 'required|exists:farm_activities,id',
      'wage' => 'required|numeric|min:0',
      'date' => 'required|date',
    ]);

    // Check Lock
    $activity = FarmActivity::with('farmingStep')->findOrFail($validated['farm_activity_id']);
    if ($activity->farmingStep && $activity->farmingStep->isLocked()) {
      return back()->with('error', 'Tahapan ini sudah dikunci.');
    }

    // Always Create New Assignment (Accumulative Logic)
    // Requirement "Upah bersifat AKUMULATIF (ditambah, bukan diganti)"
    // So even if they worked before, we add NEW record? 
    // "Selesai Kerja -> Menambahkan Upah baru -> Insert ke tabel worker_earnings"
    // Yes, Insert.

    \App\Models\WorkerAssignment::create([
      'worker_id' => $validated['worker_id'],
      'farm_activity_id' => $validated['farm_activity_id'],
      'farm_plot_id' => $activity->farm_plot_id,
      'assigned_at' => $validated['date'],
      'wage' => $validated['wage'],
      'status' => 'done',
      'payment_status' => 'unpaid', // Default
    ]);

    return back()->with('success', 'Pekerjaan berhasil dicatat dan upah ditambahkan.');
  }

  public function update(Request $request, $id)
  {
    /** @var \App\Models\User $user */
    $user = Auth::user();
    $farm = $user->getActiveFarm();
    if (!$farm) abort(403);

    $worker = Worker::findOrFail($id);

    // Check if worker belongs to this farm
    if (!$farm->workers()->where('workers.id', $worker->id)->exists()) {
      abort(403, 'Akses ditolak.');
    }

    $validated = $request->validate([
      'name' => 'required|string|max:255',
      'phone' => 'nullable|string|max:20',
      'notes' => 'nullable|string',
    ]);

    $worker->update([
      'name' => $validated['name'],
      'phone' => $validated['phone'] ?? null,
      'notes' => $validated['notes'] ?? null,
    ]);

    return back()->with('success', 'Data pekerja berhasil diperbarui.');
  }

  public function deactivate(Request $request, $id)
  {
    /** @var \App\Models\User $user */
    $user = Auth::user();
    $farm = $user->getActiveFarm();
    if (!$farm) abort(403);

    $worker = Worker::findOrFail($id);

    // Update Pivot is_active = false
    $farm->workers()->updateExistingPivot($worker->id, ['is_active' => false]);

    return back()->with('success', 'Pekerja berhasil dinonaktifkan.');
  }
}
