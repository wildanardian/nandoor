<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
  /**
   * The root template that is loaded on the first page visit.
   *
   * @var string
   */
  protected $rootView = 'app';

  /**
   * Determine the current asset version.
   */
  public function version(Request $request): ?string
  {
    return parent::version($request);
  }

  /**
   * Define the props that are shared by default.
   *
   * @return array<string, mixed>
   */
  public function share(Request $request): array
  {
    $user = $request->user();
    $activeFarm = $user ? $user->getActiveFarm() : null;

    return [
      ...parent::share($request),
      'auth' => [
        'user' => $user,
        'farms' => $user ? $user->farms->merge($user->accessibleFarms)->unique('id')->values() : [],
        'active_farm' => $activeFarm,
      ],
      'global_state' => [
        'has_farm' => $activeFarm !== null,
        'has_active_period' => $activeFarm && $activeFarm->activePeriod()->exists(),
      ],
    ];
  }
}
