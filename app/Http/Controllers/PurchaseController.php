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

    public function index(SearchPurchaseRequest $request)
    {
        // استقبال الفلاتر بأسماء الفرونت إند
        $search = $request->input('search');
        $paymentMethod = $request->input('payment_method');
        $status = $request->input('status'); // لو عندك حالة
        $date = $request->input('date');

        $purchases = Purchase::with('supplier')
            ->when($search, function ($query, $search) {
                // بحث برقم الفاتورة أو اسم المورد
                $query->where('invoice_number', 'like', "%$search%")
                      ->orWhereHas('supplier', function ($q) use ($search) {
                          $q->where('name', 'like', "%$search%");
                      });
            })
            ->when($paymentMethod, function ($query, $paymentMethod) {
                $query->where('payment_method', $paymentMethod);
            })
            ->when($date, function ($query, $date) {
                $query->whereDate('created_at', $date);
            })
            ->latest()
            ->paginate($request->input('per_page', 10))
            ->withQueryString();

        return inertia('Purchases/Index', [
            'purchases' => $purchases,
            'filters' => $request->all(),
        ]);
    }

    public function create()
    {
        // هنبعت الموردين والمنتجات للفرونت عشان يختار منها
        $suppliers = \App\Models\Supplier::select('id', 'name')->get();
        $products = \App\Models\Product::select('id', 'name', 'stock')->get();

        return inertia('Purchases/Create', [
            'suppliers' => $suppliers,
            'products' => $products,
        ]);
    }

    public function store(StorePurchaseRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id();

        // اتعدلت لـ create بدل createPurchase
        $purchase = $this->purchaseService->create($data); 

        return redirect()->route('purchases.index')
            ->with('success', __('keywords.created', ['name' => __('keywords.purchase')]));
    }

    public function show(Purchase $purchase)
    {
        $purchase->load('supplier', 'items.product', 'firstPayment');

        return inertia('Purchases/Show', [
            'purchase' => $purchase,
        ]);
    }

    public function edit(Purchase $purchase)
    {
        $purchase->load('supplier', 'items.product');
        $suppliers = \App\Models\Supplier::select('id', 'name')->get();
        $products = \App\Models\Product::select('id', 'name', 'stock')->get();

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
        // استدعاء دالة الحذف الآمنة من السيرفيس عشان نرجع المخزون
        $this->purchaseService->delete($purchase);

        return redirect()->route('purchases.index')
            ->with('success', __('keywords.deleted', ['name' => __('keywords.purchase')]));
    }
}