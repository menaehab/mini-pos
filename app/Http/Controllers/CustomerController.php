<?php

namespace App\Http\Controllers;

use App\Http\Requests\Customers\SearchCustomerRequest;
use App\Http\Requests\Customers\UpdateCustomerRequest;
use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(SearchCustomerRequest $request)
    {
        $data = $request->validated();

        $customers = Customer::query()
            ->when($data['search'] ?? null, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
                $query->orWhere('phone', 'like', "%{$search}%");
                $query->orWhere('address', 'like', "%{$search}%");
                $query->orWhere('national_number', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($data['per_page'] ?? 10)
            ->withQueryString();

        return inertia('Customers/Index', [
            'customers' => $customers,
            'filters' => $data,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validated();
        $customer = Customer::create([
            'name' => $data['name'],
            'phone' => $data['phone'] ?? null,
            'address' => $data['address'] ?? null,
            'national_number' => $data['national_number'] ?? null,
        ]);

        return redirect()->route('customers.index')->with('success', __('keywords.created', ['name' => __('keywords.customer')]));
    }

    /**
     * Display the specified resource.
     */
    public function show(Customer $customer)
    {
        return inertia('Customers/Show', [
            'customer' => $customer,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCustomerRequest $request, Customer $customer)
    {
        $data = $request->validated();
        $customer->update($data);

        return redirect()->route('customers.index')->with('success', __('keywords.updated', ['name' => __('keywords.customer')]));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Customer $customer)
    {
        $customer->delete();

        return redirect()->route('customers.index')->with('success', __('keywords.deleted', ['name' => __('keywords.customer')]));
    }
}
