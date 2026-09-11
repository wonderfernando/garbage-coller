<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AgendamentoRecolha;
use App\Models\Motorista;
use App\Services\CancelarRecolhaService;
use App\Services\ConcluirRecolhaService;
use App\Services\MotoristaCronogramaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class MotoristaController extends Controller
{
    public function __construct(
        private readonly MotoristaCronogramaService $cronograma,
        private readonly ConcluirRecolhaService $conclusao,
        private readonly CancelarRecolhaService $cancelamento,
    ) {}

    public function cronograma(Request $request): JsonResponse
    {
        $agendamentos = $this->cronograma->consultar(
            $this->motorista($request),
            $request->query('inicio'),
            $request->query('fim'),
        );

        return response()->json($agendamentos);
    }

    public function concluir(Request $request, AgendamentoRecolha $agendamento): JsonResponse
    {
        $agendamento = $this->conclusao->concluir($this->motorista($request), $agendamento);

        return response()->json($agendamento->load(
            'contrato.cliente',
            'contrato.distrito.municipio.provincia',
            'contrato.tipoResiduo',
        ));
    }

    public function cancelar(Request $request, AgendamentoRecolha $agendamento): JsonResponse
    {
        $data = $request->validate([
            'observacao' => ['required', 'string'],
        ]);

        $agendamento = $this->cancelamento->cancelar(
            $this->motorista($request),
            $agendamento,
            $data['observacao'],
        );

        return response()->json($agendamento->load(
            'contrato.cliente',
            'contrato.distrito.municipio.provincia',
            'contrato.tipoResiduo',
        ));
    }

    private function motorista(Request $request): Motorista
    {
        $motorista = $request->user()->motorista;

        if ($motorista === null) {
            throw new NotFoundHttpException('Registo de motorista não encontrado.');
        }

        return $motorista;
    }
}
