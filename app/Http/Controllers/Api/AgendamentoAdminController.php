<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AgendamentoRecolha;
use App\Services\AdminAgendamentoService;
use App\Services\AtribuirMotoristaService;
use App\Services\ReagendarAgendamentoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AgendamentoAdminController extends Controller
{
    public function __construct(
        private readonly AdminAgendamentoService $agendamentos,
        private readonly AtribuirMotoristaService $atribuicao,
        private readonly ReagendarAgendamentoService $reagendamento,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $agendamentos = $this->agendamentos->consultar(
            $request->query('inicio'),
            $request->query('fim'),
        );

        return response()->json($agendamentos);
    }

    public function atribuirMotorista(Request $request, AgendamentoRecolha $agendamento): JsonResponse
    {
        $data = $request->validate([
            'motorista_id' => ['nullable', 'integer', 'exists:motoristas,id'],
        ]);

        $agendamento = $this->atribuicao->atribuir($agendamento, $data['motorista_id'] ?? null);

        return response()->json($agendamento->load('motorista.utilizador'));
    }

    public function reagendar(Request $request, AgendamentoRecolha $agendamento): JsonResponse
    {
        $data = $request->validate([
            'data_recolha' => ['required', 'date'],
        ]);

        $agendamento = $this->reagendamento->reagendar(
            $agendamento,
            Carbon::parse($data['data_recolha']),
            $request->user(),
        );

        return response()->json($agendamento->load('motorista.utilizador', 'reagendadoPor'));
    }
}
