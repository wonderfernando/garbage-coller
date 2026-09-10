<?php

namespace Tests\Feature;

use App\Models\AgendamentoRecolha;
use App\Models\Contrato;
use App\Models\Distrito;
use App\Models\Motorista;
use App\Models\Municipio;
use App\Models\Provincia;
use App\Models\TipoResiduo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AtribuicaoMotoristaTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_atribui_motorista_a_recolha_pendente(): void
    {
        $admin = $this->admin();
        $agendamento = $this->makeAgendamento('pendente');
        $motorista = $this->makeMotorista();

        $this->withToken($admin->token)
            ->patchJson("/api/administracao/agendamentos/{$agendamento->id}/motorista", [
                'motorista_id' => $motorista->id,
            ])
            ->assertOk()
            ->assertJsonPath('motorista_id', $motorista->id)
            ->assertJsonPath('motorista.utilizador.id', $motorista->utilizador_id);

        $this->assertDatabaseHas('agendamentos_recolha', [
            'id' => $agendamento->id,
            'motorista_id' => $motorista->id,
        ]);
    }

    public function test_admin_remove_motorista_da_recolha(): void
    {
        $admin = $this->admin();
        $motorista = $this->makeMotorista();
        $agendamento = $this->makeAgendamento('pendente', $motorista->id);

        $this->withToken($admin->token)
            ->patchJson("/api/administracao/agendamentos/{$agendamento->id}/motorista", [
                'motorista_id' => null,
            ])
            ->assertOk()
            ->assertJsonPath('motorista_id', null);

        $this->assertDatabaseHas('agendamentos_recolha', [
            'id' => $agendamento->id,
            'motorista_id' => null,
        ]);
    }

    public function test_motorista_inexistente_devolve_422(): void
    {
        $admin = $this->admin();
        $agendamento = $this->makeAgendamento('pendente');

        $this->withToken($admin->token)
            ->patchJson("/api/administracao/agendamentos/{$agendamento->id}/motorista", [
                'motorista_id' => 99999,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['motorista_id']);
    }

    public function test_nao_pode_atribuir_motorista_a_recolha_cancelada(): void
    {
        $admin = $this->admin();
        $agendamento = $this->makeAgendamento('cancelado');
        $motorista = $this->makeMotorista();

        $this->withToken($admin->token)
            ->patchJson("/api/administracao/agendamentos/{$agendamento->id}/motorista", [
                'motorista_id' => $motorista->id,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['agendamento']);
    }

    public function test_nao_admin_recebe_403(): void
    {
        $cliente = User::factory()->create(['role' => 'cliente']);
        $agendamento = $this->makeAgendamento('pendente');
        $motorista = $this->makeMotorista();

        $this->withToken($cliente->createToken('test')->plainTextToken)
            ->patchJson("/api/administracao/agendamentos/{$agendamento->id}/motorista", [
                'motorista_id' => $motorista->id,
            ])
            ->assertForbidden();
    }

    public function test_sem_token_recebe_401(): void
    {
        $agendamento = $this->makeAgendamento('pendente');
        $motorista = $this->makeMotorista();

        $this->patchJson("/api/administracao/agendamentos/{$agendamento->id}/motorista", [
            'motorista_id' => $motorista->id,
        ])
            ->assertUnauthorized();
    }

    public function test_agendamento_inexistente_devolve_404(): void
    {
        $admin = $this->admin();

        $this->withToken($admin->token)
            ->patchJson('/api/administracao/agendamentos/99999/motorista', [
                'motorista_id' => null,
            ])
            ->assertNotFound();
    }

    private function admin(): object
    {
        $user = User::factory()->create(['role' => 'admin']);

        return (object) [
            'user' => $user,
            'token' => $user->createToken('test')->plainTextToken,
        ];
    }

    private function makeMotorista(): Motorista
    {
        $user = User::factory()->create(['role' => 'motorista']);

        return Motorista::create(['utilizador_id' => $user->id, 'numero_carta' => 'CART-'.$user->id]);
    }

    private function makeAgendamento(string $estado, ?int $motoristaId = null): AgendamentoRecolha
    {
        $cliente = User::factory()->create(['role' => 'cliente']);
        $provincia = Provincia::firstOrCreate(['nome' => 'Luanda']);
        $municipio = Municipio::firstOrCreate(['provincia_id' => $provincia->id, 'nome' => 'Belas']);
        $distrito = Distrito::firstOrCreate(['municipio_id' => $municipio->id, 'nome' => 'Morro dos Veados']);
        $tipo = TipoResiduo::firstOrCreate(
            ['nome' => 'Resíduos Domésticos'],
            [
                'descricao' => 'Recolha doméstica',
                'preco_unitario_recolha' => 2500.00,
                'taxa_adesao' => 15000.00,
            ]
        );
        $contrato = Contrato::create([
            'cliente_id' => $cliente->id,
            'distrito_id' => $distrito->id,
            'tipo_residuo_id' => $tipo->id,
            'taxa_adesao' => 15000.00,
            'valor_mensal' => 20000.00,
            'valor_total' => 215000.00,
            'frequencia_semanal' => 1,
            'duracao_meses' => 10,
            'estado' => 'aprovado',
        ]);

        return AgendamentoRecolha::create([
            'contrato_id' => $contrato->id,
            'motorista_id' => $motoristaId,
            'data_recolha' => now()->addDays(1)->toDateString(),
            'estado' => $estado,
        ]);
    }
}