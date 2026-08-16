<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['utilizador_id', 'numero_carta'])]
class Motorista extends Model
{
    protected $table = 'motoristas';

    public function utilizador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'utilizador_id');
    }

    public function veiculos(): HasMany
    {
        return $this->hasMany(Veiculo::class, 'motorista_id');
    }
}
