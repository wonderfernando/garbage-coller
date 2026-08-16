<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CriacaoContasAdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_cria_conta_de_motorista(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/administracao/utilizadores', [
            'nome' => 'Mário Motorista',
            'email' => 'mario@example.com',
            'password' => 'palavra-passe',
            'role' => 'motorista',
            'telefone' => '+244 900 000 010',
            'numero_carta' => 'CART-123',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('user.role', 'motorista');

        $user = User::where('email', 'mario@example.com')->first();
        $this->assertNotNull($user);

        $this->assertDatabaseHas('motoristas', [
            'utilizador_id' => $user->id,
            'numero_carta' => 'CART-123',
        ]);
    }

    public function test_admin_cria_conta_de_admin(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/administracao/utilizadores', [
            'nome' => 'Ana Admin',
            'email' => 'ana@example.com',
            'password' => 'palavra-passe',
            'role' => 'admin',
            'telefone' => '+244 900 000 011',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('user.role', 'admin');
    }

    public function test_motorista_sem_dados_de_motorista_e_rejeitado(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/administracao/utilizadores', [
            'nome' => 'Sem Dados',
            'email' => 'semdados@example.com',
            'password' => 'palavra-passe',
            'role' => 'motorista',
            'telefone' => '+244 900 000 012',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['numero_carta']);
    }

    public function test_nao_admin_nao_pode_criar_contas(): void
    {
        $cliente = User::factory()->create(['role' => 'cliente']);
        $token = $cliente->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/administracao/utilizadores', [
            'nome' => 'Falhado',
            'email' => 'falhado@example.com',
            'password' => 'palavra-passe',
            'role' => 'motorista',
            'telefone' => '+244 900 000 013',
            'numero_carta' => 'CART-999',
        ]);

        $response->assertStatus(403);

        $this->assertDatabaseMissing('utilizadores', [
            'email' => 'falhado@example.com',
        ]);
    }
}
