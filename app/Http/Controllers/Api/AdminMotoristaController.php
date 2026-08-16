<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Motorista;
use Illuminate\Http\JsonResponse;

class AdminMotoristaController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Motorista::with('utilizador')->get());
    }
}
