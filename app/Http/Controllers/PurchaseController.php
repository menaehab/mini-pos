<?php

namespace App\Http\Controllers;

use App\Http\Requests\Purchases\SearchPurchaseRequest;
use App\Http\Requests\Purchases\StorePurchaseRequest;
use App\Models\Purchase;
use Illuminate\Http\Request;

class PurchaseController extends Controller
{
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
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Purchase $purchase)
    {
        $purchase->load('supplier', 'items');

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
    public function update(Request $request, Purchase $purchase)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Purchase $purchase)
    {
        //
    }
}
