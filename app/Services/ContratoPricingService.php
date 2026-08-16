<?php

namespace App\Services;

use App\Models\TipoResiduo;

class ContratoPricingService
{
    /**
     * @return array{taxa_adesao: float, valor_mensal: float, valor_total: float}
     */
    public function calculate(TipoResiduo $tipoResiduo, int $recolhasPorSemana, int $duracaoMeses): array
    {
        $valorMensal = round($recolhasPorSemana * 4 * $tipoResiduo->preco_unitario_recolha, 2);
        $valorTotal = round($tipoResiduo->taxa_adesao + ($valorMensal * $duracaoMeses), 2);

        return [
            'taxa_adesao' => round($tipoResiduo->taxa_adesao, 2),
            'valor_mensal' => $valorMensal,
            'valor_total' => $valorTotal,
        ];
    }
}
