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

class AberturaContratoTest extends TestCase
{
    use RefreshDatabase;

    public function test_cliente_abre_contrato_com_valores_calculados(): void
    {
        $cliente = $this->clienteAutenticado();
        $distrito = $this->makeDistrito();
        $tipo = $this->makeTipoResiduo();
        $this->addDisponibilidade($distrito->id, [1, 3]);

        $response = $this->withToken($cliente->token)
            ->postJson('/api/contratos', [
                'distrito_id' => $distrito->id,
                'tipo_residuo_id' => $tipo->id,
                'dias_semana' => [1, 3],
                'duracao_meses' => 5,
                'rua' => 'Rua das Flores',
                'ponto_referencia' => 'Ao lado do mercado',
            ]);

        $response->assertCreated()
            ->assertJsonPath('estado', 'pendente')
            ->assertJsonCount(2, 'dias_semana')
            ->assertJsonPath('frequencia_semanal', 2);

        $this->assertDatabaseHas('contratos', [
            'cliente_id' => $cliente->user->id,
            'distrito_id' => $distrito->id,
            'tipo_residuo_id' => $tipo->id,
            'estado' => 'pendente',
            'frequencia_semanal' => 2,
            'taxa_adesao' => 15000.00,
            'valor_mensal' => 20000.00,
            'valor_total' => 115000.00,
            'rua' => 'Rua das Flores',
        ]);

        $this->assertDatabaseCount('contrato_dias_semana', 2);
    }

    public function test_frequencia_e_derivada_do_numero_de_dias_escolhidos(): void
    {
        $cliente = $this->clienteAutenticado();
        $distrito = $this->makeDistrito();
        $tipo = $this->makeTipoResiduo();
        $this->addDisponibilidade($distrito->id, [1, 2, 3]);

        $response = $this->withToken($cliente->token)
            ->postJson('/api/contratos', [
                'distrito_id' => $distrito->id,
                'tipo_residuo_id' => $tipo->id,
                'dias_semana' => [1, 2, 3],
                'duracao_meses' => 1,
            ]);

        $response->assertCreated()
            ->assertJsonPath('frequencia_semanal', 3)
            ->assertJsonPath('valor_mensal', 30000);
    }

    public function test_dia_fora_da_disponibilidade_do_distrito_e_rejeitado(): void
    {
        $cliente = $this->clienteAutenticado();
        $distrito = $this->makeDistrito();
        $tipo = $this->makeTipoResiduo();
        $this->addDisponibilidade($distrito->id, [1, 3]);

        $response = $this->withToken($cliente->token)
            ->postJson('/api/contratos', [
                'distrito_id' => $distrito->id,
                'tipo_residuo_id' => $tipo->id,
                'dias_semana' => [1, 5],
                'duracao_meses' => 5,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['dias_semana']);

        $this->assertDatabaseCount('contratos', 0);
    }

    public function test_dia_invalido_e_rejeitado(): void
    {
        $cliente = $this->clienteAutenticado();
        $distrito = $this->makeDistrito();
        $tipo = $this->makeTipoResiduo();
        $this->addDisponibilidade($distrito->id, [1, 3]);

        $this->withToken($cliente->token)
            ->postJson('/api/contratos', [
                'distrito_id' => $distrito->id,
                'tipo_residuo_id' => $tipo->id,
                'dias_semana' => [1, 8],
                'duracao_meses' => 5,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['dias_semana.1']);
    }

    public function test_dia_duplicado_e_rejeitado(): void
    {
        $cliente = $this->clienteAutenticado();
        $distrito = $this->makeDistrito();
        $tipo = $this->makeTipoResiduo();
        $this->addDisponibilidade($distrito->id, [1, 3]);

        $this->withToken($cliente->token)
            ->postJson('/api/contratos', [
                'distrito_id' => $distrito->id,
                'tipo_residuo_id' => $tipo->id,
                'dias_semana' => [1, 1],
                'duracao_meses' => 5,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['dias_semana.1']);
    }

    public function test_nao_cliente_recebe_403(): void
    {
        $motorista = User::factory()->create(['role' => 'motorista']);
        $distrito = $this->makeDistrito();
        $tipo = $this->makeTipoResiduo();
        $this->addDisponibilidade($distrito->id, [1]);

        $this->withToken($motorista->createToken('test')->plainTextToken)
            ->postJson('/api/contratos', [
                'distrito_id' => $distrito->id,
                'tipo_residuo_id' => $tipo->id,
                'dias_semana' => [1],
                'duracao_meses' => 5,
            ])
            ->assertForbidden();

        $this->assertDatabaseCount('contratos', 0);
    }

    public function test_abertura_sem_token_recebe_401(): void
    {
        $distrito = $this->makeDistrito();
        $tipo = $this->makeTipoResiduo();
        $this->addDisponibilidade($distrito->id, [1]);

        $this->postJson('/api/contratos', [
            'distrito_id' => $distrito->id,
            'tipo_residuo_id' => $tipo->id,
            'dias_semana' => [1],
            'duracao_meses' => 5,
        ])->assertUnauthorized();
    }

    private function clienteAutenticado(): object
    {
        $user = User::factory()->create(['role' => 'cliente']);

        return (object) [
            'user' => $user,
            'token' => $user->createToken('test')->plainTextToken,
        ];
    }

    private function makeDistrito(): Distrito
    {
        $provincia = Provincia::create(['nome' => 'Luanda']);
        $municipio = Municipio::create(['provincia_id' => $provincia->id, 'nome' => 'Belas']);

        return Distrito::create(['municipio_id' => $municipio->id, 'nome' => 'Morro dos Veados']);
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

    /**
     * @param  array<int>  $dias
     */
    private function addDisponibilidade(int $distritoId, array $dias): void
    {
        foreach ($dias as $dia) {
            DisponibilidadeDistrito::create(['distrito_id' => $distritoId, 'dia_semana' => $dia]);
        }
    }
}
