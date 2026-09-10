<?php

namespace App\Services;

use App\Models\Contrato;

class GerarAgendamentoService
{
    public function gerar(Contrato $contrato): void
    {
        $dias = $contrato->diasSemana()->pluck('dia_semana');

        if ($dias->isEmpty()) {
            return;
        }

        $data = now()->startOfMonth();
        $fim = $data->copy()->addMonths($contrato->duracao_meses);

        while ($data->lt($fim)) {
            if ($dias->contains($data->dayOfWeekIso)) {
                $contrato->agendamentos()->create([
                    'data_recolha' => $data->copy()->setTime(8, 0, 0),
                    'estado' => 'pendente',
                ]);
            }

            $data->addDay();
        }
    }
}