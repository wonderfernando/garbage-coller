<?php

namespace App\Services;

use App\Models\Veiculo;
use Illuminate\Http\Exceptions\HttpResponseException;

class VeiculoService
{
    public function store(array $data): Veiculo
    {
        return Veiculo::create($data);
    }

    public function update(Veiculo $veiculo, array $data): void
    {
        $veiculo->update($data);
    }

    public function delete(Veiculo $veiculo): void
    {
        if ($veiculo->motorista_id !== null) {
            throw new HttpResponseException(response()->json([
                'message' => 'Não é possível eliminar: o veículo está alocado a um motorista.',
            ], 409));
        }

        $veiculo->delete();
    }
}
