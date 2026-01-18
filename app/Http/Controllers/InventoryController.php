<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\InventoryPurchase;
use App\Models\InventoryUsage;
use App\Models\Expense;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
  public function index(Request $request)
  {
    $user = $request->user();
    $farm = $user->getActiveFarm();

    if (!$farm) {
      return redirect()->route('dashboard'); // Or handle no farm case
    }

    $activePeriod = $farm->activePeriod;

    // 1. Fetch Inventory Items with Calculated Stock
    $items = InventoryItem::where('farm_id', $farm->id)
      ->with(['purchases', 'usages'])
      ->get()
      ->map(function ($item) {
        $totalPurchased = $item->purchases->sum('quantity');
        $totalUsed = $item->usages->sum('quantity_used');
        $currentStock = $totalPurchased - $totalUsed;

        // Determine Status
        $status = 'safe';
        if ($currentStock == 0) {
          $status = 'empty';
        } elseif ($currentStock <= $item->min_stock) {
          $status = 'low';
        }

        // Average Price Calculation (Simple Average of Purchase Prices or Weighted? User said "Harga rata-rata dihitung dari inventory_purchases")
        // Let's do Weighted Average Cost if possible, or simple average of available stock? 
        // User said "Sum seluruh stok saat ini * harga rata-rata".
        // Let's Calculate Weighted Average Price (Total Cost / Total Quantity Purchased)
        $totalCost = $item->purchases->sum(function ($p) {
          return $p->quantity * $p->price_per_unit;
        });
        $avgPrice = $totalPurchased > 0 ? $totalCost / $totalPurchased : 0;

        $assetValue = $currentStock * $avgPrice;

        return [
          'id' => $item->id,
          'name' => $item->name,
          'category' => $item->category,
          'unit' => $item->unit,
          'stock' => (float)$currentStock,
          'min_stock' => $item->min_stock,
          'status' => $status,
          'avg_price' => $avgPrice,
          'asset_value' => $assetValue,
        ];
      });

    // 2. Summary Calculations
    $totalItems = $items->count();
    $totalAssetValue = $items->sum('asset_value');
    $lowStockCount = $items->whereIn('status', ['low', 'empty'])->count();

    // Usage This Period = Sum(usage_qty * avg_price) for this period
    // OR better: Sum of usage records * (historical price at that time?). 
    // Simplifying: User said "Sum inventory_usages.quantity * harga satuan"
    // But Usage doesn't store price. We should probably use the item's avg price or trace back to purchase. 
    // Complexity: FIFO/LIFO. 
    // SIMPLIFICATION: usage_qty * current_avg_price for the item.

    $usageValueThisPeriod = 0;
    if ($activePeriod) {
      $periodUsages = InventoryUsage::where('farm_id', $farm->id)
        ->where('period_id', $activePeriod->id)
        ->with('item.purchases') // to calc average price again? Or rely on pre-calc
        ->get();

      foreach ($periodUsages as $usage) {
        // Calculate item avg price
        // Can optimize this by pre-fetching
        $item = $items->firstWhere('id', $usage->inventory_item_id);
        if ($item) {
          $usageValueThisPeriod += $usage->quantity_used * $item['avg_price'];
        }
      }
    }

    // 3. Movement History
    $purchases = InventoryPurchase::where('farm_id', $farm->id)
      ->with('item')
      ->select('id', 'inventory_item_id', 'quantity', 'purchase_date as date', DB::raw("'purchase' as type"), DB::raw("NULL as step_name"))
      ->get();

    $usages = InventoryUsage::where('farm_id', $farm->id)
      ->with(['item', 'farmingStep'])
      ->select('id', 'inventory_item_id', 'quantity_used as quantity', 'usage_date as date', DB::raw("'usage' as type"), 'farming_step_id')
      ->get()
      ->map(function ($u) {
        $u->step_name = $u->farmingStep ? $u->farmingStep->name : null;
        return $u;
      });

    $history = $purchases->concat($usages)
      ->sortByDesc('date')
      ->take(5)
      ->map(function ($h) {
        return [
          'id' => $h->id, // potential conflict if IDs overlap, but key in react might handle it if prefixed or unique type
          'unique_id' => $h->type . '-' . $h->id,
          'date' => $h->date instanceof \DateTime ? $h->date->format('d M') : date('d M', strtotime($h->date)),
          'type' => $h->type,
          'itemName' => $h->item->name ?? 'Unknown',
          'quantity' => (float)$h->quantity,
          'unit' => $h->item->unit ?? '',
          'stepName' => $h->step_name ?? '',
        ];
      })->values();


    return Inertia::render('Inventory/Index', [
      'rawItems' => $items->values(), // renamed to avoid conflict with 'items' prop if used directly? Prop name is 'items' in Index component mock
      'items' => $items->values(),
      'history' => $history,
      'summary' => [
        'totalItems' => $totalItems,
        'totalValue' => 'Rp ' . number_format($totalAssetValue, 0, ',', '.'),
        'lowStock' => $lowStockCount,
        'usageThisPeriod' => 'Rp ' . number_format($usageValueThisPeriod, 0, ',', '.'),
      ],
      'farmName' => $farm->name,
      'activePeriodName' => $activePeriod ? $activePeriod->name : 'Tidak Ada Periode Aktif', // Pass active period name
      'activePeriodId' => $activePeriod ? $activePeriod->id : null,
      'farmingSteps' => $activePeriod ? $activePeriod->farmingSteps()
        ->where('status', '!=', 'done')
        ->with('masterStep')
        ->get()
        ->map(function ($step) {
          return [
            'id' => $step->id,
            'name' => $step->name, // Uses getNameAttribute accessor
          ];
        }) : [],
    ]);
  }

  public function store(Request $request)
  {
    $user = $request->user();
    $farm = $user->getActiveFarm();

    if (!$farm) {
      return back()->withErrors(['farm' => 'Farm not found']);
    }

    $validated = $request->validate([
      'name' => 'required|string|max:255',
      'category' => 'required|string', // enum?
      'unit' => 'required|string',
      'min_stock' => 'required|numeric|min:0',
    ]);

    InventoryItem::create([
      'farm_id' => $farm->id,
      'name' => $validated['name'],
      'category' => $validated['category'],
      'unit' => $validated['unit'],
      'min_stock' => $validated['min_stock'],
    ]);

    return back()->with('success', 'Item inventaris berhasil ditambahkan.');
  }

  public function storePurchase(Request $request)
  {
    $user = $request->user();
    $farm = $user->getActiveFarm();
    $activePeriod = $farm->activePeriod;

    if (!$activePeriod) {
      return back()->withErrors(['period_id' => 'Tidak ada periode aktif.']);
    }

    $validated = $request->validate([
      'inventory_item_id' => 'required|exists:inventory_items,id',
      'quantity' => 'required|numeric|min:0.01',
      'price_total' => 'required|numeric|min:0',
      'purchase_date' => 'required|date',
      'description' => 'nullable|string|max:255',
    ]);

    DB::transaction(function () use ($validated, $farm, $activePeriod) {
      $pricePerUnit = $validated['price_total'] / $validated['quantity'];
      $itemName = InventoryItem::find($validated['inventory_item_id'])->name;

      // 1. Create Expense Record
      $expense = Expense::create([
        'farm_id' => $farm->id,
        'period_id' => $activePeriod->id,
        'category' => 'belanja_stok', // Or map 'category' from Item?
        'name' => 'Pembelian Stok - ' . $itemName,
        'description' => $validated['description'] ?? 'Pembelian stok ' . $itemName, // Ensure description is filled
        'amount' => $validated['price_total'],
        'expense_date' => $validated['purchase_date'],
        'notes' => 'Generated automatically from Inventory Purchase',
      ]);

      // 2. Create Purchase Record
      InventoryPurchase::create([
        'inventory_item_id' => $validated['inventory_item_id'],
        'farm_id' => $farm->id,
        'period_id' => $activePeriod->id,
        'expense_id' => $expense->id,
        'quantity' => $validated['quantity'],
        'price_per_unit' => $pricePerUnit,
        'purchase_date' => $validated['purchase_date'],
      ]);
    });

    return back()->with('success', 'Stok berhasil dibeli.');
  }

  public function storeUsage(Request $request)
  {
    $user = $request->user();
    $farm = $user->getActiveFarm();
    $activePeriod = $farm->activePeriod;

    if (!$activePeriod) {
      return back()->withErrors(['period_id' => 'Tidak ada periode aktif.']);
    }

    $validated = $request->validate([
      'inventory_item_id' => 'required|exists:inventory_items,id',
      'quantity' => 'required|numeric|min:0.01',
      'used_at' => 'required|date',
      'farming_step_id' => 'nullable|exists:farming_steps,id',
      'notes' => 'nullable|string',
    ]);

    // Check Stock Availability
    $item = InventoryItem::find($validated['inventory_item_id']);
    // Need to calculate current stock manually again or...
    // Re-use logic?
    $totalPurchased = $item->purchases()->sum('quantity');
    $totalUsed = $item->usages()->sum('quantity_used');
    $currentStock = $totalPurchased - $totalUsed;

    if ($validated['quantity'] > $currentStock) {
      return back()->withErrors(['quantity' => 'Stok tidak mencukupi. Sisa: ' . $currentStock . ' ' . $item->unit]);
    }

    InventoryUsage::create([
      'inventory_item_id' => $validated['inventory_item_id'],
      'farm_id' => $farm->id,
      'period_id' => $activePeriod->id,
      'farming_step_id' => $validated['farming_step_id'] ?? null,
      'quantity_used' => $validated['quantity'],
      'usage_date' => $validated['used_at'],
      'notes' => $validated['notes'] ?? null,
    ]);

    return back()->with('success', 'Stok berhasil digunakan.');
  }
}
