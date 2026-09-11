<?php

namespace App\Services;

use App\Models\AgendamentoRecolha;
use App\Models\Contrato;
use App\Models\ParcelaMensalidade;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AnularContratoService
{
    public function anular(Contrato $contrato, string $motivo = ''): Contrato
    {
        if (! in_array($contrato->estado, ['pendente', 'aprovado'], true)) {
            throw ValidationException::withMessages([
                'contrato' => 'Apenas contratos pendentes ou aprovados podem ser anulados.',
            ]);
        }

        return DB::transaction(function () use ($contrato, $motivo) {
            $contrato->update(['estado' => 'cancelado']);

            AgendamentoRecolha::where('contrato_id', $contrato->id)
                ->where('estado', 'pendente')
                ->update([
                    'estado' => 'cancelado',
                    'observacao' => $motivo !== '' ? $motivo : 'Contrato cancelado',
                ]);

            ParcelaMensalidade::where('contrato_id', $contrato->id)
                ->where('estado', 'pendente')
                ->update(['estado' => 'cancelado']);

            return $contrato->refresh();
        });
    }
}
