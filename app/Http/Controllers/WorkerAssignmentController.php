<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\WorkerAssignment;
use App\Models\FarmActivity;

class WorkerAssignmentController extends Controller
{
  public function store(Request $request)
  {
    $validated = $request->validate([
      'farm_activity_id' => 'required|exists:farm_activities,id',
      'worker_id' => 'required|exists:workers,id',
      'farm_plot_id' => 'required|exists:farm_plots,id',
      'assigned_at' => 'required|date',
    ]);

    $activity = FarmActivity::with('farmingStep')->findOrFail($validated['farm_activity_id']);

    if ($activity->farmingStep && $activity->farmingStep->isLocked()) {
      return back()->with('error', 'Tahapan ini sudah dikunci. Tidak bisa menugaskan pekerja.');
    }

    // Check duplicate
    $exists = $activity->workerAssignments()
      ->where('worker_id', $validated['worker_id'])
      ->where('farm_plot_id', $validated['farm_plot_id'])
      ->exists();

    if ($exists) {
      return back()->with('error', 'Pekerja ini sudah ditugaskan di petak tersebut.');
    }

    WorkerAssignment::create([
      'farm_activity_id' => $activity->id,
      'worker_id' => $validated['worker_id'],
      'farm_plot_id' => $validated['farm_plot_id'],
      'assigned_at' => $validated['assigned_at'],
    ]);

    return back()->with('success', 'Pekerja berhasil ditugaskan.');
  }
}
