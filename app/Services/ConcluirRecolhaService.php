<?php

namespace App\Services;

use App\Models\AgendamentoRecolha;
use App\Models\Motorista;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ConcluirRecolhaService
{
    public function concluir(Motorista $motorista, AgendamentoRecolha $agendamento): AgendamentoRecolha
    {
        $this->garantirDoMotorista($motorista, $agendamento);
        $this->garantirPendente($agendamento);

        $agendamento->update(['estado' => 'concluido']);

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
                'agendamento' => 'Apenas recolhas pendentes podem ser concluídas.',
            ]);
        }
    }
}
