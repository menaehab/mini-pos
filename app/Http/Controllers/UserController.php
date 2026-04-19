<?php

namespace App\Http\Controllers;

use App\Http\Requests\Users\SearchUserRequest;
use App\Http\Requests\Users\StoreUserRequest;
use App\Http\Requests\Users\UpdateUserRequest;
use App\Models\User;
use Spatie\Permission\Models\Permission;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
  public function index(SearchUserRequest $request)
{
    $data = $request->validated();

    $users = User::query()
        ->with('permissions:name')
        ->when($data['search'] ?? null, function ($query, $search) {
            // تجميع شروط البحث في قوسين داخل الكويري
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        })
        ->latest()
        ->paginate($data['per_page'] ?? 10)
        ->withQueryString();

    $permissions = Permission::pluck('name');

    return inertia('Users/Index', [
        'users' => $users,
        'filters' => $data,
        'permissions' => $permissions,
    ]);
}
    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => bcrypt($data['password']),
        ]);

        $user->syncPermissions($data['permissions'] ?? []);

        return redirect()->route('users.index')->with('success', __('keywords.created', ['name' => __('keywords.user')]));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        $data = $request->validated();

        $user->update([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => ! empty($data['password'] ?? null) ? bcrypt($data['password']) : $user->password,
        ]);

        $user->syncPermissions($data['permissions'] ?? []);

        return redirect()->route('users.index')->with('success', __('keywords.updated', ['name' => __('keywords.user')]));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('users.index')->with('success', __('keywords.deleted', ['name' => __('keywords.user')]));
    }
}
