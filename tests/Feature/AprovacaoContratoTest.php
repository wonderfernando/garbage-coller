<?php

namespace Tests\Feature;

use App\Jobs\GerarAgendamentoContrato;
use App\Jobs\GerarParcelasContrato;
use App\Models\Contrato;
use App\Models\ContratoDiaSemana;
use App\Models\DisponibilidadeDistrito;
use App\Models\Distrito;
use App\Models\Municipio;
use App\Models\Provincia;
use App\Models\TipoResiduo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class AprovacaoContratoTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_aprova_contrato_pendente_e_despacha_jobs(): void
    {
        Queue::fake();

        $admin = $this->admin();
        $contrato = $this->makeContrato('pendente', dias: [1]);

        $response = $this->withToken($admin->token)
            ->patchJson("/api/contratos/{$contrato->id}/aprovar");

        $response->assertOk()
            ->assertJsonPath('estado', 'aprovado');

        $this->assertDatabaseHas('contratos', [
            'id' => $contrato->id,
            'estado' => 'aprovado',
        ]);

        Queue::assertPushed(GerarParcelasContrato::class);
        Queue::assertPushed(GerarAgendamentoContrato::class);

        $this->assertDatabaseCount('parcelas_mensalidades', 0);
        $this->assertDatabaseCount('agendamentos_recolha', 0);
    }

    public function test_admin_rejeita_contrato_pendente_sem_gerar_parcelas_ou_agendamentos(): void
    {
        Queue::fake();

        $admin = $this->admin();
        $contrato = $this->makeContrato('pendente', dias: [1]);

        $response = $this->withToken($admin->token)
            ->patchJson("/api/contratos/{$contrato->id}/rejeitar");

        $response->assertOk()
            ->assertJsonPath('estado', 'rejeitado');

        $this->assertDatabaseHas('contratos', [
            'id' => $contrato->id,
            'estado' => 'rejeitado',
        ]);

        Queue::assertNothingPushed();
        $this->assertDatabaseCount('parcelas_mensalidades', 0);
        $this->assertDatabaseCount('agendamentos_recolha', 0);
    }

    public function test_nao_pode_aprovar_contrato_fora_do_estado_pendente(): void
    {
        $admin = $this->admin();
        $contrato = $this->makeContrato('rejeitado', dias: [1]);

        $this->withToken($admin->token)
            ->patchJson("/api/contratos/{$contrato->id}/aprovar")
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['contrato']);
    }

    public function test_nao_pode_rejeitar_contrato_fora_do_estado_pendente(): void
    {
        $admin = $this->admin();
        $contrato = $this->makeContrato('aprovado', dias: [1]);

        $this->withToken($admin->token)
            ->patchJson("/api/contratos/{$contrato->id}/rejeitar")
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['contrato']);
    }

    public function test_nao_admin_recebe_403(): void
    {
        $cliente = User::factory()->create(['role' => 'cliente']);
        $contrato = $this->makeContrato('pendente', dias: [1]);

        $this->withToken($cliente->createToken('test')->plainTextToken)
            ->patchJson("/api/contratos/{$contrato->id}/aprovar")
            ->assertForbidden();
    }

    public function test_sem_token_recebe_401(): void
    {
        $contrato = $this->makeContrato('pendente', dias: [1]);

        $this->patchJson("/api/contratos/{$contrato->id}/rejeitar")
            ->assertUnauthorized();
    }

    private function admin(): object
    {
        $user = User::factory()->create(['role' => 'admin']);

        return (object) [
            'user' => $user,
            'token' => $user->createToken('test')->plainTextToken,
        ];
    }

    private function makeContrato(string $estado, array $dias): Contrato
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

        foreach ($dias as $dia) {
            DisponibilidadeDistrito::create(['distrito_id' => $distrito->id, 'dia_semana' => $dia]);
        }

        $contrato = Contrato::create([
            'cliente_id' => $cliente->id,
            'distrito_id' => $distrito->id,
            'tipo_residuo_id' => $tipo->id,
            'taxa_adesao' => 15000.00,
            'valor_mensal' => 20000.00,
            'valor_total' => 215000.00,
            'frequencia_semanal' => count($dias),
            'duracao_meses' => 10,
            'estado' => $estado,
        ]);

        foreach ($dias as $dia) {
            ContratoDiaSemana::create(['contrato_id' => $contrato->id, 'dia_semana' => $dia]);
        }

        return $contrato;
    }
}
