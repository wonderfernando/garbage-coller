<?php

namespace App\Jobs;

use App\Models\Contrato;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class GerarAgendamentoContrato implements ShouldQueue
{
    use Queueable;

    public function __construct(public Contrato $contrato) {}

    public function handle(): void
    {
        $dias = $this->contrato->diasSemana()->pluck('dia_semana');

        if ($dias->isEmpty()) {
            return;
        }

        $data = now()->startOfMonth();
        $fim = $data->copy()->addMonths($this->contrato->duracao_meses);

        while ($data->lt($fim)) {
            if ($dias->contains($data->dayOfWeekIso)) {
                $this->contrato->agendamentos()->create([
                    'data_recolha' => $data->copy()->setTime(8, 0, 0),
                    'estado' => 'pendente',
                ]);
            }

            $data->addDay();
        }
    }
}
