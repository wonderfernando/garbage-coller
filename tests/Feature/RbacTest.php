<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RbacTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_acessa_rota_de_criacao_de_contas(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/administracao/utilizadores', [
                'nome' => 'Permitido',
                'email' => 'permitido@example.com',
                'password' => 'palavra-passe',
                'role' => 'admin',
                'telefone' => '+244 900 000 020',
            ])
            ->assertStatus(201);
    }

    public function test_cliente_em_rota_de_admin_recebe_403(): void
    {
        $cliente = User::factory()->create(['role' => 'cliente']);
        $token = $cliente->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/administracao/utilizadores', [
                'nome' => 'Bloqueado',
                'email' => 'bloqueado@example.com',
                'password' => 'palavra-passe',
                'role' => 'admin',
                'telefone' => '+244 900 000 021',
            ])
            ->assertStatus(403);
    }

    public function test_motorista_em_rota_de_admin_recebe_403(): void
    {
        $motorista = User::factory()->create(['role' => 'motorista']);
        $token = $motorista->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/administracao/utilizadores', [
                'nome' => 'Bloqueado',
                'email' => 'bloqueado2@example.com',
                'password' => 'palavra-passe',
                'role' => 'admin',
                'telefone' => '+244 900 000 022',
            ])
            ->assertStatus(403);
    }

    public function test_rota_protegida_sem_token_recebe_401(): void
    {
        $this->postJson('/api/administracao/utilizadores', [
            'nome' => 'Sem Token',
            'email' => 'semtoken@example.com',
            'password' => 'palavra-passe',
            'role' => 'admin',
            'telefone' => '+244 900 000 023',
        ])->assertStatus(401);
    }
}
