<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['nome'])]
class Provincia extends Model
{
    protected $table = 'provincias';

    public function municipios(): HasMany
    {
        return $this->hasMany(Municipio::class, 'provincia_id');
    }
}
