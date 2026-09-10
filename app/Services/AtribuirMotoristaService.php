<?php

namespace App\Services;

use App\Models\AgendamentoRecolha;
use Illuminate\Validation\ValidationException;

class AtribuirMotoristaService
{
    public function atribuir(AgendamentoRecolha $agendamento, ?int $motoristaId): AgendamentoRecolha
    {
        $this->garantirAtribuivel($agendamento);

        $agendamento->update(['motorista_id' => $motoristaId]);

        return $agendamento->refresh();
    }

    private function garantirAtribuivel(AgendamentoRecolha $agendamento): void
    {
        if ($agendamento->estado !== 'pendente') {
            throw ValidationException::withMessages([
                'agendamento' => 'Apenas recolhas pendentes podem ter motorista atribuído.',
            ]);
        }
    }
}