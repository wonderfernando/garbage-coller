<?php

namespace Tests\Feature;

use App\Models\MarcaVeiculo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MarcaVeiculoTest extends TestCase
{
    use RefreshDatabase;

    public function test_lista_marcas_devolve_as_precadastradas(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->withToken($admin->createToken('test')->plainTextToken)
            ->getJson('/api/administracao/marcas-veiculos')
            ->assertOk()
            ->assertJsonCount(5)
            ->assertJsonPath('0.nome', 'Chevrolet');
    }

    public function test_admin_cria_nova_marca(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->withToken($admin->createToken('test')->plainTextToken)
            ->postJson('/api/administracao/marcas-veiculos', ['nome' => 'Volvo'])
            ->assertCreated()
            ->assertJsonPath('nome', 'Volvo');

        $this->assertDatabaseCount('marcas_veiculos', 6);
    }

    public function test_nao_aceita_marca_duplicada(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->withToken($admin->createToken('test')->plainTextToken)
            ->postJson('/api/administracao/marcas-veiculos', ['nome' => 'Toyota'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['nome']);
    }

    public function test_admin_regista_veiculo_com_marca(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $marca = MarcaVeiculo::query()->firstWhere('nome', 'Toyota');

        $this->withToken($admin->createToken('test')->plainTextToken)
            ->postJson('/api/administracao/veiculos', [
                'matricula' => 'LD-20-11-AB',
                'marca_id' => $marca->id,
                'modelo' => 'Hilux',
            ])
            ->assertCreated()
            ->assertJsonPath('marca.nome', 'Toyota');

        $this->assertDatabaseHas('veiculos', [
            'matricula' => 'LD-20-11-AB',
            'marca_id' => $marca->id,
        ]);
    }

    public function test_veiculo_nao_aceita_marca_inexistente(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->withToken($admin->createToken('test')->plainTextToken)
            ->postJson('/api/administracao/veiculos', [
                'matricula' => 'LD-20-11-AB',
                'marca_id' => 99999,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['marca_id']);
    }

    public function test_nao_admin_recebe_403(): void
    {
        $cliente = User::factory()->create(['role' => 'cliente']);

        $this->withToken($cliente->createToken('test')->plainTextToken)
            ->postJson('/api/administracao/marcas-veiculos', ['nome' => 'Volvo'])
            ->assertForbidden();
    }

    public function test_sem_token_recebe_401(): void
    {
        $this->postJson('/api/administracao/marcas-veiculos', ['nome' => 'Volvo'])
            ->assertUnauthorized();
    }
}
