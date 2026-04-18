<?php

namespace App\Http\Controllers;

use App\Http\Requests\Purchases\SearchPurchaseRequest;
use App\Http\Requests\Purchases\StorePurchaseRequest;
use App\Models\Purchase;
use App\Models\SupplierPayment;
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
        $data = $request->validated();

        $data['user_id'] = auth()->id();

        $purchase = Purchase::create($data);

        $payment = SupplierPayment::create([
            'supplier_id' => $data['supplier_id'],
            'amount' => $data['amount'],
        ]);

        $purchase->supplierPaymentAllocations()->create([
            'supplier_payment_id' => $payment->id,
            'amount' => $data['amount'],
        ]);
        $total = 0;
        foreach ($data['items'] as $item) {
            $total += $item['quantity'] * $item['purchase_price'];
            $purchase->items()->create([
                'item_id' => $item['item_id'],
                'quantity' => $item['quantity'],
                'purchase_price' => $item['purchase_price'],
            ]);
        }

        $purchase->update([
            'total_price' => $total,
        ]);

        return redirect()->route('purchases.index', $purchase)
            ->with('success', __('keywords.created', ['name' => __('keywords.purchase')])));
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
        $purchase->load('supplier', 'items');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Purchase $purchase)
    {
        //
    }
}