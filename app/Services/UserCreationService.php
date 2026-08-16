<?php

namespace App\Services;

use App\Models\Motorista;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class UserCreationService
{
    public function createCliente(array $data): User
    {
        return User::create([
            'nome' => $data['nome'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => 'cliente',
            'tipo_cliente' => $data['tipo_cliente'] ?? 'particular',
            'nif' => $data['nif'] ?? null,
            'telefone' => $data['telefone'],
            'endereco_principal' => $data['endereco_principal'] ?? null,
        ]);
    }

    public function createAdmin(array $data): User
    {
        return $this->createUser($data, 'admin');
    }

    public function createMotorista(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = $this->createUser($data, 'motorista');

            Motorista::create([
                'utilizador_id' => $user->id,
                'numero_carta' => $data['numero_carta'],
            ]);

            return $user;
        });
    }

    private function createUser(array $data, string $role): User
    {
        return User::create([
            'nome' => $data['nome'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => $role,
            'tipo_cliente' => 'particular',
            'telefone' => $data['telefone'],
        ]);
    }
}
