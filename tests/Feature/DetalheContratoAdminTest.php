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

class DetalheContratoAdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_consulta_detalhe_do_contrato_com_parcelas_e_agendamentos(): void
    {
        $admin = $this->admin();
        $contrato = $this->makeContrato('aprovado');
        $parcela = ParcelaMensalidade::create([
            'contrato_id' => $contrato->id,
            'numero_parcela' => 1,
            'valor' => 20000.00,
            'data_vencimento' => now()->addMonth()->toDateString(),
            'estado' => 'pendente',
        ]);
        $agendamento = AgendamentoRecolha::create([
            'contrato_id' => $contrato->id,
            'data_recolha' => now()->addDays(1)->toDateString(),
            'estado' => 'pendente',
        ]);

        $this->withToken($admin->token)
            ->getJson("/api/administracao/contratos/{$contrato->id}")
            ->assertOk()
            ->assertJsonPath('estado', 'aprovado')
            ->assertJsonCount(1, 'parcelas')
            ->assertJsonPath('parcelas.0.id', $parcela->id)
            ->assertJsonCount(1, 'agendamentos')
            ->assertJsonPath('agendamentos.0.id', $agendamento->id);
    }

    public function test_nao_admin_recebe_403(): void
    {
        $cliente = User::factory()->create(['role' => 'cliente']);
        $contrato = $this->makeContrato('pendente');

        $this->withToken($cliente->createToken('test')->plainTextToken)
            ->getJson("/api/administracao/contratos/{$contrato->id}")
            ->assertForbidden();
    }

    public function test_sem_token_recebe_401(): void
    {
        $contrato = $this->makeContrato('pendente');

        $this->getJson("/api/administracao/contratos/{$contrato->id}")
            ->assertUnauthorized();
    }

    public function test_contrato_inexistente_recebe_404(): void
    {
        $admin = $this->admin();

        $this->withToken($admin->token)
            ->getJson('/api/administracao/contratos/99999')
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

    private function makeContrato(string $estado)
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
