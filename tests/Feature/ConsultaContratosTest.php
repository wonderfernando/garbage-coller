<?php

namespace Tests\Feature;

use App\Models\Contrato;
use App\Models\ContratoDiaSemana;
use App\Models\DisponibilidadeDistrito;
use App\Models\Distrito;
use App\Models\Municipio;
use App\Models\Provincia;
use App\Models\TipoResiduo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConsultaContratosTest extends TestCase
{
    use RefreshDatabase;

    public function test_cliente_lista_apenas_os_seus_contratos(): void
    {
        $cliente = $this->clienteAutenticado();
        $outro = User::factory()->create(['role' => 'cliente']);
        $distrito = $this->makeDistrito();
        $tipo = $this->makeTipoResiduo();
        DisponibilidadeDistrito::create(['distrito_id' => $distrito->id, 'dia_semana' => 1]);
        DisponibilidadeDistrito::create(['distrito_id' => $distrito->id, 'dia_semana' => 2]);

        $meuContrato = $this->abrirContrato($cliente->user, $distrito, $tipo, [1]);
        $this->abrirContrato($outro, $distrito, $tipo, [2]);

        $this->withToken($cliente->token)
            ->getJson('/api/contratos')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $meuContrato->id)
            ->assertJsonCount(1, '0.dias_semana');
    }

    public function test_cliente_consulta_detalhe_de_contrato_proprio(): void
    {
        $cliente = $this->clienteAutenticado();
        $distrito = $this->makeDistrito();
        $tipo = $this->makeTipoResiduo();
        DisponibilidadeDistrito::create(['distrito_id' => $distrito->id, 'dia_semana' => 1]);
        DisponibilidadeDistrito::create(['distrito_id' => $distrito->id, 'dia_semana' => 3]);

        $contrato = $this->abrirContrato($cliente->user, $distrito, $tipo, [1, 3]);

        $this->withToken($cliente->token)
            ->getJson("/api/contratos/{$contrato->id}")
            ->assertOk()
            ->assertJsonPath('id', $contrato->id)
            ->assertJsonCount(2, 'dias_semana')
            ->assertJsonPath('tipo_residuo.nome', 'Resíduos Domésticos');
    }

    public function test_contrato_de_outro_cliente_devolve_404(): void
    {
        $cliente = $this->clienteAutenticado();
        $outro = User::factory()->create(['role' => 'cliente']);
        $distrito = $this->makeDistrito();
        $tipo = $this->makeTipoResiduo();
        DisponibilidadeDistrito::create(['distrito_id' => $distrito->id, 'dia_semana' => 1]);

        $contratoAlheio = $this->abrirContrato($outro, $distrito, $tipo, [1]);

        $this->withToken($cliente->token)
            ->getJson("/api/contratos/{$contratoAlheio->id}")
            ->assertNotFound();
    }

    public function test_contrato_inexistente_devolve_404(): void
    {
        $cliente = $this->clienteAutenticado();

        $this->withToken($cliente->token)
            ->getJson('/api/contratos/9999')
            ->assertNotFound();
    }

    public function test_nao_cliente_recebe_403(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->withToken($admin->createToken('test')->plainTextToken)
            ->getJson('/api/contratos')
            ->assertForbidden();
    }

    private function clienteAutenticado(): object
    {
        $user = User::factory()->create(['role' => 'cliente']);

        return (object) [
            'user' => $user,
            'token' => $user->createToken('test')->plainTextToken,
        ];
    }

    private function abrirContrato(User $cliente, Distrito $distrito, TipoResiduo $tipo, array $dias): Contrato
    {
        $contrato = Contrato::create([
            'cliente_id' => $cliente->id,
            'distrito_id' => $distrito->id,
            'tipo_residuo_id' => $tipo->id,
            'taxa_adesao' => $tipo->taxa_adesao,
            'valor_mensal' => count($dias) * 4 * $tipo->preco_unitario_recolha,
            'valor_total' => $tipo->taxa_adesao + (count($dias) * 4 * $tipo->preco_unitario_recolha),
            'frequencia_semanal' => count($dias),
            'duracao_meses' => 1,
            'estado' => 'pendente',
        ]);

        foreach ($dias as $dia) {
            ContratoDiaSemana::create(['contrato_id' => $contrato->id, 'dia_semana' => $dia]);
        }

        return $contrato;
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
}
