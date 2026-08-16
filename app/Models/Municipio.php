<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['provincia_id', 'nome'])]
class Municipio extends Model
{
    protected $table = 'municipios';

    public function provincia(): BelongsTo
    {
        return $this->belongsTo(Provincia::class, 'provincia_id');
    }

    public function distritos(): HasMany
    {
        return $this->hasMany(Distrito::class, 'municipio_id');
    }
}
