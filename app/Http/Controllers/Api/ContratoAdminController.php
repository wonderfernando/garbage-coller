<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contrato;
use App\Services\AnularContratoService;
use App\Services\ContratoAprovacaoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContratoAdminController extends Controller
{
    public function __construct(
        private readonly ContratoAprovacaoService $aprovacao,
        private readonly AnularContratoService $anular,
    ) {}

    public function index(): JsonResponse
    {
        $contratos = Contrato::with('cliente', 'distrito', 'tipoResiduo', 'diasSemana')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($contratos);
    }

    public function show(Contrato $contrato): JsonResponse
    {
        return response()->json($contrato->load(
            'cliente',
            'distrito.municipio.provincia',
            'tipoResiduo',
            'diasSemana',
            'parcelas.registadoPor',
            'agendamentos.motorista.utilizador',
        ));
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

    public function anular(Request $request, Contrato $contrato): JsonResponse
    {
        $data = $request->validate([
            'motivo' => ['nullable', 'string', 'max:255'],
        ]);

        $this->anular->anular($contrato, trim((string) ($data['motivo'] ?? '')));

        return response()->json($contrato->load(
            'cliente',
            'distrito.municipio.provincia',
            'tipoResiduo',
            'diasSemana',
            'parcelas.registadoPor',
            'agendamentos.motorista.utilizador',
        ));
    }
}
