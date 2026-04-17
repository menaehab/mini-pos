<?php

namespace App\Http\Controllers;

use App\Http\Requests\Suppliers\SearchSupplierRequest;
use App\Http\Requests\Suppliers\StoreSupplierRequest;
use App\Http\Requests\Suppliers\UpdateSupplierRequest;
use App\Models\Supplier;

class SupplierController extends Controller
{
    public function index(SearchSupplierRequest $request)
    {
        $data = $request->validated();

        $suppliers = Supplier::query()
            ->when($data['search'] ?? null, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
                $query->orWhere('phone', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($data['per_page'] ?? 10)
            ->withQueryString();

        return inertia('Suppliers/Index', [
            'suppliers' => $suppliers,
            'filters' => $data,
        ]);
    }

    public function create()
    {
        return inertia('Suppliers/Create');
    }

    public function store(StoreSupplierRequest $request)
    {
        $data = $request->validated();
        $suppliers = Supplier::create([
            'name' => $data['name'],
        ]);

        return redirect()->route('suppliers.index')->with('success', __('keywords.created', ['name' => __('keywords.supplier')]));

    }

    public function show(Supplier $supplier)
    {
        return inertia('Suppliers/show', [
            'supplier' => $supplier,
        ]);
    }

    public function edit(Supplier $supplier)
    {
        return inertia('Suppliers/Edit', [
            'supplier' => $supplier,
        ]);
    }

    public function update(UpdateSupplierRequest $request, Supplier $supplier)
    {
        $data = $request->validated();

        $supplier->update([
            'name' => $data['name'],
        ]);

        return redirect()->route('suppliers.index')->with('success', __('keywords.updated', ['name' => __('keywords.supplier')]));
    }

    public function destroy(Supplier $supplier)
    {
        $supplier->delete();

        return redirect()->route('suppliers.index')->with('success', __('keywords.deleted', ['name' => __('keywords.supplier')]));
    }

    // ─────────────────────────────────────────────
    // Search Suppliers
    // ─────────────────────────────────────────────
    public function searchSuppliers(SearchSupplierRequest $request)
    {
        $limit = min($request->per_page ?? 20, 50);
        $suppliers = Supplier::query()
            ->when($request->search, fn ($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->select('id', 'name', 'phone')
            ->orderBy('name')
            ->limit($limit)
            ->get();

        return response()->json([
            'data' => $suppliers,
        ]);
    }

    // ─────────────────────────────────────────────
    // Store Supplier
    // ─────────────────────────────────────────────

    public function storeSupplier(StoreSupplierRequest $request)
    {
        return Supplier::create($request->validated());
    }
}
