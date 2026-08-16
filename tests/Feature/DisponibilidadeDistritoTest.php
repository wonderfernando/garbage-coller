<?php

namespace Tests\Feature;

use App\Models\DisponibilidadeDistrito;
use App\Models\Distrito;
use App\Models\Municipio;
use App\Models\Provincia;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DisponibilidadeDistritoTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_adiciona_dia_a_disponibilidade_do_distrito(): void
    {
        $distrito = $this->makeDistrito();

        $this->actingAsAdmin()
            ->postJson("/api/administracao/distritos/{$distrito->id}/disponibilidade", [
                'dia_semana' => 3,
            ])
            ->assertCreated()
            ->assertJsonPath('distrito_id', $distrito->id)
            ->assertJsonPath('dia_semana', 3);

        $this->assertDatabaseHas('disponibilidade_distrito', [
            'distrito_id' => $distrito->id,
            'dia_semana' => 3,
        ]);
    }

    public function test_adicionar_dia_duplicado_e_rejeitado(): void
    {
        $distrito = $this->makeDistrito();
        DisponibilidadeDistrito::create(['distrito_id' => $distrito->id, 'dia_semana' => 2]);

        $this->actingAsAdmin()
            ->postJson("/api/administracao/distritos/{$distrito->id}/disponibilidade", [
                'dia_semana' => 2,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['dia_semana']);
    }

    public function test_dia_fora_do_intervalo_e_rejeitado(): void
    {
        $distrito = $this->makeDistrito();

        $this->actingAsAdmin()
            ->postJson("/api/administracao/distritos/{$distrito->id}/disponibilidade", [
                'dia_semana' => 8,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['dia_semana']);
    }

    public function test_admin_remove_dia_da_disponibilidade_do_distrito(): void
    {
        $distrito = $this->makeDistrito();
        DisponibilidadeDistrito::create(['distrito_id' => $distrito->id, 'dia_semana' => 5]);

        $this->actingAsAdmin()
            ->deleteJson("/api/administracao/distritos/{$distrito->id}/disponibilidade/5")
            ->assertNoContent();

        $this->assertDatabaseMissing('disponibilidade_distrito', [
            'distrito_id' => $distrito->id,
            'dia_semana' => 5,
        ]);
    }

    public function test_remover_dia_inexistente_devolve_404(): void
    {
        $distrito = $this->makeDistrito();

        $this->actingAsAdmin()
            ->deleteJson("/api/administracao/distritos/{$distrito->id}/disponibilidade/6")
            ->assertNotFound()
            ->assertJsonPath('message', 'O dia não está configurado na disponibilidade do distrito.');
    }

    public function test_nao_admin_recebe_403_ao_adicionar_dia(): void
    {
        $distrito = $this->makeDistrito();
        $cliente = User::factory()->create(['role' => 'cliente']);

        $this->withToken($cliente->createToken('test')->plainTextToken)
            ->postJson("/api/administracao/distritos/{$distrito->id}/disponibilidade", [
                'dia_semana' => 1,
            ])
            ->assertForbidden();
    }

    public function test_nao_admin_recebe_403_ao_remover_dia(): void
    {
        $distrito = $this->makeDistrito();
        DisponibilidadeDistrito::create(['distrito_id' => $distrito->id, 'dia_semana' => 1]);
        $motorista = User::factory()->create(['role' => 'motorista']);

        $this->withToken($motorista->createToken('test')->plainTextToken)
            ->deleteJson("/api/administracao/distritos/{$distrito->id}/disponibilidade/1")
            ->assertForbidden();
    }

    private function actingAsAdmin(): self
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->withToken($admin->createToken('test')->plainTextToken);

        return $this;
    }

    private function makeDistrito(): Distrito
    {
        $provincia = Provincia::create(['nome' => 'Luanda']);
        $municipio = Municipio::create(['provincia_id' => $provincia->id, 'nome' => 'Belas']);

        return Distrito::create(['municipio_id' => $municipio->id, 'nome' => 'Morro dos Veados']);
    }
}
