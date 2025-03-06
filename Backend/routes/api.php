<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\JsonCompareController;


Route::post('/json-compare/store-payload', [JsonCompareController::class, 'storePayload']);
