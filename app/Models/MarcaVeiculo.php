<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['nome'])]
class MarcaVeiculo extends Model
{
    protected $table = 'marcas_veiculos';

    public function veiculos(): HasMany
    {
        return $this->hasMany(Veiculo::class, 'marca_id');
    }
}
