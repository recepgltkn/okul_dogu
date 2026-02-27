<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StudentReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentReportController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'report_type' => ['nullable', 'string', 'max:100'],
            'payload' => ['required', 'array'],
        ]);

        $report = StudentReport::create([
            'user_id' => $data['user_id'],
            'report_type' => $data['report_type'] ?? 'general',
            'report_payload' => $data['payload'],
        ]);

        return response()->json(['id' => $report->id, 'ok' => true], 201);
    }
}
