<?php

namespace Tests\Feature;

use App\Models\AgendamentoRecolha;
use App\Models\Contrato;
use App\Models\DisponibilidadeDistrito;
use App\Models\Distrito;
use App\Models\Motorista;
use App\Models\Municipio;
use App\Models\Provincia;
use App\Models\TipoResiduo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class ReagendarAgendamentoTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_reagenda_recolha_pendente_e_guarda_historico(): void
    {
        $admin = $this->admin();
        $agendamento = $this->makeAgendamento('pendente');
        $this->disponibilizarTodosDias($agendamento);

        $antiga = $agendamento->data_recolha;
        $nova = Carbon::parse($antiga)->addDays(3);

        $this->withToken($admin->token)
            ->patchJson("/api/administracao/agendamentos/{$agendamento->id}/reagendar", [
                'data_recolha' => $nova->format('Y-m-d H:i:s'),
            ])
            ->assertOk()
            ->assertJsonPath('data_recolha', $nova->toDateTimeString())
            ->assertJsonPath('data_recolha_anterior', $antiga)
            ->assertJsonPath('reagendadoPor.id', $admin->user->id);

        $this->assertDatabaseHas('agendamentos_recolha', [
            'id' => $agendamento->id,
            'data_recolha' => $nova->toDateTimeString(),
            'data_recolha_anterior' => $antiga,
            'reagendado_por_id' => $admin->user->id,
        ]);
    }

    public function test_reagendar_recolha_concluida_ou_cancelada_devolve_422(): void
    {
        foreach (['concluido', 'cancelado'] as $estado) {
            $admin = $this->admin();
            $agendamento = $this->makeAgendamento($estado);
            $this->disponibilizarTodosDias($agendamento);

            $this->withToken($admin->token)
                ->patchJson("/api/administracao/agendamentos/{$agendamento->id}/reagendar", [
                    'data_recolha' => now()->addDays(3)->format('Y-m-d H:i:s'),
                ])
                ->assertUnprocessable()
                ->assertJsonValidationErrors(['agendamento']);
        }
    }

    public function test_nao_aceita_data_no_passado(): void
    {
        $admin = $this->admin();
        $agendamento = $this->makeAgendamento('pendente');
        $this->disponibilizarTodosDias($agendamento);

        $this->withToken($admin->token)
            ->patchJson("/api/administracao/agendamentos/{$agendamento->id}/reagendar", [
                'data_recolha' => now()->subDay()->format('Y-m-d H:i:s'),
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['data_recolha']);
    }

    public function test_nao_aceita_dia_fora_da_disponibilidade_do_distrito(): void
    {
        $admin = $this->admin();
        $agendamento = $this->makeAgendamento('pendente');

        $alvo = Carbon::parse($agendamento->data_recolha)->addDays(2);
        $dias = array_values(array_diff([1, 2, 3, 4, 5, 6, 7], [$alvo->dayOfWeekIso]));
        $this->disponibilizarDias($agendamento, $dias);

        $this->withToken($admin->token)
            ->patchJson("/api/administracao/agendamentos/{$agendamento->id}/reagendar", [
                'data_recolha' => $alvo->format('Y-m-d H:i:s'),
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['data_recolha']);
    }

    public function test_nao_aceita_colisao_com_outra_recolha_do_mesmo_motorista(): void
    {
        $admin = $this->admin();
        $motorista = $this->makeMotorista();
        $agendamento = $this->makeAgendamento('pendente', $motorista->id);
        $outra = $this->makeAgendamento('pendente', $motorista->id);
        $this->disponibilizarTodosDias($agendamento);
        $this->disponibilizarTodosDias($outra);

        $this->withToken($admin->token)
            ->patchJson("/api/administracao/agendamentos/{$agendamento->id}/reagendar", [
                'data_recolha' => $outra->data_recolha,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['data_recolha']);
    }

    public function test_nao_admin_recebe_403(): void
    {
        $cliente = User::factory()->create(['role' => 'cliente']);
        $agendamento = $this->makeAgendamento('pendente');

        $this->withToken($cliente->createToken('test')->plainTextToken)
            ->patchJson("/api/administracao/agendamentos/{$agendamento->id}/reagendar", [
                'data_recolha' => now()->addDays(3)->format('Y-m-d H:i:s'),
            ])
            ->assertForbidden();
    }

    public function test_sem_token_recebe_401(): void
    {
        $agendamento = $this->makeAgendamento('pendente');

        $this->patchJson("/api/administracao/agendamentos/{$agendamento->id}/reagendar", [
            'data_recolha' => now()->addDays(3)->format('Y-m-d H:i:s'),
        ])
            ->assertUnauthorized();
    }

    public function test_sem_data_recolha_devolve_422(): void
    {
        $admin = $this->admin();
        $agendamento = $this->makeAgendamento('pendente');

        $this->withToken($admin->token)
            ->patchJson("/api/administracao/agendamentos/{$agendamento->id}/reagendar")
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['data_recolha']);
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
            'data_recolha' => now()->addDays(1)->setTime(8, 0, 0)->format('Y-m-d H:i:s'),
            'estado' => $estado,
        ]);
    }

    private function disponibilizarTodosDias(AgendamentoRecolha $agendamento): void
    {
        $this->disponibilizarDias($agendamento, [1, 2, 3, 4, 5, 6, 7]);
    }

    private function disponibilizarDias(AgendamentoRecolha $agendamento, array $dias): void
    {
        foreach ($dias as $dia) {
            DisponibilidadeDistrito::firstOrCreate([
                'distrito_id' => $agendamento->contrato->distrito_id,
                'dia_semana' => $dia,
            ]);
        }
    }
}
