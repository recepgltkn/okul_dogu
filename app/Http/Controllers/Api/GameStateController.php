<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GameState;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GameStateController extends Controller
{
    public function show(Request $request, string $key): JsonResponse
    {
        $userId = (int) $request->query('user_id', 0);
        if ($userId <= 0) {
            return response()->json(['message' => 'user_id gerekli.'], 422);
        }

        $state = GameState::where('user_id', $userId)->where('state_key', $key)->first();

        return response()->json([
            'key' => $key,
            'payload' => $state?->state_payload,
        ]);
    }

    public function upsert(Request $request, string $key): JsonResponse
    {
        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'payload' => ['required', 'array'],
        ]);

        $state = GameState::updateOrCreate(
            ['user_id' => $data['user_id'], 'state_key' => $key],
            ['state_payload' => $data['payload']]
        );

        return response()->json(['id' => $state->id, 'ok' => true]);
    }
}
