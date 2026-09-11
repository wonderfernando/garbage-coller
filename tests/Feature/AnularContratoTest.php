<?php

namespace Tests\Feature;

use App\Models\AgendamentoRecolha;
use App\Models\Contrato;
use App\Models\Distrito;
use App\Models\Municipio;
use App\Models\ParcelaMensalidade;
use App\Models\Provincia;
use App\Models\TipoResiduo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnularContratoTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_anula_contrato_aprovado_e_cancela_recolhas_e_parcelas_pendentes(): void
    {
        $admin = $this->admin();
        $contrato = $this->makeContrato('aprovado');
        $parcela = ParcelaMensalidade::create([
            'contrato_id' => $contrato->id,
            'numero_parcela' => 1,
            'valor' => 20000.00,
            'data_vencimento' => '2026-02-05',
            'estado' => 'pendente',
        ]);
        $agendamento = AgendamentoRecolha::create([
            'contrato_id' => $contrato->id,
            'data_recolha' => '2026-09-15 08:00:00',
            'estado' => 'pendente',
        ]);

        $this->withToken($admin->token)
            ->patchJson("/api/administracao/contratos/{$contrato->id}/anular")
            ->assertOk()
            ->assertJsonPath('estado', 'cancelado');

        $this->assertDatabaseHas('contratos', ['id' => $contrato->id, 'estado' => 'cancelado']);
        $this->assertDatabaseHas('parcelas_mensalidades', ['id' => $parcela->id, 'estado' => 'cancelado']);
        $this->assertDatabaseHas('agendamentos_recolha', [
            'id' => $agendamento->id,
            'estado' => 'cancelado',
            'observacao' => 'Contrato cancelado',
        ]);
    }

    public function test_admin_anula_contrato_com_motivo_e_usase_como_observacao(): void
    {
        $admin = $this->admin();
        $contrato = $this->makeContrato('aprovado');
        $agendamento = AgendamentoRecolha::create([
            'contrato_id' => $contrato->id,
            'data_recolha' => '2026-09-15 08:00:00',
            'estado' => 'pendente',
        ]);

        $this->withToken($admin->token)
            ->patchJson("/api/administracao/contratos/{$contrato->id}/anular", [
                'motivo' => 'Cliente desistiu do serviço',
            ])
            ->assertOk();

        $this->assertDatabaseHas('agendamentos_recolha', [
            'id' => $agendamento->id,
            'estado' => 'cancelado',
            'observacao' => 'Cliente desistiu do serviço',
        ]);
    }

    public function test_anular_nao_altera_parcelas_pagas_nem_recolhas_concluidas(): void
    {
        $admin = $this->admin();
        $contrato = $this->makeContrato('aprovado');
        $paga = ParcelaMensalidade::create([
            'contrato_id' => $contrato->id,
            'numero_parcela' => 1,
            'valor' => 20000.00,
            'data_vencimento' => '2026-01-05',
            'estado' => 'pago',
            'data_pagamento' => '2026-01-06',
            'numero_recibo' => 'REC-0001',
        ]);
        $pendente = ParcelaMensalidade::create([
            'contrato_id' => $contrato->id,
            'numero_parcela' => 2,
            'valor' => 20000.00,
            'data_vencimento' => '2026-02-05',
            'estado' => 'pendente',
        ]);
        $concluida = AgendamentoRecolha::create([
            'contrato_id' => $contrato->id,
            'data_recolha' => '2026-09-01 08:00:00',
            'estado' => 'concluido',
        ]);
        $pendenteAgendamento = AgendamentoRecolha::create([
            'contrato_id' => $contrato->id,
            'data_recolha' => '2026-09-15 08:00:00',
            'estado' => 'pendente',
        ]);

        $this->withToken($admin->token)
            ->patchJson("/api/administracao/contratos/{$contrato->id}/anular")
            ->assertOk();

        $this->assertDatabaseHas('parcelas_mensalidades', ['id' => $paga->id, 'estado' => 'pago']);
        $this->assertDatabaseHas('parcelas_mensalidades', ['id' => $pendente->id, 'estado' => 'cancelado']);
        $this->assertDatabaseHas('agendamentos_recolha', ['id' => $concluida->id, 'estado' => 'concluido']);
        $this->assertDatabaseHas('agendamentos_recolha', ['id' => $pendenteAgendamento->id, 'estado' => 'cancelado']);
    }

    public function test_nao_pode_anular_contrato_rejeitado_ou_cancelado(): void
    {
        foreach (['rejeitado', 'cancelado'] as $estado) {
            $admin = $this->admin();
            $contrato = $this->makeContrato($estado);

            $this->withToken($admin->token)
                ->patchJson("/api/administracao/contratos/{$contrato->id}/anular")
                ->assertUnprocessable()
                ->assertJsonValidationErrors(['contrato']);
        }
    }

    public function test_parcela_cancelada_nao_pode_ser_liquidada(): void
    {
        $admin = $this->admin();
        $contrato = $this->makeContrato('aprovado');
        $parcela = ParcelaMensalidade::create([
            'contrato_id' => $contrato->id,
            'numero_parcela' => 1,
            'valor' => 20000.00,
            'data_vencimento' => '2026-02-05',
            'estado' => 'pendente',
        ]);

        $this->withToken($admin->token)
            ->patchJson("/api/administracao/contratos/{$contrato->id}/anular")
            ->assertOk();

        $this->withToken($admin->token)
            ->patchJson("/api/administracao/parcelas/{$parcela->id}/liquidar")
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['parcela']);
    }

    public function test_nao_admin_recebe_403(): void
    {
        $cliente = User::factory()->create(['role' => 'cliente']);
        $contrato = $this->makeContrato('aprovado');

        $this->withToken($cliente->createToken('test')->plainTextToken)
            ->patchJson("/api/administracao/contratos/{$contrato->id}/anular")
            ->assertForbidden();
    }

    public function test_sem_token_recebe_401(): void
    {
        $contrato = $this->makeContrato('aprovado');

        $this->patchJson("/api/administracao/contratos/{$contrato->id}/anular")
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

    private function makeContrato(string $estado): Contrato
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

        return Contrato::create([
            'cliente_id' => $cliente->id,
            'distrito_id' => $distrito->id,
            'tipo_residuo_id' => $tipo->id,
            'taxa_adesao' => 15000.00,
            'valor_mensal' => 20000.00,
            'valor_total' => 215000.00,
            'frequencia_semanal' => 1,
            'duracao_meses' => 10,
            'estado' => $estado,
        ]);
    }
}
