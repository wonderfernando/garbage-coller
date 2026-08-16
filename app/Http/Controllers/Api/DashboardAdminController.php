<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AgendamentoRecolha;
use App\Models\Contrato;
use App\Models\User;
use App\Models\Veiculo;
use Illuminate\Http\JsonResponse;

class DashboardAdminController extends Controller
{
    public function index(): JsonResponse
    {
        $stats = [
            'clientes' => User::where('role', 'cliente')->count(),
            'contratos' => Contrato::count(),
            'motoristas' => User::where('role', 'motorista')->count(),
            'veiculos' => Veiculo::count(),
        ];

        $ultimosAgendamentos = AgendamentoRecolha::with(
            'contrato.cliente',
            'contrato.distrito',
            'contrato.tipoResiduo',
            'motorista.utilizador',
        )
            ->orderByDesc('data_recolha')
            ->limit(5)
            ->get();

        $ultimosContratos = Contrato::with('cliente', 'distrito', 'tipoResiduo')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        return response()->json([
            'stats' => $stats,
            'ultimos_agendamentos' => $ultimosAgendamentos,
            'ultimos_contratos' => $ultimosContratos,
        ]);
    }
}
