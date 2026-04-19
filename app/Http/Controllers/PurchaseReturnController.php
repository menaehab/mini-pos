<?php

namespace App\Http\Controllers;

use App\Http\Requests\PurchaseReturns\SearchPurchaseReturnRequest;
use App\Http\Requests\PurchaseReturns\StorePurchaseReturnRequest;
use App\Http\Requests\PurchaseReturns\UpdatePurchaseReturnRequest;
use App\Models\PurchaseReturn;
use App\Services\PurchaseReturnService;

class PurchaseReturnController extends Controller
{
    public function __construct(public PurchaseReturnService $purchaseReturnService) {}

    /**
     * Display a listing of the resource.
     */
    public function index(SearchPurchaseReturnRequest $request)
    {
        $data = $request->validated();

        $purchaseReturns = PurchaseReturn::with(['purchase.supplier', 'user'])
            ->when($data['search'] ?? null, function ($query, $search) {
                $query->whereHas('purchase', function ($purchaseQuery) use ($search) {
                    $purchaseQuery
                        ->where('supplier_name', 'like', '%'.$search.'%')
                        ->orWhere('number', 'like', '%'.$search.'%');
                });
            })
            ->when($data['supplier_id'] ?? null, function ($query, $supplierId) {
                $query->whereHas('purchase', function ($purchaseQuery) use ($supplierId) {
                    $purchaseQuery->where('supplier_id', $supplierId);
                });
            })
            ->latest()
            ->paginate($data['per_page'] ?? 10)
            ->withQueryString();

        return inertia('PurchaseReturns/Index', [
            'purchaseReturns' => $purchaseReturns,
            'filters' => $data,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('PurchaseReturns/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePurchaseReturnRequest $request)
    {
        $data = $request->validated();

        $this->purchaseReturnService->create($data, (int) auth()->id());

        return back()->with('success', __('keywords.created', ['name' => 'purchase_return']));
    }

    /**
     * Display the specified resource.
     */
    public function show(PurchaseReturn $purchaseReturn)
    {
        return inertia('PurchaseReturns/Show', [
            'purchaseReturn' => $purchaseReturn->load('purchase.supplier', 'items.product', 'user'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PurchaseReturn $purchaseReturn)
    {
        return inertia('PurchaseReturns/Edit', [
            'purchaseReturn' => $purchaseReturn->load('purchase.supplier', 'items.product'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePurchaseReturnRequest $request, PurchaseReturn $purchaseReturn)
    {
        $data = $request->validated();

        $this->purchaseReturnService->update($purchaseReturn, $data);

        return back()->with('success', __('keywords.updated', ['name' => 'purchase_return']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PurchaseReturn $purchaseReturn)
    {
        $purchaseReturn->delete();

        return back()->with('success', __('keywords.deleted', ['name' => 'purchase_return']));
    }
}
