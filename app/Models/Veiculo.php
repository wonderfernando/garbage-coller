<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['matricula', 'marca_id', 'modelo', 'motorista_id'])]
class Veiculo extends Model
{
    protected $table = 'veiculos';

    public function marca(): BelongsTo
    {
        return $this->belongsTo(MarcaVeiculo::class, 'marca_id');
    }

    public function motorista(): BelongsTo
    {
        return $this->belongsTo(Motorista::class, 'motorista_id');
    }
}
