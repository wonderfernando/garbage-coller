<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'cliente_id',
    'distrito_id',
    'tipo_residuo_id',
    'taxa_adesao',
    'valor_mensal',
    'valor_total',
    'frequencia_semanal',
    'duracao_meses',
    'estado',
    'latitude',
    'longitude',
    'rua',
    'ponto_referencia',
])]
class Contrato extends Model
{
    protected $table = 'contratos';

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cliente_id');
    }

    public function distrito(): BelongsTo
    {
        return $this->belongsTo(Distrito::class, 'distrito_id');
    }

    public function tipoResiduo(): BelongsTo
    {
        return $this->belongsTo(TipoResiduo::class, 'tipo_residuo_id');
    }

    public function diasSemana(): HasMany
    {
        return $this->hasMany(ContratoDiaSemana::class, 'contrato_id');
    }

    public function parcelas(): HasMany
    {
        return $this->hasMany(ParcelaMensalidade::class, 'contrato_id');
    }

    public function agendamentos(): HasMany
    {
        return $this->hasMany(AgendamentoRecolha::class, 'contrato_id');
    }
}
