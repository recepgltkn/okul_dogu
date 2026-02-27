<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    public function show(string $path): JsonResponse
    {
        $doc = Document::where('path', $path)->first();
        return response()->json([
            'exists' => (bool) $doc,
            'path' => $path,
            'data' => $doc?->data,
        ]);
    }

    public function set(Request $request, string $path): JsonResponse
    {
        $data = $request->validate([
            'data' => ['nullable', 'array'],
            'merge' => ['nullable', 'boolean'],
        ]);

        $doc = Document::firstOrNew(['path' => $path]);
        $incoming = $data['data'] ?? [];
        $merge = (bool) ($data['merge'] ?? false);

        $doc->data = $merge && is_array($doc->data)
            ? array_replace_recursive($doc->data, $incoming)
            : $incoming;

        $doc->save();

        return response()->json(['ok' => true, 'path' => $path]);
    }

    public function update(Request $request, string $path): JsonResponse
    {
        $data = $request->validate([
            'patch' => ['required', 'array'],
        ]);

        $doc = Document::firstOrCreate(['path' => $path], ['data' => []]);
        $current = is_array($doc->data) ? $doc->data : [];

        foreach ($data['patch'] as $k => $v) {
            data_set($current, $k, $v);
        }

        $doc->data = $current;
        $doc->save();

        return response()->json(['ok' => true, 'path' => $path]);
    }

    public function delete(string $path): JsonResponse
    {
        Document::where('path', $path)->delete();
        return response()->json(['ok' => true]);
    }

    public function list(Request $request): JsonResponse
    {
        $prefix = trim((string) $request->query('prefix', ''));
        $limit = max(1, min(500, (int) $request->query('limit', 200)));
        $orderBy = (string) $request->query('order_by', 'updated_at');
        $direction = strtolower((string) $request->query('direction', 'desc')) === 'asc' ? 'asc' : 'desc';

        $q = Document::query();
        if ($prefix !== '') {
            $q->where('path', 'like', $prefix . '/%');
        }

        if (!in_array($orderBy, ['updated_at', 'created_at', 'path'], true)) {
            $orderBy = 'updated_at';
        }

        $rows = $q->orderBy($orderBy, $direction)->limit($limit)->get(['path', 'data', 'created_at', 'updated_at']);

        return response()->json([
            'documents' => $rows,
        ]);
    }
}
