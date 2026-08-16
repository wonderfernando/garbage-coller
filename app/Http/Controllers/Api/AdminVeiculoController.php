<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Veiculo;
use App\Services\VeiculoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminVeiculoController extends Controller
{
    public function __construct(private readonly VeiculoService $veiculos) {}

    public function index(): JsonResponse
    {
        return response()->json(Veiculo::with('motorista')->orderBy('matricula')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $veiculo = $this->veiculos->store($this->validated($request));

        return response()->json($veiculo->load('motorista'), 201);
    }

    public function show(Veiculo $veiculo): JsonResponse
    {
        return response()->json($veiculo->load('motorista'));
    }

    public function update(Request $request, Veiculo $veiculo): JsonResponse
    {
        $this->veiculos->update($veiculo, $this->validated($request, $veiculo->id));

        return response()->json($veiculo->fresh()->load('motorista'));
    }

    public function destroy(Veiculo $veiculo): JsonResponse
    {
        $this->veiculos->delete($veiculo);

        return response()->json(null, 204);
    }

    private function validated(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'matricula' => ['required', 'string', 'max:20', Rule::unique('veiculos', 'matricula')->ignore($ignoreId)],
            'modelo' => ['nullable', 'string', 'max:100'],
            'motorista_id' => ['nullable', 'integer', 'exists:motoristas,id'],
        ]);
    }
}
