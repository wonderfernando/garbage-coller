<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MarcaVeiculo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MarcaVeiculoController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(MarcaVeiculo::orderBy('nome')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nome' => ['required', 'string', 'max:50', 'unique:marcas_veiculos,nome'],
        ]);

        $marca = MarcaVeiculo::create($data);

        return response()->json($marca, 201);
    }
}
