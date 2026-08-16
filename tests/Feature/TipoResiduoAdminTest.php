<?php

namespace Tests\Feature;

use App\Models\Contrato;
use App\Models\Distrito;
use App\Models\Municipio;
use App\Models\Provincia;
use App\Models\TipoResiduo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TipoResiduoAdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_lista_tipos_de_residuos(): void
    {
        $this->makeTipoResiduo();

        $this->actingAsAdmin()
            ->getJson('/api/administracao/tipos-residuos')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.nome', 'Resíduos Domésticos');
    }

    public function test_admin_regista_tipo_de_residuo(): void
    {
        $this->actingAsAdmin()
            ->postJson('/api/administracao/tipos-residuos', [
                'nome' => 'Resíduos Orgânicos',
                'descricao' => 'Resíduos orgânicos biodegradáveis',
                'preco_unitario_recolha' => 3000.00,
                'taxa_adesao' => 18000.00,
            ])
            ->assertCreated()
            ->assertJsonPath('nome', 'Resíduos Orgânicos');

        $this->assertDatabaseHas('tipos_residuos', [
            'nome' => 'Resíduos Orgânicos',
            'preco_unitario_recolha' => 3000.00,
            'taxa_adesao' => 18000.00,
        ]);
    }

    public function test_admin_consulta_tipo_de_residuo(): void
    {
        $tipoResiduo = $this->makeTipoResiduo();

        $this->actingAsAdmin()
            ->getJson("/api/administracao/tipos-residuos/{$tipoResiduo->id}")
            ->assertOk()
            ->assertJsonPath('nome', $tipoResiduo->nome);
    }

    public function test_admin_atualiza_tipo_de_residuo(): void
    {
        $tipoResiduo = $this->makeTipoResiduo();

        $this->actingAsAdmin()
            ->patchJson("/api/administracao/tipos-residuos/{$tipoResiduo->id}", [
                'nome' => 'Resíduos Recicláveis',
                'descricao' => 'Recolha de materiais recicláveis',
                'preco_unitario_recolha' => 1200.00,
                'taxa_adesao' => 9000.00,
            ])
            ->assertOk()
            ->assertJsonPath('nome', 'Resíduos Recicláveis');

        $this->assertDatabaseHas('tipos_residuos', [
            'id' => $tipoResiduo->id,
            'nome' => 'Resíduos Recicláveis',
            'preco_unitario_recolha' => 1200.00,
        ]);
    }

    public function test_registo_com_designacao_duplicada_e_rejeitado(): void
    {
        $this->makeTipoResiduo();

        $this->actingAsAdmin()
            ->postJson('/api/administracao/tipos-residuos', [
                'nome' => 'Resíduos Domésticos',
                'descricao' => 'Outra descrição',
                'preco_unitario_recolha' => 1000.00,
                'taxa_adesao' => 5000.00,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['nome']);
    }

    public function test_registo_com_preco_negativo_e_rejeitado(): void
    {
        $this->actingAsAdmin()
            ->postJson('/api/administracao/tipos-residuos', [
                'nome' => 'Resíduos Perigosos',
                'descricao' => 'Recolha especial',
                'preco_unitario_recolha' => -10,
                'taxa_adesao' => 5000.00,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['preco_unitario_recolha']);
    }

    public function test_registo_com_taxa_de_adesao_negativa_e_rejeitado(): void
    {
        $this->actingAsAdmin()
            ->postJson('/api/administracao/tipos-residuos', [
                'nome' => 'Resíduos Perigosos',
                'descricao' => 'Recolha especial',
                'preco_unitario_recolha' => 2000.00,
                'taxa_adesao' => -5000,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['taxa_adesao']);
    }

    public function test_admin_elimina_tipo_de_residuo_sem_contratos(): void
    {
        $tipoResiduo = $this->makeTipoResiduo();

        $this->actingAsAdmin()
            ->deleteJson("/api/administracao/tipos-residuos/{$tipoResiduo->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('tipos_residuos', ['id' => $tipoResiduo->id]);
    }

    public function test_eliminacao_de_tipo_em_uso_em_contrato_e_bloqueada(): void
    {
        $tipoResiduo = $this->makeTipoResiduo();
        $this->makeContrato($tipoResiduo->id);

        $this->actingAsAdmin()
            ->deleteJson("/api/administracao/tipos-residuos/{$tipoResiduo->id}")
            ->assertStatus(409)
            ->assertJsonPath('message', 'Não é possível eliminar: o tipo de resíduo está associado a contratos.');

        $this->assertDatabaseHas('tipos_residuos', ['id' => $tipoResiduo->id]);
    }

    public function test_nao_admin_recebe_403(): void
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

    private function actingAsAdmin(): self
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->withToken($admin->createToken('test')->plainTextToken);

        return $this;
    }

    private function makeTipoResiduo(): TipoResiduo
    {
        return TipoResiduo::create([
            'nome' => 'Resíduos Domésticos',
            'descricao' => 'Recolha de resíduos domésticos',
            'preco_unitario_recolha' => 2500.00,
            'taxa_adesao' => 15000.00,
        ]);
    }

    private function makeContrato(int $tipoResiduoId): Contrato
    {
        $cliente = User::factory()->create(['role' => 'cliente']);
        $provincia = Provincia::create(['nome' => 'Luanda']);
        $municipio = Municipio::create(['provincia_id' => $provincia->id, 'nome' => 'Belas']);
        $distrito = Distrito::create(['municipio_id' => $municipio->id, 'nome' => 'Morro dos Veados']);

        return Contrato::create([
            'cliente_id' => $cliente->id,
            'distrito_id' => $distrito->id,
            'tipo_residuo_id' => $tipoResiduoId,
            'taxa_adesao' => 15000.00,
            'valor_mensal' => 10000.00,
            'valor_total' => 65000.00,
            'frequencia_semanal' => 1,
            'duracao_meses' => 5,
            'estado' => 'pendente',
        ]);
    }
}
