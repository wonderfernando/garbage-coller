<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'contrato_id',
    'numero_parcela',
    'valor',
    'data_vencimento',
    'estado',
    'data_pagamento',
    'data_due',
    'registado_por_id',
    'numero_recibo',
])]
class ParcelaMensalidade extends Model
{
    protected $table = 'parcelas_mensalidades';

    public function contrato(): BelongsTo
    {
        return $this->belongsTo(Contrato::class, 'contrato_id');
    }

    public function registadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registado_por_id');
    }
}
