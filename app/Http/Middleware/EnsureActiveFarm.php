<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveFarm
{
  /**
   * Handle an incoming request.
   *
   * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
   */
  public function handle(Request $request, Closure $next): Response
  {
    $user = $request->user();

    if (!$user) {
      return redirect()->route('login');
    }

    // Logic to get "Active" farm.
    // Using helper which handles Session priority and Fallback logic
    $farm = $user->getActiveFarm();

    if (!$farm) {
      return redirect()->route('farm-settings.index')
        ->with('error', 'Silakan pilih atau buat sawah terlebih dahulu sebelum menambahkan pekerja.');
    }

    // Optional: Share farm with request context
    // $request->attributes->add(['active_farm' => $farm]);

    return $next($request);
  }
}
