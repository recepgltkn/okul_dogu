<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\GameStateController;
use App\Http\Controllers\Api\StudentReportController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/me', [AuthController::class, 'me']);
Route::put('/users/{id}/password', [AuthController::class, 'setPassword']);
Route::delete('/users/{id}', [AuthController::class, 'destroy']);

Route::get('/docs/{path}', [DocumentController::class, 'show'])->where('path', '.*');
Route::put('/docs/{path}', [DocumentController::class, 'set'])->where('path', '.*');
Route::patch('/docs/{path}', [DocumentController::class, 'update'])->where('path', '.*');
Route::delete('/docs/{path}', [DocumentController::class, 'delete'])->where('path', '.*');
Route::get('/docs', [DocumentController::class, 'list']);

Route::get('/game-state/{key}', [GameStateController::class, 'show']);
Route::put('/game-state/{key}', [GameStateController::class, 'upsert']);

Route::post('/student-reports', [StudentReportController::class, 'store']);
