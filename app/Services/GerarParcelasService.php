<?php

namespace App\Services;

use App\Models\Contrato;

class GerarParcelasService
{
    public function gerar(Contrato $contrato): void
    {
        if ($contrato->parcelas()->exists()) {
            return;
        }

        $inicio = now()->startOfMonth();

        for ($p = 0; $p < $contrato->duracao_meses; $p++) {
            $contrato->parcelas()->create([
                'numero_parcela' => $p + 1,
                'valor' => $contrato->valor_mensal,
                'data_vencimento' => $inicio->copy()->addMonths($p)->day(5),
                'estado' => 'pendente',
            ]);
        }
    }
}