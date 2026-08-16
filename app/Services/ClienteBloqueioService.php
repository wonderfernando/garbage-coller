<?php

namespace App\Services;

use App\Models\User;

class ClienteBloqueioService
{
    public function bloquear(User $cliente, string $motivo): User
    {
        $cliente->update([
            'bloqueado' => true,
            'motivo_bloqueio' => $motivo,
        ]);

        $cliente->tokens()->delete();

        return $cliente;
    }

    public function desbloquear(User $cliente): User
    {
        $cliente->update([
            'bloqueado' => false,
            'motivo_bloqueio' => null,
        ]);

        return $cliente;
    }
}
