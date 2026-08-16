<?php

namespace App\Services;

use App\Models\Contrato;
use App\Models\TipoResiduo;
use Illuminate\Database\QueryException;
use Illuminate\Http\Exceptions\HttpResponseException;

class TipoResiduoService
{
    public function store(array $data): TipoResiduo
    {
        return TipoResiduo::create($data);
    }

    public function update(TipoResiduo $tipoResiduo, array $data): void
    {
        $tipoResiduo->update($data);
    }

    public function delete(TipoResiduo $tipoResiduo): void
    {
        if (Contrato::where('tipo_residuo_id', $tipoResiduo->id)->exists()) {
            throw $this->emUso();
        }

        try {
            $tipoResiduo->delete();
        } catch (QueryException) {
            throw $this->emUso();
        }
    }

    private function emUso(): HttpResponseException
    {
        return new HttpResponseException(response()->json([
            'message' => 'Não é possível eliminar: o tipo de resíduo está associado a contratos.',
        ], 409));
    }
}
