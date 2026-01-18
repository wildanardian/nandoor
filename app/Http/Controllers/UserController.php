<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
  /**
   * List all system users. Global Admin only.
   */
  public function index(Request $request)
  {
    /** @var User $currentUser */
    $currentUser = $request->user();

    if (!$currentUser->isAdmin()) {
      abort(403, 'Unauthorized. Global Admin access required.');
    }

    $users = User::orderBy('name')
      ->get()
      ->map(function ($u) {
        return [
          'id' => $u->id,
          'name' => $u->name,
          'username' => $u->username,
          'email' => $u->email,
          'role' => $u->role, // 'admin' or 'umum'
          'is_active' => $u->is_active,
          'initials' => strtoupper(substr($u->name, 0, 2)),
        ];
      });

    return Inertia::render('Users/Index', [
      'users' => $users,
    ]);
  }

  /**
   * Create a new system user directly.
   */
  public function store(Request $request)
  {
    /** @var User $currentUser */
    $currentUser = $request->user();

    if (!$currentUser->isAdmin()) {
      abort(403);
    }

    $validated = $request->validate([
      'name' => ['required', 'string', 'max:255'],
      'username' => ['required', 'string', 'max:255', 'unique:users,username', 'alpha_dash'],
      'email' => ['required', 'email', 'unique:users,email'],
      'password' => ['required', 'string', 'min:8'],
      'role' => ['required', Rule::in([User::ROLE_ADMIN, User::ROLE_UMUM])],
    ]);

    User::create([
      'name' => $validated['name'],
      'username' => $validated['username'],
      'email' => $validated['email'],
      'role' => $validated['role'],
      'password' => Hash::make($validated['password']),
      'is_active' => true,
    ]);

    return back()->with('success', 'User created successfully.');
  }

  /**
   * Update global user details.
   */
  public function update(Request $request, $id)
  {
    /** @var User $currentUser */
    $currentUser = $request->user();

    if (!$currentUser->isAdmin()) {
      abort(403);
    }

    $user = User::findOrFail($id);

    $validated = $request->validate([
      'name' => ['required', 'string', 'max:255'],
      'username' => ['required', 'string', 'max:255', 'alpha_dash', Rule::unique('users')->ignore($user->id)],
      'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
      'password' => ['nullable', 'string', 'min:8'],
      'role' => ['required', Rule::in([User::ROLE_ADMIN, User::ROLE_UMUM])],
    ]);

    // Prevent self-demotion if it leaves no admins? (Optional safety)
    // For now just basic update
    $userData = [
      'name' => $validated['name'],
      'username' => $validated['username'],
      'email' => $validated['email'],
      'role' => $validated['role'],
    ];

    if (!empty($validated['password'])) {
      $userData['password'] = Hash::make($validated['password']);
    }

    $user->update($userData);

    return back()->with('success', 'User updated successfully.');
  }

  /**
   * Toggle active status (or delete).
   * Requirement: "Aktifkan / Nonaktifkan user"
   */
  public function destroy(Request $request, $id)
  {
    /** @var User $currentUser */
    $currentUser = $request->user();

    if (!$currentUser->isAdmin()) {
      abort(403);
    }

    if ($currentUser->id == $id) {
      return back()->withErrors(['error' => 'Cannot deactivate yourself.']);
    }

    $user = User::findOrFail($id);

    // Toggle active status
    $user->update([
      'is_active' => !$user->is_active
    ]);

    $status = $user->is_active ? 'activated' : 'deactivated';

    return back()->with('success', "User {$status} successfully.");
  }
}
