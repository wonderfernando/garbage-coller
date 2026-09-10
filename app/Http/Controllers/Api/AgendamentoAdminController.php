<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AgendamentoRecolha;
use App\Services\AtribuirMotoristaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AgendamentoAdminController extends Controller
{
    public function __construct(private readonly AtribuirMotoristaService $atribuicao) {}

    public function atribuirMotorista(Request $request, AgendamentoRecolha $agendamento): JsonResponse
    {
        $data = $request->validate([
            'motorista_id' => ['nullable', 'integer', 'exists:motoristas,id'],
        ]);

        $agendamento = $this->atribuicao->atribuir($agendamento, $data['motorista_id'] ?? null);

        return response()->json($agendamento->load('motorista.utilizador'));
    }
}