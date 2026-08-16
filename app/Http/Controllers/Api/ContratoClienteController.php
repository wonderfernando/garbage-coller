<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contrato;
use App\Services\ContratoClienteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContratoClienteController extends Controller
{
    public function __construct(private readonly ContratoClienteService $contratos) {}

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'distrito_id' => ['required', 'integer', 'exists:distritos,id'],
            'tipo_residuo_id' => ['required', 'integer', 'exists:tipos_residuos,id'],
            'dias_semana' => ['required', 'array', 'min:1', 'max:7'],
            'dias_semana.*' => ['required', 'integer', 'between:1,7', 'distinct'],
            'duracao_meses' => ['required', 'integer', 'min:1'],
            'rua' => ['nullable', 'string', 'max:255'],
            'ponto_referencia' => ['nullable', 'string', 'max:255'],
            'latitude' => ['nullable', 'string', 'max:50'],
            'longitude' => ['nullable', 'string', 'max:50'],
        ]);

        $contrato = $this->contratos->abrir($request->user(), $data);

        return response()->json($contrato->load('diasSemana', 'distrito', 'tipoResiduo'), 201);
    }

    public function index(Request $request): JsonResponse
    {
        $contratos = Contrato::where('cliente_id', $request->user()->id)
            ->with('diasSemana', 'distrito', 'tipoResiduo')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($contratos);
    }

    public function show(Request $request, int $contrato): JsonResponse
    {
        $contratoModel = Contrato::where('id', $contrato)
            ->where('cliente_id', $request->user()->id)
            ->with('diasSemana', 'distrito', 'tipoResiduo')
            ->firstOrFail();

        return response()->json($contratoModel);
    }
}
