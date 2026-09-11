<?php

namespace App\Services;

use App\Models\AgendamentoRecolha;
use Illuminate\Support\Collection;

class AdminAgendamentoService
{
    public function consultar(?string $inicio = null, ?string $fim = null): Collection
    {
        [$inicio, $fim] = IntervaloDatas::normalizar($inicio, $fim);

        return AgendamentoRecolha::with(
            'contrato.cliente',
            'contrato.distrito.municipio.provincia',
            'contrato.tipoResiduo',
            'motorista.utilizador',
            'reagendadoPor',
        )
            ->whereBetween('data_recolha', [$inicio->startOfDay(), $fim->endOfDay()])
            ->orderBy('data_recolha')
            ->get();
    }
}
