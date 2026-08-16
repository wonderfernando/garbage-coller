<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contrato;
use App\Services\ContratoAprovacaoService;
use Illuminate\Http\JsonResponse;

class ContratoAdminController extends Controller
{
    public function __construct(private readonly ContratoAprovacaoService $aprovacao) {}

    public function index(): JsonResponse
    {
        $contratos = Contrato::with('cliente', 'distrito', 'tipoResiduo', 'diasSemana')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($contratos);
    }

    public function aprovar(Contrato $contrato): JsonResponse
    {
        $this->aprovacao->aprovar($contrato);

        return response()->json($contrato->load('parcelas', 'agendamentos'));
    }

    public function rejeitar(Contrato $contrato): JsonResponse
    {
        $this->aprovacao->rejeitar($contrato);

        return response()->json($contrato);
    }
}
