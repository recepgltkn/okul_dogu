<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'username' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'role' => ['nullable', 'string', 'max:50'],
            'class_name' => ['nullable', 'string', 'max:50'],
            'section' => ['nullable', 'string', 'max:50'],
        ]);

        $user = User::create([
            'name' => $data['name'] ?? ($data['username'] ?? strtok($data['email'], '@')),
            'username' => $data['username'] ?? null,
            'email' => strtolower($data['email']),
            'password' => $data['password'],
            'role' => $data['role'] ?? 'student',
            'class_name' => $data['class_name'] ?? null,
            'section' => $data['section'] ?? null,
        ]);

        return response()->json(['user' => $this->userPayload($user)], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', strtolower($data['email']))->first();
        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Geçersiz giriş bilgileri.'], 422);
        }

        return response()->json(['user' => $this->userPayload($user)]);
    }

    public function me(Request $request): JsonResponse
    {
        $id = (int) $request->query('user_id', 0);
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'Kullanıcı bulunamadı.'], 404);
        }

        return response()->json(['user' => $this->userPayload($user)]);
    }

    public function setPassword(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'new_password' => ['required', 'string', 'min:6'],
        ]);

        $user = User::findOrFail($id);
        $user->password = $data['new_password'];
        $user->save();

        return response()->json(['ok' => true]);
    }

    public function destroy(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['ok' => true]);
    }

    public function logout(): JsonResponse
    {
        return response()->json(['ok' => true]);
    }

    private function userPayload(User $user): array
    {
        return [
            'id' => (string) $user->id,
            'uid' => (string) $user->id,
            'name' => $user->name,
            'displayName' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'role' => $user->role,
            'class_name' => $user->class_name,
            'section' => $user->section,
        ];
    }
}
