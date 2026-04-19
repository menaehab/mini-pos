<?php

namespace App\Http\Controllers;

use App\Http\Requests\SupplierPayment\SearchSupplierPaymentRequest;
use App\Http\Requests\SupplierPayment\StoreSupplierPaymentRequest;
use App\Http\Requests\SupplierPayment\UpdateSupplierPaymentRequest;
use App\Models\SupplierPayment;
use Illuminate\Support\Facades\DB;

class SupplierPaymentController extends Controller
{
    public function index(SearchSupplierPaymentRequest $request)
    {
        $data = $request->validated();
        $payments = SupplierPayment::with('supplier', 'supplierPaymentAllocations.purchase:number');

        if ($data['search'] ?? false) {
            $payments->where(function ($q) use ($data) {
                $q->where('amount', 'like', '%'.$data['search'].'%')
                    ->orWhereHas('supplier', function ($q2) use ($data) {
                        $q2->where('name', 'like', '%'.$data['search'].'%');
                    });
            });
        }

        if ($data['supplier_id'] ?? false) {
            $payments->where('supplier_id', $data['supplier_id']);
        }

        if ($data['date_from'] ?? false) {
            $payments->whereDate('created_at', '>=', $data['date_from']);
        }

        if ($data['date_to'] ?? false) {
            $payments->whereDate('created_at', '<=', $data['date_to']);
        }

        $payments = $payments->latest()->paginate($data['per_page'] ?? 10);

        return inertia('SupplierPayments/Index', [
            'payments' => $payments,
            'filters' => $data,
        ]);
    }

    public function store(StoreSupplierPaymentRequest $request)
    {
        $data = $request->validated();

        DB::transaction(function () use ($data) {
            SupplierPayment::create([
                'amount' => $data['amount'],
                'note' => $data['note'] ?? null,
                'supplier_id' => $data['supplier_id'],
                'user_id' => auth()->id(),
            ]);
        });

        return back()->with('success', __('keywords.created', ['name' => 'supplier_payment']));
    }

    public function update(UpdateSupplierPaymentRequest $request, SupplierPayment $supplierPayment)
    {
        $data = $request->validated();

        DB::transaction(function () use ($supplierPayment, $data) {
            $supplierPayment->update([
                'amount' => $data['amount'],
                'note' => $data['note'] ?? null,
                'supplier_id' => $data['supplier_id'],
            ]);
        });

        return back()->with('success', __('keywords.updated', ['name' => 'supplier_payment']));
    }

    public function destroy(SupplierPayment $supplierPayment)
    {
        DB::transaction(function () use ($supplierPayment) {
            $supplierPayment->supplierPaymentAllocations()->delete();
            $supplierPayment->delete();
        });

        return back()->with('success', __('keywords.deleted', ['name' => 'supplier_payment']));
    }
}
