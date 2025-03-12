<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\JsonCompareController;


Route::post('/json-compare/store-payload', [JsonCompareController::class, 'storePayload']);
Route::get('/json-compare/compare-payloads', [JsonCompareController::class, 'comparePayloads']);
