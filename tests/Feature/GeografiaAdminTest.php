<?php

namespace Tests\Feature;

use App\Models\DisponibilidadeDistrito;
use App\Models\Distrito;
use App\Models\Municipio;
use App\Models\Provincia;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GeografiaAdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_consulta_geografia_hierarquica(): void
    {
        $provincia = Provincia::create(['nome' => 'Luanda']);
        $municipio = Municipio::create(['provincia_id' => $provincia->id, 'nome' => 'Belas']);
        Distrito::create(['municipio_id' => $municipio->id, 'nome' => 'Morro dos Veados']);

        $this->actingAsAdmin()
            ->getJson('/api/administracao/geografia')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.nome', 'Luanda')
            ->assertJsonPath('0.municipios.0.nome', 'Belas')
            ->assertJsonPath('0.municipios.0.distritos.0.nome', 'Morro dos Veados');
    }

    public function test_admin_consulta_distritos_com_disponibilidade(): void
    {
        $distrito = $this->makeDistrito();
        DisponibilidadeDistrito::create(['distrito_id' => $distrito->id, 'dia_semana' => 2]);

        $this->actingAsAdmin()
            ->getJson('/api/administracao/distritos')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.nome', $distrito->nome)
            ->assertJsonPath('0.municipio.nome', 'Belas')
            ->assertJsonPath('0.municipio.provincia.nome', 'Luanda')
            ->assertJsonCount(1, '0.disponibilidades')
            ->assertJsonPath('0.disponibilidades.0.dia_semana', 2);
    }

    public function test_nao_admin_recebe_403_na_geografia(): void
    {
        $cliente = User::factory()->create(['role' => 'cliente']);

        $this->withToken($cliente->createToken('test')->plainTextToken)
            ->getJson('/api/administracao/geografia')
            ->assertForbidden();
    }

    public function test_nao_admin_recebe_403_nos_distritos(): void
    {
        $motorista = User::factory()->create(['role' => 'motorista']);

        $this->withToken($motorista->createToken('test')->plainTextToken)
            ->getJson('/api/administracao/distritos')
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
