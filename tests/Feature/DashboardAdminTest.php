<?php

namespace Tests\Feature;

use App\Models\AgendamentoRecolha;
use App\Models\Contrato;
use App\Models\Distrito;
use App\Models\Municipio;
use App\Models\Provincia;
use App\Models\TipoResiduo;
use App\Models\User;
use App\Models\Veiculo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardAdminTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function makeContrato(): Contrato
    {
        $cliente = User::factory()->create(['role' => 'cliente']);
        $provincia = Provincia::create(['nome' => 'Luanda']);
        $municipio = Municipio::create(['provincia_id' => $provincia->id, 'nome' => 'Belas']);
        $distrito = Distrito::create(['municipio_id' => $municipio->id, 'nome' => 'Morro dos Veados']);
        $tipo = TipoResiduo::create([
            'nome' => 'Resíduos Domésticos',
            'descricao' => 'Recolha doméstica',
            'preco_unitario_recolha' => 2500.00,
            'taxa_adesao' => 15000.00,
        ]);

        return Contrato::create([
            'cliente_id' => $cliente->id,
            'distrito_id' => $distrito->id,
            'tipo_residuo_id' => $tipo->id,
            'taxa_adesao' => 15000.00,
            'valor_mensal' => 20000.00,
            'valor_total' => 215000.00,
            'frequencia_semanal' => 2,
            'duracao_meses' => 10,
            'estado' => 'pendente',
        ]);
    }

    public function test_admin_obtem_estatisticas_das_quatro_entidades(): void
    {
        $cliente = User::factory()->create(['role' => 'cliente']);
        User::factory()->create(['role' => 'motorista']);
        Veiculo::create(['matricula' => 'LD-12-34-AB']);
        $this->makeContrato();

        $this->actingAs($this->admin(), 'sanctum')
            ->getJson('/api/administracao/dashboard')
            ->assertOk()
            ->assertJsonPath('stats.clientes', 2)
            ->assertJsonPath('stats.contratos', 1)
            ->assertJsonPath('stats.motoristas', 1)
            ->assertJsonPath('stats.veiculos', 1);
    }

    public function test_admin_obtem_ultimos_agendamentos_e_contratos(): void
    {
        $contrato = $this->makeContrato();
        $cliente = $contrato->cliente;
        AgendamentoRecolha::create([
            'contrato_id' => $contrato->id,
            'data_recolha' => now()->addDay(),
        ]);

        $this->actingAs($this->admin(), 'sanctum')
            ->getJson('/api/administracao/dashboard')
            ->assertOk()
            ->assertJsonCount(1, 'ultimos_contratos')
            ->assertJsonPath('ultimos_contratos.0.cliente.nome', $cliente->nome)
            ->assertJsonCount(1, 'ultimos_agendamentos')
            ->assertJsonPath('ultimos_agendamentos.0.contrato.cliente.nome', $cliente->nome);
    }

    public function test_dashboard_exige_perfil_admin(): void
    {
        $cliente = User::factory()->create(['role' => 'cliente']);

        $this->actingAs($cliente, 'sanctum')
            ->getJson('/api/administracao/dashboard')
            ->assertForbidden();
    }
}
