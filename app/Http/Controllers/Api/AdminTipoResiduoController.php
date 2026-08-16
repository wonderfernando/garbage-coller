<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TipoResiduo;
use App\Services\TipoResiduoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminTipoResiduoController extends Controller
{
    public function __construct(private readonly TipoResiduoService $tiposResiduos) {}

    public function index(): JsonResponse
    {
        return response()->json(TipoResiduo::orderBy('nome')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $tipoResiduo = $this->tiposResiduos->store($this->validated($request));

        return response()->json($tipoResiduo, 201);
    }

    public function show(TipoResiduo $tipoResiduo): JsonResponse
    {
        return response()->json($tipoResiduo);
    }

    public function update(Request $request, TipoResiduo $tipoResiduo): JsonResponse
    {
        $this->tiposResiduos->update($tipoResiduo, $this->validated($request, $tipoResiduo->id));

        return response()->json($tipoResiduo->fresh());
    }

    public function destroy(TipoResiduo $tipoResiduo): JsonResponse
    {
        $this->tiposResiduos->delete($tipoResiduo);

        return response()->json(null, 204);
    }

    private function validated(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'nome' => ['required', 'string', 'max:255', Rule::unique('tipos_residuos', 'nome')->ignore($ignoreId)],
            'descricao' => ['required', 'string'],
            'preco_unitario_recolha' => ['required', 'numeric', 'min:0'],
            'taxa_adesao' => ['required', 'numeric', 'min:0'],
        ]);
    }
}
