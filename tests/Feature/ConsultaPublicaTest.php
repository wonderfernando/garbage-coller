<?php

namespace Tests\Feature;

use App\Models\DisponibilidadeDistrito;
use App\Models\Distrito;
use App\Models\Municipio;
use App\Models\Provincia;
use App\Models\TipoResiduo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConsultaPublicaTest extends TestCase
{
    use RefreshDatabase;

    public function test_tipos_de_residuos_consultaveis_sem_autenticacao(): void
    {
        TipoResiduo::create([
            'nome' => 'Resíduos Domésticos',
            'descricao' => 'Recolha de resíduos domésticos',
            'preco_unitario_recolha' => 2500.00,
            'taxa_adesao' => 15000.00,
        ]);

        $this->getJson('/api/tipos-residuos')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.nome', 'Resíduos Domésticos')
            ->assertJsonPath('0.preco_unitario_recolha', 2500)
            ->assertJsonPath('0.taxa_adesao', 15000);
    }

    public function test_distritos_consultaveis_sem_autenticacao_com_disponibilidade(): void
    {
        $provincia = Provincia::create(['nome' => 'Luanda']);
        $municipio = Municipio::create(['provincia_id' => $provincia->id, 'nome' => 'Belas']);
        $distrito = Distrito::create(['municipio_id' => $municipio->id, 'nome' => 'Morro dos Veados']);
        DisponibilidadeDistrito::create(['distrito_id' => $distrito->id, 'dia_semana' => 2]);

        $this->getJson('/api/distritos')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.nome', 'Morro dos Veados')
            ->assertJsonPath('0.municipio.nome', 'Belas')
            ->assertJsonCount(1, '0.disponibilidades')
            ->assertJsonPath('0.disponibilidades.0.dia_semana', 2);
    }

    public function test_escrita_de_tipos_de_residuos_continua_reservada_a_admin(): void
    {
        $cliente = User::factory()->create(['role' => 'cliente']);

        $this->withToken($cliente->createToken('test')->plainTextToken)
            ->postJson('/api/administracao/tipos-residuos', [
                'nome' => 'Bloqueado',
                'descricao' => 'Sem permissão',
                'preco_unitario_recolha' => 1000.00,
                'taxa_adesao' => 5000.00,
            ])
            ->assertForbidden();
    }

    public function test_gestao_de_disponibilidade_continua_reservada_a_admin(): void
    {
        $distrito = $this->makeDistrito();
        $cliente = User::factory()->create(['role' => 'cliente']);

        $this->withToken($cliente->createToken('test')->plainTextToken)
            ->postJson("/api/administracao/distritos/{$distrito->id}/disponibilidade", [
                'dia_semana' => 1,
            ])
            ->assertForbidden();
    }

    private function makeDistrito(): Distrito
    {
        $provincia = Provincia::create(['nome' => 'Luanda']);
        $municipio = Municipio::create(['provincia_id' => $provincia->id, 'nome' => 'Belas']);

        return Distrito::create(['municipio_id' => $municipio->id, 'nome' => 'Morro dos Veados']);
    }
}
