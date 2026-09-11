<?php

namespace App\Services;

use App\Models\AgendamentoRecolha;
use App\Models\Motorista;
use Illuminate\Support\Collection;

class MotoristaCronogramaService
{
    public function consultar(Motorista $motorista, ?string $inicio = null, ?string $fim = null): Collection
    {
        [$inicio, $fim] = IntervaloDatas::normalizar($inicio, $fim);

        return AgendamentoRecolha::with(
            'contrato.cliente',
            'contrato.distrito.municipio.provincia',
            'contrato.tipoResiduo',
            'motorista.utilizador',
        )
            ->where('motorista_id', $motorista->id)
            ->whereBetween('data_recolha', [$inicio->startOfDay(), $fim->endOfDay()])
            ->orderBy('data_recolha')
            ->get();
    }
}
