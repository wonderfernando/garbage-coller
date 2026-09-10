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

class ConsultasClienteTest extends TestCase
{
    use RefreshDatabase;

    public function test_cliente_consulta_apenas_as_suas_parcelas(): void
    {
        $cliente = $this->clienteAutenticado();
        $outroCliente = User::factory()->create(['role' => 'cliente']);
        $contrato = $this->makeContrato($cliente->user);
        $contratoAlheio = $this->makeContrato($outroCliente);

        $minhaParcela = $this->makeParcela($contrato, 1);
        $this->makeParcela($contratoAlheio, 2);

        $response = $this->withToken($cliente->token)
            ->getJson('/api/meus/parcelas');

        $response->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $minhaParcela->id)
            ->assertJsonPath('0.contrato.id', $contrato->id);
    }

    public function test_cliente_consulta_apenas_os_seus_agendamentos(): void
    {
        $cliente = $this->clienteAutenticado();
        $outroCliente = User::factory()->create(['role' => 'cliente']);
        $contrato = $this->makeContrato($cliente->user);
        $contratoAlheio = $this->makeContrato($outroCliente);

        $meuAgendamento = $this->makeAgendamento($contrato);
        $this->makeAgendamento($contratoAlheio);

        $response = $this->withToken($cliente->token)
            ->getJson('/api/meus/agendamentos');

        $response->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $meuAgendamento->id)
            ->assertJsonPath('0.contrato.id', $contrato->id);
    }

    public function test_cliente_nao_ve_contrato_de_outro_cliente(): void
    {
        $cliente = $this->clienteAutenticado();
        $outroCliente = User::factory()->create(['role' => 'cliente']);
        $contratoAlheio = $this->makeContrato($outroCliente);

        $this->withToken($cliente->token)
            ->getJson("/api/contratos/{$contratoAlheio->id}")
            ->assertNotFound();
    }

    public function test_detalhe_do_contrato_inclui_parcelas_e_agendamentos(): void
    {
        $cliente = $this->clienteAutenticado();
        $contrato = $this->makeContrato($cliente->user, 'aprovado');
        $this->makeParcela($contrato, 1);
        $this->makeAgendamento($contrato);

        $this->withToken($cliente->token)
            ->getJson("/api/contratos/{$contrato->id}")
            ->assertOk()
            ->assertJsonCount(1, 'parcelas')
            ->assertJsonCount(1, 'agendamentos');
    }

    public function test_consulta_sem_token_recebe_401(): void
    {
        $this->getJson('/api/meus/parcelas')->assertUnauthorized();
        $this->getJson('/api/meus/agendamentos')->assertUnauthorized();
    }

    public function test_nao_cliente_recebe_403(): void
    {
        $motorista = User::factory()->create(['role' => 'motorista']);

        $this->withToken($motorista->createToken('test')->plainTextToken)
            ->getJson('/api/meus/parcelas')
            ->assertForbidden();

        $this->withToken($motorista->createToken('test')->plainTextToken)
            ->getJson('/api/meus/agendamentos')
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

    private function makeContrato(User $cliente, string $estado = 'aprovado')
    {
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

    private function makeParcela($contrato, int $numero): ParcelaMensalidade
    {
        return ParcelaMensalidade::create([
            'contrato_id' => $contrato->id,
            'numero_parcela' => $numero,
            'valor' => 20000.00,
            'data_vencimento' => now()->addMonths($numero)->toDateString(),
            'estado' => 'pendente',
        ]);
    }

    private function makeAgendamento($contrato): AgendamentoRecolha
    {
        return AgendamentoRecolha::create([
            'contrato_id' => $contrato->id,
            'data_recolha' => now()->addDays(1)->toDateString(),
            'estado' => 'pendente',
        ]);
    }
}
