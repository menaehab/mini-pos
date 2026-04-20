<?php

namespace App\Http\Controllers;

use App\Http\Requests\CustomerPayments\SeachCustomerPaymentRequest;
use App\Http\Requests\CustomerPayments\StoreCustomerPaymentRequest;
use App\Http\Requests\CustomerPayments\UpdateCustomerPaymentRequest;
use App\Models\CustomerPayment;
use App\Models\Sale;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CustomerPaymentController extends Controller
{
    public function index(SeachCustomerPaymentRequest $request)
    {
        $data = $request->validated();
        $payments = CustomerPayment::with('customer', 'allocations.sale', 'user');

        if ($data['search'] ?? false) {
            $payments->where(function ($q) use ($data) {
                $q->where('amount', 'like', '%'.$data['search'].'%')
                    ->orWhereHas('customer', function ($q2) use ($data) {
                        $q2->where('name', 'like', '%'.$data['search'].'%');
                    });
            });
        }

        if ($data['customer_id'] ?? false) {
            $payments->where('customer_id', $data['customer_id']);
        }

        if ($data['date_from'] ?? false) {
            $payments->whereDate('created_at', '>=', $data['date_from']);
        }

        if ($data['date_to'] ?? false) {
            $payments->whereDate('created_at', '<=', $data['date_to']);
        }

        $payments = $payments->latest()->paginate($data['per_page'] ?? 10);

        return inertia('CustomerPayments/Index', [
            'payments' => $payments,
            'filters' => $data,
        ]);
    }

    public function store(StoreCustomerPaymentRequest $request)
    {
        $data = $request->validated();

        DB::transaction(function () use ($data) {
            if (! empty($data['sale_id'])) {
                $sale = Sale::query()
                    ->withSum('payments as paid_amount', 'amount')
                    ->findOrFail($data['sale_id']);

                if ((int) $sale->customer_id !== (int) $data['customer_id']) {
                    throw ValidationException::withMessages([
                        'customer_id' => __('validation.exists', ['attribute' => 'customer_id']),
                    ]);
                }

                $remaining = (float) $sale->remaining;

                if ((float) $data['amount'] > $remaining) {
                    throw ValidationException::withMessages([
                        'amount' => __('validation.max.numeric', [
                            'attribute' => 'amount',
                            'max' => $remaining,
                        ]),
                    ]);
                }
            }

            $payment = CustomerPayment::create([
                'amount' => $data['amount'],
                'note' => $data['note'] ?? null,
                'customer_id' => $data['customer_id'],
                'user_id' => auth()->id(),
            ]);

            if (! empty($data['sale_id'])) {
                $payment->allocations()->create([
                    'sale_id' => $data['sale_id'],
                    'is_first_payment' => false,
                ]);
            }
        });

        return back()->with('success', __('keywords.created', ['name' => 'customer_payment']));
    }

    public function update(UpdateCustomerPaymentRequest $request, CustomerPayment $customerPayment)
    {
        $data = $request->validated();

        DB::transaction(function () use ($customerPayment, $data) {
            $customerPayment->update([
                'amount' => $data['amount'],
                'note' => $data['note'] ?? null,
                'customer_id' => $data['customer_id'],
            ]);
        });

        return back()->with('success', __('keywords.updated', ['name' => 'customer_payment']));
    }

    public function destroy(CustomerPayment $customerPayment)
    {
        DB::transaction(function () use ($customerPayment) {
            $customerPayment->allocations()->delete();
            $customerPayment->delete();
        });

        return back()->with('success', __('keywords.deleted', ['name' => 'customer_payment']));
    }
}
