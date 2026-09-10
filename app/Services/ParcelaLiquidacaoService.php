<?php

namespace App\Services;

use App\Models\ParcelaMensalidade;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ParcelaLiquidacaoService
{
    public function liquidar(ParcelaMensalidade $parcela, User $admin, ?string $numeroRecibo = null): ParcelaMensalidade
    {
        $this->garantirPendente($parcela);

        return DB::transaction(function () use ($parcela, $admin, $numeroRecibo) {
            $parcela->update([
                'estado' => 'pago',
                'data_pagamento' => now(),
                'numero_recibo' => $numeroRecibo ?? $this->gerarNumeroRecibo($parcela),
                'registado_por_id' => $admin->id,
            ]);

            return $parcela->refresh();
        });
    }

    private function garantirPendente(ParcelaMensalidade $parcela): void
    {
        if ($parcela->estado !== 'pendente') {
            throw ValidationException::withMessages([
                'parcela' => 'Apenas parcelas pendentes podem ser liquidadas.',
            ]);
        }
    }

    private function gerarNumeroRecibo(ParcelaMensalidade $parcela): string
    {
        return 'REC-'.str_pad((string) $parcela->contrato_id, 4, '0', STR_PAD_LEFT).'-'.$parcela->numero_parcela;
    }
}