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
use Illuminate\Support\Carbon;
use Tests\TestCase;

class MotoristaModuleTest extends TestCase
{
    use RefreshDatabase;

    public function test_cronograma_devolve_apenas_recolhas_do_proprio_motorista(): void
    {
        $motorista = $this->makeMotorista();
        $outro = $this->makeMotorista();
        $minha = $this->makeAgendamento('pendente', $motorista->id, now());
        $this->makeAgendamento('pendente', $outro->id, now());

        $this->withToken($motorista->token)
            ->getJson('/api/motorista/cronograma')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $minha->id);
    }

    public function test_cronograma_sem_datas_assume_hoje(): void
    {
        $motorista = $this->makeMotorista();
        $hoje = $this->makeAgendamento('pendente', $motorista->id, now());
        $amanha = $this->makeAgendamento('pendente', $motorista->id, now()->addDay());

        $this->withToken($motorista->token)
            ->getJson('/api/motorista/cronograma')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $hoje->id);
    }

    public function test_cronograma_filtra_por_intervalo(): void
    {
        $motorista = $this->makeMotorista();
        $hoje = $this->makeAgendamento('pendente', $motorista->id, now());
        $amanha = $this->makeAgendamento('pendente', $motorista->id, now()->addDay());

        $this->withToken($motorista->token)
            ->getJson('/api/motorista/cronograma?inicio='.now()->addDay()->toDateString().'&fim='.now()->addDay()->toDateString())
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $amanha->id);
    }

    public function test_cronograma_inclui_dados_do_contrato(): void
    {
        $motorista = $this->makeMotorista();
        $agendamento = $this->makeAgendamento('pendente', $motorista->id, now());

        $this->withToken($motorista->token)
            ->getJson('/api/motorista/cronograma')
            ->assertOk()
            ->assertJsonPath('0.contrato.cliente.nome', $agendamento->contrato->cliente->nome)
            ->assertJsonPath('0.contrato.distrito.nome', $agendamento->contrato->distrito->nome)
            ->assertJsonPath('0.contrato.tipoResiduo.nome', $agendamento->contrato->tipoResiduo->nome);
    }

    public function test_cronograma_ordena_por_data_recolha(): void
    {
        $motorista = $this->makeMotorista();
        $primeira = $this->makeAgendamento('pendente', $motorista->id, now()->addDays(2));
        $segunda = $this->makeAgendamento('pendente', $motorista->id, now()->addDays(1));

        $this->withToken($motorista->token)
            ->getJson('/api/motorista/cronograma?inicio='.now()->toDateString().'&fim='.now()->addDays(2)->toDateString())
            ->assertOk()
            ->assertJsonCount(2)
            ->assertJsonPath('0.id', $segunda->id)
            ->assertJsonPath('1.id', $primeira->id);
    }

    public function test_cronograma_inicio_posterior_ao_fim_devolve_422(): void
    {
        $motorista = $this->makeMotorista();

        $this->withToken($motorista->token)
            ->getJson('/api/motorista/cronograma?inicio='.now()->toDateString().'&fim='.now()->subDay()->toDateString())
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['inicio']);
    }

    public function test_concluir_recolha_propria_pendente(): void
    {
        $motorista = $this->makeMotorista();
        $agendamento = $this->makeAgendamento('pendente', $motorista->id);

        $this->withToken($motorista->token)
            ->patchJson("/api/motorista/agendamentos/{$agendamento->id}/concluir")
            ->assertOk()
            ->assertJsonPath('estado', 'concluido');

        $this->assertDatabaseHas('agendamentos_recolha', [
            'id' => $agendamento->id,
            'estado' => 'concluido',
        ]);
    }

    public function test_concluir_recolha_nao_pendente_devolve_422(): void
    {
        $motorista = $this->makeMotorista();
        $agendamento = $this->makeAgendamento('cancelado', $motorista->id);

        $this->withToken($motorista->token)
            ->patchJson("/api/motorista/agendamentos/{$agendamento->id}/concluir")
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['agendamento']);
    }

    public function test_concluir_recolha_de_outro_motorista_devolve_404(): void
    {
        $motorista = $this->makeMotorista();
        $outro = $this->makeMotorista();
        $agendamento = $this->makeAgendamento('pendente', $outro->id);

        $this->withToken($motorista->token)
            ->patchJson("/api/motorista/agendamentos/{$agendamento->id}/concluir")
            ->assertNotFound();
    }

    public function test_cancelar_recolha_propria_pendente_com_observacao(): void
    {
        $motorista = $this->makeMotorista();
        $agendamento = $this->makeAgendamento('pendente', $motorista->id);

        $this->withToken($motorista->token)
            ->patchJson("/api/motorista/agendamentos/{$agendamento->id}/cancelar", [
                'observacao' => 'Sem acesso à via',
            ])
            ->assertOk()
            ->assertJsonPath('estado', 'cancelado');

        $this->assertDatabaseHas('agendamentos_recolha', [
            'id' => $agendamento->id,
            'estado' => 'cancelado',
            'observacao' => 'Sem acesso à via',
        ]);
    }

    public function test_cancelar_sem_observacao_devolve_422(): void
    {
        $motorista = $this->makeMotorista();
        $agendamento = $this->makeAgendamento('pendente', $motorista->id);

        $this->withToken($motorista->token)
            ->patchJson("/api/motorista/agendamentos/{$agendamento->id}/cancelar", [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['observacao']);
    }

    public function test_cancelar_com_observacao_em_branco_devolve_422(): void
    {
        $motorista = $this->makeMotorista();
        $agendamento = $this->makeAgendamento('pendente', $motorista->id);

        $this->withToken($motorista->token)
            ->patchJson("/api/motorista/agendamentos/{$agendamento->id}/cancelar", [
                'observacao' => '   ',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['observacao']);
    }

    public function test_cancelar_recolha_nao_pendente_devolve_422(): void
    {
        $motorista = $this->makeMotorista();
        $agendamento = $this->makeAgendamento('concluido', $motorista->id);

        $this->withToken($motorista->token)
            ->patchJson("/api/motorista/agendamentos/{$agendamento->id}/cancelar", [
                'observacao' => 'Motivo',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['agendamento']);
    }

    public function test_cancelar_recolha_de_outro_motorista_devolve_404(): void
    {
        $motorista = $this->makeMotorista();
        $outro = $this->makeMotorista();
        $agendamento = $this->makeAgendamento('pendente', $outro->id);

        $this->withToken($motorista->token)
            ->patchJson("/api/motorista/agendamentos/{$agendamento->id}/cancelar", [
                'observacao' => 'Motivo',
            ])
            ->assertNotFound();
    }

    public function test_sem_token_recebe_401(): void
    {
        $agendamento = $this->makeAgendamento('pendente');

        $this->getJson('/api/motorista/cronograma')->assertUnauthorized();
        $this->patchJson("/api/motorista/agendamentos/{$agendamento->id}/concluir")->assertUnauthorized();
    }

    public function test_nao_motorista_recebe_403(): void
    {
        $cliente = User::factory()->create(['role' => 'cliente']);
        $agendamento = $this->makeAgendamento('pendente');

        $this->withToken($cliente->createToken('test')->plainTextToken)
            ->getJson('/api/motorista/cronograma')
            ->assertForbidden();

        $this->withToken($cliente->createToken('test')->plainTextToken)
            ->patchJson("/api/motorista/agendamentos/{$agendamento->id}/concluir")
            ->assertForbidden();
    }

    public function test_motorista_sem_registo_no_sistema_recebe_404(): void
    {
        $user = User::factory()->create(['role' => 'motorista']);

        $this->withToken($user->createToken('test')->plainTextToken)
            ->getJson('/api/motorista/cronograma')
            ->assertNotFound();
    }

    private function makeMotorista(): object
    {
        $user = User::factory()->create(['role' => 'motorista']);
        $motorista = Motorista::create(['utilizador_id' => $user->id, 'numero_carta' => 'CART-'.$user->id]);

        return (object) [
            'motorista' => $motorista,
            'id' => $motorista->id,
            'token' => $user->createToken('test')->plainTextToken,
        ];
    }

    private function makeAgendamento(string $estado, ?int $motoristaId = null, ?Carbon $data = null): AgendamentoRecolha
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
            'data_recolha' => ($data ?? now()->addDays(1))->toDateTimeString(),
            'estado' => $estado,
        ]);
    }
}
