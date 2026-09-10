<?php

namespace Tests\Feature;

use App\Models\Contrato;
use App\Models\Distrito;
use App\Models\Municipio;
use App\Models\ParcelaMensalidade;
use App\Models\Provincia;
use App\Models\TipoResiduo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LiquidacaoParcelaTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_liquida_parcela_pendente(): void
    {
        $admin = $this->admin();
        $parcela = $this->makeParcela('pendente');

        $this->withToken($admin->token)
            ->patchJson("/api/administracao/parcelas/{$parcela->id}/liquidar", [
                'numero_recibo' => 'REC-0001',
            ])
            ->assertOk()
            ->assertJsonPath('estado', 'pago')
            ->assertJsonPath('numero_recibo', 'REC-0001')
            ->assertJsonPath('registadoPor.id', $admin->user->id);

        $this->assertDatabaseHas('parcelas_mensalidades', [
            'id' => $parcela->id,
            'estado' => 'pago',
            'registado_por_id' => $admin->user->id,
            'numero_recibo' => 'REC-0001',
        ]);

        $this->assertNotNull($parcela->refresh()->data_pagamento);
    }

    public function test_admin_liquida_parcela_sem_recibo_e_gerase_automaticamente(): void
    {
        $admin = $this->admin();
        $contrato = $this->makeContrato();
        $parcela = ParcelaMensalidade::create([
            'contrato_id' => $contrato->id,
            'numero_parcela' => 3,
            'valor' => 20000.00,
            'data_vencimento' => '2026-03-05',
            'estado' => 'pendente',
        ]);

        $this->withToken($admin->token)
            ->patchJson("/api/administracao/parcelas/{$parcela->id}/liquidar")
            ->assertOk()
            ->assertJsonPath('estado', 'pago')
            ->assertJsonPath('numero_recibo', 'REC-'.str_pad((string) $contrato->id, 4, '0', STR_PAD_LEFT).'-3');
    }

    public function test_nao_pode_liquidar_parcela_ja_paga(): void
    {
        $admin = $this->admin();
        $parcela = $this->makeParcela('pago');

        $this->withToken($admin->token)
            ->patchJson("/api/administracao/parcelas/{$parcela->id}/liquidar")
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['parcela']);

        $this->assertDatabaseHas('parcelas_mensalidades', [
            'id' => $parcela->id,
            'estado' => 'pago',
        ]);
    }

    public function test_nao_admin_recebe_403(): void
    {
        $cliente = User::factory()->create(['role' => 'cliente']);
        $parcela = $this->makeParcela('pendente');

        $this->withToken($cliente->createToken('test')->plainTextToken)
            ->patchJson("/api/administracao/parcelas/{$parcela->id}/liquidar")
            ->assertForbidden();
    }

    public function test_sem_token_recebe_401(): void
    {
        $parcela = $this->makeParcela('pendente');

        $this->patchJson("/api/administracao/parcelas/{$parcela->id}/liquidar")
            ->assertUnauthorized();
    }

    public function test_admin_nao_pode_obter_recibo_de_parcela_ainda_pendente(): void
    {
        $admin = $this->admin();
        $parcela = $this->makeParcela('pendente');

        $this->withToken($admin->token)
            ->getJson("/api/administracao/parcelas/{$parcela->id}/recibo")
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');
    }

    public function test_admin_obtem_recibo_pdf_de_parcela_paga(): void
    {
        $admin = $this->admin();
        $parcela = $this->makeParcela('pago');

        $this->withToken($admin->token)
            ->get("/api/administracao/parcelas/{$parcela->id}/recibo")
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');
    }

    private function admin(): object
    {
        $user = User::factory()->create(['role' => 'admin']);

        return (object) [
            'user' => $user,
            'token' => $user->createToken('test')->plainTextToken,
        ];
    }

    private function makeParcela(string $estado): ParcelaMensalidade
    {
        return ParcelaMensalidade::create([
            'contrato_id' => $this->makeContrato()->id,
            'numero_parcela' => 1,
            'valor' => 20000.00,
            'data_vencimento' => '2026-02-05',
            'estado' => $estado,
        ]);
    }

    private function makeContrato(): Contrato
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
            'estado' => 'aprovado',
        ]);
    }
}