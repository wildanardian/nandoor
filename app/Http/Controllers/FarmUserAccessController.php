<?php

namespace App\Http\Controllers;

use App\Models\Farm;
use App\Models\FarmUserAccess;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class FarmUserAccessController extends Controller
{
  /**
   * Add existing user to farm.
   */
  public function store(Request $request, Farm $farm)
  {
    /** @var User $currentUser */
    $currentUser = $request->user();

    // Authorization: Only Global Admin or Farm Owner
    if (!$currentUser->isAdmin() && $currentUser->id !== $farm->owner_id) {
      abort(403, 'Unauthorized.');
    }

    $validated = $request->validate([
      'user_id' => ['required', 'exists:users,id'],
      'role' => ['required', Rule::in(['pemilik', 'anggota'])],
    ]);

    $targetUserId = $validated['user_id'];

    if ($targetUserId === $farm->owner_id) {
      return back()->withErrors(['user_id' => 'User is strictly the owner of this farm.']);
    }

    // Check if already has access
    $exists = FarmUserAccess::where('farm_id', $farm->id)
      ->where('user_id', $targetUserId)
      ->exists();

    if ($exists) {
      return back()->withErrors(['user_id' => 'User already has access to this farm.']);
    }

    FarmUserAccess::create([
      'farm_id' => $farm->id,
      'user_id' => $targetUserId,
      'role' => $validated['role'],
    ]);

    return back()->with('success', 'User added to farm successfully.');
  }

  /**
   * Update user role in farm.
   */
  public function update(Request $request, Farm $farm, $userId)
  {
    /** @var User $currentUser */
    $currentUser = $request->user();

    // Authorization: Only Global Admin or Farm Owner
    if (!$currentUser->isAdmin() && $currentUser->id !== $farm->owner_id) {
      abort(403, 'Unauthorized.');
    }

    $validated = $request->validate([
      'role' => ['required', Rule::in(['pemilik', 'anggota'])],
    ]);

    if ($userId == $farm->owner_id) {
      abort(403, 'Cannot change role of the main owner.');
    }

    $access = FarmUserAccess::where('farm_id', $farm->id)
      ->where('user_id', $userId)
      ->firstOrFail();

    $access->update(['role' => $validated['role']]);

    return back()->with('success', 'User role updated successfully.');
  }

  /**
   * Remove user from farm.
   */
  public function destroy(Request $request, Farm $farm, $userId)
  {
    /** @var User $currentUser */
    $currentUser = $request->user();

    // Authorization: Only Global Admin or Farm Owner
    if (!$currentUser->isAdmin() && $currentUser->id !== $farm->owner_id) {
      abort(403, 'Unauthorized.');
    }

    if ($userId == $farm->owner_id) {
      abort(403, 'Cannot remove the main owner.');
    }

    $access = FarmUserAccess::where('farm_id', $farm->id)
      ->where('user_id', $userId)
      ->firstOrFail();

    $access->delete();

    return back()->with('success', 'User access removed successfully.');
  }
}
