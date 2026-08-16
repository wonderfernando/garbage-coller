<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['nome', 'descricao', 'preco_unitario_recolha', 'taxa_adesao'])]
class TipoResiduo extends Model
{
    protected $table = 'tipos_residuos';
}
