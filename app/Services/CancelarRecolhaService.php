<?php

namespace App\Services;

use App\Models\AgendamentoRecolha;
use App\Models\Motorista;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class CancelarRecolhaService
{
    public function cancelar(Motorista $motorista, AgendamentoRecolha $agendamento, string $observacao): AgendamentoRecolha
    {
        $this->garantirDoMotorista($motorista, $agendamento);
        $this->garantirPendente($agendamento);
        $this->garantirObservacao($observacao);

        $agendamento->update([
            'estado' => 'cancelado',
            'observacao' => $observacao,
        ]);

        return $agendamento->refresh();
    }

    private function garantirDoMotorista(Motorista $motorista, AgendamentoRecolha $agendamento): void
    {
        if ($agendamento->motorista_id !== $motorista->id) {
            throw new NotFoundHttpException('Recolha não encontrada.');
        }
    }

    private function garantirPendente(AgendamentoRecolha $agendamento): void
    {
        if ($agendamento->estado !== 'pendente') {
            throw ValidationException::withMessages([
                'agendamento' => 'Apenas recolhas pendentes podem ser canceladas.',
            ]);
        }
    }

    private function garantirObservacao(string $observacao): void
    {
        if (trim($observacao) === '') {
            throw ValidationException::withMessages([
                'observacao' => 'Indique o motivo do cancelamento.',
            ]);
        }
    }
}
