<?php

namespace Tests\Feature;

use App\Models\Motorista;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MotoristaAdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_lista_motoristas(): void
    {
        $user = User::factory()->create(['role' => 'motorista', 'nome' => 'Mário Motorista']);
        Motorista::create(['utilizador_id' => $user->id, 'numero_carta' => 'CART-123']);

        $this->actingAsAdmin()
            ->getJson('/api/administracao/motoristas')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.numero_carta', 'CART-123')
            ->assertJsonPath('0.utilizador.nome', 'Mário Motorista');
    }

    public function test_nao_admin_recebe_403(): void
    {
        $cliente = User::factory()->create(['role' => 'cliente']);

        $this->withToken($cliente->createToken('test')->plainTextToken)
            ->getJson('/api/administracao/motoristas')
            ->assertForbidden();
    }

    private function actingAsAdmin(): self
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->withToken($admin->createToken('test')->plainTextToken);

        return $this;
    }
}
