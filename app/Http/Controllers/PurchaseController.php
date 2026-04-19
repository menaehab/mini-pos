<?php

namespace App\Http\Controllers;

use App\Http\Requests\Purchases\SearchPurchaseRequest;
use App\Http\Requests\Purchases\StorePurchaseRequest;
use App\Http\Requests\Purchases\UpdatePurchaseRequest;
use App\Models\Purchase;
use App\Services\PurchaseService;

class PurchaseController extends Controller
{
    public function __construct(public PurchaseService $purchaseService) {}

    /**
     * Display a listing of the resource.
     */
    public function index(SearchPurchaseRequest $request)
    {
        $data = $request->validated();

        $purchases = Purchase::with('supplier')
            ->when($data['number'] ?? null, function ($query, $number) {
                $query->where('number', 'like', "%$number%");
            })
            ->when($data['supplier_name'] ?? null, function ($query, $supplierName) {
                $query->where('supplier_name', 'like', "%$supplierName%");
            })
            ->when($data['payment_type'] ?? null, function ($query, $paymentType) {
                $query->where('payment_type', $paymentType);
            })
            ->latest()
            ->paginate($data['per_page'] ?? 10)->withQueryString();

        return inertia('Purchases/Index', [
            'purchases' => $purchases,
            'filters' => $data,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('Purchases/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePurchaseRequest $request)
    {
        $data = $request->validated();

        $data['user_id'] = auth()->id();

        $purchase = $this->purchaseService->createPurchase($data);

        return redirect()->route('purchases.index', $purchase)
            ->with('success', __('keywords.created', ['name' => __('keywords.purchase')]));
    }

    /**
     * Display the specified resource.
     */
    public function show(Purchase $purchase)
    {
        $purchase->load('supplier', 'items', 'firstPayment');

        return inertia('Purchases/Show', [
            'purchase' => $purchase,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Purchase $purchase)
    {
        $purchase->load('supplier', 'items');

        return inertia('Purchases/Edit', [
            'purchase' => $purchase,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePurchaseRequest $request, Purchase $purchase)
    {
        $data = $request->validated();

        $purchase = $this->purchaseService->update($purchase, $data);

        return redirect()->route('purchases.index', $purchase)
            ->with('success', __('keywords.updated', ['name' => __('keywords.purchase')]));

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Purchase $purchase)
    {
        $purchase->delete();

        return redirect()->route('purchases.index')
            ->with('success', __('keywords.deleted', ['name' => __('keywords.purchase')]));
    }

    public function getPurchase($number)
    {
        $purchase = Purchase::where('number', $number)->first();

        return $purchase->load('supplier', 'items');
    }
}
