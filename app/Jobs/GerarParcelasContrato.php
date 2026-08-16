<?php

namespace App\Jobs;

use App\Models\Contrato;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class GerarParcelasContrato implements ShouldQueue
{
    use Queueable;

    public function __construct(public Contrato $contrato) {}

    public function handle(): void
    {
        if ($this->contrato->parcelas()->exists()) {
            return;
        }

        $inicio = now()->startOfMonth();

        for ($p = 0; $p < $this->contrato->duracao_meses; $p++) {
            $this->contrato->parcelas()->create([
                'numero_parcela' => $p + 1,
                'valor' => $this->contrato->valor_mensal,
                'data_vencimento' => $inicio->copy()->addMonths($p)->day(5),
                'estado' => 'pendente',
            ]);
        }
    }
}
