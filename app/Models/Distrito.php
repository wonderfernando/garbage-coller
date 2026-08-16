<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['municipio_id', 'nome'])]
class Distrito extends Model
{
    protected $table = 'distritos';

    public function municipio(): BelongsTo
    {
        return $this->belongsTo(Municipio::class, 'municipio_id');
    }

    public function disponibilidades(): HasMany
    {
        return $this->hasMany(DisponibilidadeDistrito::class, 'distrito_id');
    }
}
