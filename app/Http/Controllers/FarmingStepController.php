<?php

namespace App\Http\Controllers;

use App\Models\CropType;
use App\Models\FarmingStep;
use App\Models\FarmActivity;
use App\Models\MasterFarmingStep;
use App\Models\StepActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FarmingStepController extends Controller
{
  public function index()
  {
    /** @var \App\Models\User $user */
    $user = Auth::user();
    $farm = $user->getActiveFarm();

    if (!$farm) {
      return redirect()->route('dashboard');
    }

    $activePeriod = $farm->activePeriod;

    $steps = [];
    $hasActivePeriod = false;

    if ($activePeriod) {
      $hasActivePeriod = true;

      $steps = \App\Models\FarmingStep::where('farm_id', $farm->id)
        ->where('period_id', $activePeriod->id)
        ->with(['masterStep'])
        ->get()
        ->sortBy(function ($step) {
          return $step->masterStep->step_order ?? 0;
        })
        ->values()
        ->map(function ($step) {
          return [
            'id' => $step->id,
            'name' => $step->name,
            'status' => $step->status,
            'step_order' => $step->masterStep->step_order ?? 0,
            'started_at' => $step->started_at,
            'finished_at' => $step->finished_at,
            'is_draft' => $step->status === FarmingStep::STATUS_DRAFT,
            'is_in_progress' => $step->status === FarmingStep::STATUS_IN_PROGRESS,
            'is_finished' => $step->status === FarmingStep::STATUS_FINISHED,
            'is_locked' => $step->status === FarmingStep::STATUS_LOCKED,
          ];
        });
    }

    return Inertia::render('FarmingSteps/Index', [
      'steps' => $steps,
      'hasActivePeriod' => $hasActivePeriod,
      'farmName' => $farm->name,
      'cropType' => $farm->cropType ? $farm->cropType->name : '-',
    ]);
  }

  public function detail($id)
  {
    /** @var \App\Models\User $user */
    $user = Auth::user();
    $farm = $user->getActiveFarm();

    if (!$farm) {
      return redirect()->route('dashboard');
    }

    $step = \App\Models\FarmingStep::with(['masterStep'])
      ->where('farm_id', $farm->id)
      ->findOrFail($id);

    // Ensure FarmActivity exists
    $activity = $step->farmActivity;
    if (!$activity) {
      $activity = \App\Models\FarmActivity::create([
        'farm_id' => $farm->id,
        'farming_step_id' => $step->id,
        'start_date' => $step->started_at ?? now(),
        'status' => $step->status, // Sync status
      ]);
      $step->load('farmActivity');
    } else {
      // Sync status if needed (e.g. if manually changed in DB)
      if ($activity->status !== $step->status) {
        $activity->update(['status' => $step->status]);
      }
    }

    // Eager load with logs
    $step->load([
      'farmActivity.expenses',
      'farmActivity.workerAssignments.worker',
      'farmActivity.workerAssignments.farmPlot',
      'farmActivity.workerPayments.worker',
      'logs.actor' // Load logs
    ]);

    $activity = $step->farmActivity;

    // Financial Summaries
    $totalExpense = $activity->expenses->sum('amount');
    $totalKasbon = $activity->workerPayments->where('payment_type', 'kasbon')->sum('amount');
    $totalPaid = $activity->workerPayments->where('payment_type', 'bayar')->sum('amount');

    // Derived Unpaid Kasbon for Validation
    // This logic aggregates ALL workers in this activity.
    // Usually, validation is per worker, but for locking step, we check TOTAL unpaid.
    // Calculate unpaid kasbon: Total Kasbon issued - Total Payments made.
    // Assuming 'bayar' can pay off kasbon.
    // If 'bayar' > 'kasbon', the difference is 'wages'.
    // So unpaid kasbon = max(0, totalKasbon - totalPaid).
    // Wait, totalPaid includes Wages. We can't distinguish wage payment vs kasbon repayment easily without linking them.
    // Simplification: We assume 'bayar' first clears kasbon.
    // Actually, we should check per worker.
    $unpaidKasbonCount = 0;
    $workers = $activity->workerAssignments->map(function ($assign) use ($activity, &$unpaidKasbonCount) {
      $workerPayments = $activity->workerPayments->where('worker_id', $assign->worker_id);
      $k = $workerPayments->where('payment_type', 'kasbon')->sum('amount');
      $p = $workerPayments->where('payment_type', 'bayar')->sum('amount');
      $currentDebt = max(0, $k - $p);

      if ($currentDebt > 0) $unpaidKasbonCount++;

      return [
        'id' => $assign->id,
        'worker_id' => $assign->worker->id,
        'name' => $assign->worker->name,
        'plot_name' => $assign->farmPlot?->name ?? '-',
        'assigned_at' => $assign->assigned_at,
        'kasbon_current' => $currentDebt,
        'total_paid' => $p,
      ];
    });

    // Props
    $stepData = [
      'id' => $step->id,
      'name' => $step->name,
      'step_order' => $step->masterStep->step_order ?? 0,
      'status' => $step->status,
      'started_at' => $step->started_at,
      'finished_at' => $step->finished_at,
      'farm_activity_id' => $activity->id,
      'is_editable' => $step->canBeEdited(), // Use helper
      'is_locked' => $step->isLocked(),
      'unpaid_kasbon_count' => $unpaidKasbonCount, // For frontend warning
    ];

    $expenses = $activity->expenses->map(function ($exp) {
      return [
        'id' => $exp->id,
        'date' => $exp->expense_date,
        'type' => $exp->type,
        'category' => ucfirst($exp->type),
        'description' => $exp->description,
        'amount' => $exp->amount,
      ];
    });

    // Logs
    $logs = $step->logs()->orderBy('created_at', 'desc')->get()->map(function ($log) {
      return [
        'id' => $log->id,
        'action' => $log->action,
        'description' => $log->description,
        'actor' => $log->actor ? $log->actor->name : 'System',
        'date' => $log->created_at->format('Y-m-d H:i'),
      ];
    });

    // Payments for Timeline
    $payments = $activity->workerPayments->map(function ($pay) {
      return [
        'id' => $pay->id,
        'date' => $pay->payment_date,
        'type' => $pay->payment_type, // 'kasbon' or 'bayar'
        'amount' => $pay->amount,
        'worker_name' => $pay->worker->name,
        'notes' => $pay->notes,
      ];
    });

    return Inertia::render('FarmingSteps/Detail', [
      'step' => $stepData,
      'expenses' => $expenses,
      'payments' => $payments, // New Prop
      'workers' => $workers, // Already mapped locally
      'logs' => $logs,
      'placeholders' => [
        'plots' => $farm->plots->map(fn($p) => ['id' => $p->id, 'name' => $p->name]),
        'workers' => $farm->workers->map(fn($w) => ['id' => $w->id, 'name' => $w->name]),
      ],
      'stats' => [
        'total_expense' => $totalExpense,
        'total_kasbon' => $totalKasbon,
        'total_paid' => $totalPaid
      ]
    ]);
  }

  public function start(Request $request, $id)
  {
    $step = FarmingStep::findOrFail($id);

    if ($step->status !== FarmingStep::STATUS_DRAFT) {
      return back()->with('error', 'Tahapan tidak dapat dimulai (Status bukan Draft).');
    }

    DB::transaction(function () use ($step) {
      $step->update([
        'status' => FarmingStep::STATUS_IN_PROGRESS,
        'started_at' => now(),
      ]);

      // Sync Activity
      if ($step->farmActivity) $step->farmActivity->update(['status' => FarmingStep::STATUS_IN_PROGRESS]);

      $this->logAction($step, 'started', 'Tahapan dimulai.');
    });

    return back()->with('success', 'Tahapan dimulai.');
  }

  public function complete(Request $request, $id)
  {
    $step = FarmingStep::findOrFail($id);

    if ($step->status !== FarmingStep::STATUS_IN_PROGRESS) {
      return back()->with('error', 'Tahapan belum berjalan.');
    }

    DB::transaction(function () use ($step) {
      $step->update([
        'status' => FarmingStep::STATUS_FINISHED,
        'finished_at' => now(),
      ]);

      if ($step->farmActivity) $step->farmActivity->update(['status' => FarmingStep::STATUS_FINISHED]);

      $this->logAction($step, 'finished', 'Tahapan diselesaikan (Lapangan).');
    });

    return back()->with('success', 'Tahapan diselesaikan.');
  }

  public function lock(Request $request, $id)
  {
    $step = FarmingStep::findOrFail($id);

    if ($step->status !== FarmingStep::STATUS_FINISHED) {
      return back()->with('error', 'Tahapan harus berstatus Selesai untuk dikunci.');
    }

    // Validate Unpaid Kasbon
    $activity = $step->farmActivity;
    if ($activity) {
      // Check aggregate per worker
      foreach ($activity->workerAssignments as $assign) {
        $k = $activity->workerPayments->where('worker_id', $assign->worker_id)->where('payment_type', 'kasbon')->sum('amount');
        $p = $activity->workerPayments->where('worker_id', $assign->worker_id)->where('payment_type', 'bayar')->sum('amount');
        if (($k - $p) > 0) {
          return back()->with('error', "Pekerja {$assign->worker->name} masih memiliki kasbon belum lunas. Tidak bisa mengunci step.");
        }
      }
    }

    DB::transaction(function () use ($step) {
      $step->update(['status' => FarmingStep::STATUS_LOCKED]);
      if ($step->farmActivity) $step->farmActivity->update(['status' => FarmingStep::STATUS_LOCKED]);

      $this->logAction($step, 'locked', 'Tahapan dikunci permanen.');
    });

    return back()->with('success', 'Tahapan dikunci.');
  }

  // Generate is untouched essentially but uses 'draft'
  public function generate(Request $request)
  {
    /** @var \App\Models\User $user */
    $user = Auth::user();
    $farm = $user->getActiveFarm();

    // ... (Similar logic, ensure status => STATUS_DRAFT)
    if (!$farm || !$farm->activePeriod) return back()->with('error', 'Tidak ada periode aktif.');
    $period = $farm->activePeriod;
    if (FarmingStep::where('period_id', $period->id)->exists()) return back()->with('error', 'Tahapan sudah ada.');
    if (!$farm->crop_type_id) return back()->with('error', 'Jenis tanaman belum diatur.');

    $cropType = CropType::find($farm->crop_type_id);
    $masterSteps = MasterFarmingStep::where('crop_type', $cropType->slug)->where('is_active', true)->orderBy('step_order', 'asc')->get();

    if ($masterSteps->isEmpty()) return back()->with('error', 'Master tahapan kosong.');

    DB::transaction(function () use ($farm, $period, $masterSteps) {
      foreach ($masterSteps as $master) {
        FarmingStep::create([
          'farm_id' => $farm->id,
          'period_id' => $period->id,
          'master_step_id' => $master->id,
          'status' => FarmingStep::STATUS_DRAFT,
        ]);
      }
    });

    return back()->with('success', 'Tahapan berhasil digenerate.');
  }

  private function logAction($step, $action, $desc)
  {
    StepActivityLog::create([
      'farming_step_id' => $step->id,
      'action' => $action,
      'description' => $desc,
      'actor_id' => Auth::id(),
    ]);
  }
}
