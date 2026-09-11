<?php

namespace App\Services;

use App\Models\AgendamentoRecolha;
use App\Models\DisponibilidadeDistrito;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class ReagendarAgendamentoService
{
    public function reagendar(AgendamentoRecolha $agendamento, Carbon $novaData, User $admin): AgendamentoRecolha
    {
        $this->garantirPendente($agendamento);
        $this->garantirDataFutura($novaData);
        $this->garantirDistritoDisponivel($agendamento, $novaData);
        $this->garantirSemColisao($agendamento, $novaData);

        $agendamento->update([
            'data_recolha_anterior' => $agendamento->data_recolha,
            'data_recolha' => $novaData,
            'reagendado_por_id' => $admin->id,
        ]);

        return $agendamento->refresh();
    }

    private function garantirPendente(AgendamentoRecolha $agendamento): void
    {
        if ($agendamento->estado !== 'pendente') {
            throw ValidationException::withMessages([
                'agendamento' => 'Apenas recolhas pendentes podem ser reagendadas.',
            ]);
        }
    }

    private function garantirDataFutura(Carbon $novaData): void
    {
        if ($novaData->lte(now())) {
            throw ValidationException::withMessages([
                'data_recolha' => 'A nova data de recolha deve ser futura.',
            ]);
        }
    }

    private function garantirDistritoDisponivel(AgendamentoRecolha $agendamento, Carbon $novaData): void
    {
        $disponivel = DisponibilidadeDistrito::where('distrito_id', $agendamento->contrato->distrito_id)
            ->where('dia_semana', $novaData->dayOfWeekIso)
            ->exists();

        if (! $disponivel) {
            throw ValidationException::withMessages([
                'data_recolha' => 'O distrito não tem recolha no dia selecionado.',
            ]);
        }
    }

    private function garantirSemColisao(AgendamentoRecolha $agendamento, Carbon $novaData): void
    {
        if ($agendamento->motorista_id === null) {
            return;
        }

        $colisao = AgendamentoRecolha::where('motorista_id', $agendamento->motorista_id)
            ->where('estado', 'pendente')
            ->where('data_recolha', $novaData)
            ->where('id', '!=', $agendamento->id)
            ->exists();

        if ($colisao) {
            throw ValidationException::withMessages([
                'data_recolha' => 'O motorista já tem outra recolha pendente nesta data.',
            ]);
        }
    }
}
