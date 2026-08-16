<?php

namespace Tests\Feature;

use App\Models\Motorista;
use App\Models\User;
use App\Models\Veiculo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VeiculoAdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_lista_veiculos(): void
    {
        Veiculo::create(['matricula' => 'LD-20-11-AB', 'modelo' => 'Camião']);

        $this->actingAsAdmin()
            ->getJson('/api/administracao/veiculos')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.matricula', 'LD-20-11-AB');
    }

    public function test_admin_regista_veiculo_sem_motorista(): void
    {
        $this->actingAsAdmin()
            ->postJson('/api/administracao/veiculos', [
                'matricula' => 'LD-20-11-AB',
                'modelo' => 'Camião de 3 eixos',
            ])
            ->assertCreated()
            ->assertJsonPath('matricula', 'LD-20-11-AB')
            ->assertJsonPath('modelo', 'Camião de 3 eixos');

        $this->assertDatabaseHas('veiculos', [
            'matricula' => 'LD-20-11-AB',
            'motorista_id' => null,
        ]);
    }

    public function test_registo_com_matricula_duplicada_e_rejeitado(): void
    {
        Veiculo::create(['matricula' => 'LD-20-11-AB']);

        $this->actingAsAdmin()
            ->postJson('/api/administracao/veiculos', ['matricula' => 'LD-20-11-AB'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['matricula']);
    }

    public function test_admin_consulta_veiculo(): void
    {
        $veiculo = Veiculo::create(['matricula' => 'LD-20-11-AB']);

        $this->actingAsAdmin()
            ->getJson("/api/administracao/veiculos/{$veiculo->id}")
            ->assertOk()
            ->assertJsonPath('matricula', 'LD-20-11-AB');
    }

    public function test_admin_atualiza_veiculo(): void
    {
        $veiculo = Veiculo::create(['matricula' => 'LD-20-11-AB']);

        $this->actingAsAdmin()
            ->patchJson("/api/administracao/veiculos/{$veiculo->id}", [
                'matricula' => 'LD-20-11-AC',
                'modelo' => 'Camião compactador',
            ])
            ->assertOk()
            ->assertJsonPath('matricula', 'LD-20-11-AC');

        $this->assertDatabaseHas('veiculos', [
            'id' => $veiculo->id,
            'matricula' => 'LD-20-11-AC',
        ]);
    }

    public function test_admin_aloca_veiculo_a_motorista(): void
    {
        $veiculo = Veiculo::create(['matricula' => 'LD-20-11-AB']);
        $motorista = $this->makeMotorista();

        $this->actingAsAdmin()
            ->patchJson("/api/administracao/veiculos/{$veiculo->id}", [
                'matricula' => 'LD-20-11-AB',
                'motorista_id' => $motorista->id,
            ])
            ->assertOk()
            ->assertJsonPath('motorista.id', $motorista->id);

        $this->assertDatabaseHas('veiculos', [
            'id' => $veiculo->id,
            'motorista_id' => $motorista->id,
        ]);
    }

    public function test_admin_desaloca_veiculo_de_motorista(): void
    {
        $motorista = $this->makeMotorista();
        $veiculo = Veiculo::create(['matricula' => 'LD-20-11-AB', 'motorista_id' => $motorista->id]);

        $this->actingAsAdmin()
            ->patchJson("/api/administracao/veiculos/{$veiculo->id}", [
                'matricula' => 'LD-20-11-AB',
                'motorista_id' => null,
            ])
            ->assertOk()
            ->assertJsonPath('motorista', null);

        $this->assertDatabaseHas('veiculos', [
            'id' => $veiculo->id,
            'motorista_id' => null,
        ]);
    }

    public function test_admin_elimina_veiculo_sem_motorista(): void
    {
        $veiculo = Veiculo::create(['matricula' => 'LD-20-11-AB']);

        $this->actingAsAdmin()
            ->deleteJson("/api/administracao/veiculos/{$veiculo->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('veiculos', ['id' => $veiculo->id]);
    }

    public function test_eliminacao_de_veiculo_com_motorista_e_bloqueada(): void
    {
        $motorista = $this->makeMotorista();
        $veiculo = Veiculo::create(['matricula' => 'LD-20-11-AB', 'motorista_id' => $motorista->id]);

        $this->actingAsAdmin()
            ->deleteJson("/api/administracao/veiculos/{$veiculo->id}")
            ->assertStatus(409)
            ->assertJsonPath('message', 'Não é possível eliminar: o veículo está alocado a um motorista.');

        $this->assertDatabaseHas('veiculos', ['id' => $veiculo->id]);
    }

    public function test_nao_admin_recebe_403(): void
    {
        $cliente = User::factory()->create(['role' => 'cliente']);

        $this->withToken($cliente->createToken('test')->plainTextToken)
            ->postJson('/api/administracao/veiculos', ['matricula' => 'LD-20-11-AB'])
            ->assertForbidden();
    }

    private function actingAsAdmin(): self
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->withToken($admin->createToken('test')->plainTextToken);

        return $this;
    }

    private function makeMotorista(): Motorista
    {
        $user = User::factory()->create(['role' => 'motorista']);

        return Motorista::create(['utilizador_id' => $user->id, 'numero_carta' => 'CART-123']);
    }
}
