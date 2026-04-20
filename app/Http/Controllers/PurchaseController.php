<?php

namespace App\Http\Controllers;

use App\Http\Requests\Purchases\SearchPurchaseRequest;
use App\Http\Requests\Purchases\StorePurchaseRequest;
use App\Http\Requests\Purchases\UpdatePurchaseRequest;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Supplier;
use App\Services\PurchaseService;

class PurchaseController extends Controller
{
    public function __construct(public PurchaseService $purchaseService) {}

    public function index(SearchPurchaseRequest $request)
    {
        $search = $request->input('search');
        $paymentType = $request->input('payment_method', $request->input('payment_type'));
        $status = $request->input('status');
        $date = $request->input('date');

        $purchases = Purchase::query()
            ->with('supplier')
            ->withSum('supplierPayments as paid_amount', 'amount')
            ->when($search, function ($query, $search) {
                $query->where(function ($nestedQuery) use ($search) {
                    $nestedQuery->where('number', 'like', "%{$search}%")
                        ->orWhereHas('supplier', function ($supplierQuery) use ($search) {
                            $supplierQuery->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($paymentType, function ($query, $paymentType) {
                $query->where('payment_type', $paymentType);
            })
            ->when($date, function ($query, $date) {
                $query->whereDate('created_at', $date);
            })
            ->when($status === 'paid', function ($query) {
                $query->havingRaw('COALESCE(paid_amount, 0) >= total_price');
            })
            ->when($status === 'unpaid', function ($query) {
                $query->havingRaw('COALESCE(paid_amount, 0) < total_price');
            })
            ->latest()
            ->paginate($request->input('per_page', 10))
            ->withQueryString();

        $purchases->getCollection()->transform(function (Purchase $purchase) {
            $paid = (float) ($purchase->paid_amount ?? 0);
            $total = (float) $purchase->total_price;
            $remaining = max($total - $paid, 0);

            $purchase->setAttribute('invoice_number', $purchase->number);
            $purchase->setAttribute('total', $total);
            $purchase->setAttribute('paid', $paid);
            $purchase->setAttribute('remaining', $remaining);
            $purchase->setAttribute('payment_method', $purchase->payment_type);
            $purchase->setAttribute('status', $remaining <= 0 ? 'paid' : 'unpaid');

            return $purchase;
        });

        return inertia('Purchases/Index', [
            'purchases' => $purchases,
            'filters' => $request->all(),
        ]);
    }

    public function create()
    {
        $suppliers = Supplier::query()->select('id', 'name')->get();
        $products = Product::query()->select('id', 'name', 'stock', 'purchase_price', 'sale_price')->get();

        return inertia('Purchases/Create', [
            'suppliers' => $suppliers,
            'products' => $products,
        ]);
    }

    public function store(StorePurchaseRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id();

        $this->purchaseService->create($data);

        return redirect()->route('purchases.index')
            ->with('success', __('keywords.created', ['name' => __('keywords.purchase')]));
    }

    public function show(Purchase $purchase)
    {
        $purchase->load('supplier', 'items.product', 'supplierPaymentAllocations.supplierPayment');

        $paidAmount = (float) $purchase->supplierPayments()->sum('amount');
        $purchase->setAttribute('paid_amount', $paidAmount);
        $purchase->setAttribute('remaining_amount', max((float) $purchase->total_price - $paidAmount, 0));

        return inertia('Purchases/Show', [
            'purchase' => $purchase,
        ]);
    }

    public function edit(Purchase $purchase)
    {
        $purchase->load('supplier', 'items.product', 'supplierPaymentAllocations.supplierPayment');
        $suppliers = Supplier::query()->select('id', 'name')->get();
        $products = Product::query()->select('id', 'name', 'stock', 'purchase_price', 'sale_price')->get();

        $firstPaymentAmount = (float) $purchase->supplierPaymentAllocations()
            ->where('is_first_payment', true)
            ->with('supplierPayment:id,amount')
            ->get()
            ->sum(fn ($allocation) => (float) ($allocation->supplierPayment?->amount ?? 0));

        $purchase->setAttribute('amount', $firstPaymentAmount);
        $purchase->setAttribute('payment_note', null);

        return inertia('Purchases/Edit', [
            'purchase' => $purchase,
            'suppliers' => $suppliers,
            'products' => $products,
        ]);
    }

    public function update(UpdatePurchaseRequest $request, Purchase $purchase)
    {
        $data = $request->validated();

        $this->purchaseService->update($purchase, $data);

        return redirect()->route('purchases.index')
            ->with('success', __('keywords.updated', ['name' => __('keywords.purchase')]));
    }

    public function destroy(Purchase $purchase)
    {
        $this->purchaseService->delete($purchase);

        return redirect()->route('purchases.index')
            ->with('success', __('keywords.deleted', ['name' => __('keywords.purchase')]));
    }
}
