<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);
        
        $user = User::create($validated);
        $token = $user->createToken(name: 'api')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        return $this->loginByRole($request, false);
    }

    public function adminLogin(Request $request)
    {
        return $this->loginByRole($request, true);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Cixis edildi.']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    private function loginByRole(Request $request, bool $isAdmin)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email ve ya parol sehvdir.'],
            ]);
        }

        if ((bool) $user->is_admin !== $isAdmin) {
            throw ValidationException::withMessages([
                'email' => [$isAdmin ? 'Bu hesab admin deyil.' : 'Bu endpoint yalniz user ucundur.'],
            ]);
        }

        $tokenName = $isAdmin ? 'admin-api' : 'user-api';
        $token = $user->createToken($tokenName)->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }
}
