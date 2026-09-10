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
    'numero_recibo',
    'registado_por_id',
    'observacao',
])]
class ParcelaMensalidade extends Model
{
    protected $table = 'parcelas_mensalidades';

    public static $snakeAttributes = false;

    public function contrato(): BelongsTo
    {
        return $this->belongsTo(Contrato::class, 'contrato_id');
    }

    public function registadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registado_por_id');
    }
}