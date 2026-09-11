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

class AgendamentoAdminListaTest extends TestCase
{
    use RefreshDatabase;

    public function test_lista_sem_datas_assume_hoje(): void
    {
        $admin = $this->admin();
        $hoje = $this->makeAgendamento('pendente', now());
        $amanha = $this->makeAgendamento('pendente', now()->addDay());

        $this->withToken($admin->token)
            ->getJson('/api/administracao/agendamentos')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $hoje->id);
    }

    public function test_lista_filtra_por_intervalo(): void
    {
        $admin = $this->admin();
        $this->makeAgendamento('pendente', now());
        $amanha = $this->makeAgendamento('concluido', now()->addDay());

        $this->withToken($admin->token)
            ->getJson('/api/administracao/agendamentos?inicio='.now()->addDay()->toDateString().'&fim='.now()->addDay()->toDateString())
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $amanha->id);
    }

    public function test_lista_inclui_todos_os_motoristas_e_contrato(): void
    {
        $admin = $this->admin();
        $motorista = $this->makeMotorista();
        $agendamento = $this->makeAgendamento('pendente', now(), $motorista->id);

        $this->withToken($admin->token)
            ->getJson('/api/administracao/agendamentos')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.motorista.utilizador.id', $motorista->mot_user_id)
            ->assertJsonPath('0.contrato.cliente.nome', $agendamento->contrato->cliente->nome)
            ->assertJsonPath('0.contrato.distrito.nome', $agendamento->contrato->distrito->nome);
    }

    public function test_lista_ordena_por_data_recolha(): void
    {
        $admin = $this->admin();
        $primeira = $this->makeAgendamento('pendente', now()->addDays(2));
        $segunda = $this->makeAgendamento('pendente', now()->addDays(1));

        $this->withToken($admin->token)
            ->getJson('/api/administracao/agendamentos?inicio='.now()->toDateString().'&fim='.now()->addDays(2)->toDateString())
            ->assertOk()
            ->assertJsonCount(2)
            ->assertJsonPath('0.id', $segunda->id)
            ->assertJsonPath('1.id', $primeira->id);
    }

    public function test_lista_inicio_posterior_ao_fim_devolve_422(): void
    {
        $admin = $this->admin();

        $this->withToken($admin->token)
            ->getJson('/api/administracao/agendamentos?inicio='.now()->toDateString().'&fim='.now()->subDay()->toDateString())
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['inicio']);
    }

    public function test_sem_token_recebe_401(): void
    {
        $this->getJson('/api/administracao/agendamentos')->assertUnauthorized();
    }

    public function test_nao_admin_recebe_403(): void
    {
        $cliente = User::factory()->create(['role' => 'cliente']);

        $this->withToken($cliente->createToken('test')->plainTextToken)
            ->getJson('/api/administracao/agendamentos')
            ->assertForbidden();
    }

    private function admin(): object
    {
        $user = User::factory()->create(['role' => 'admin']);

        return (object) [
            'user' => $user,
            'token' => $user->createToken('test')->plainTextToken,
        ];
    }

    private function makeMotorista(): object
    {
        $user = User::factory()->create(['role' => 'motorista']);
        $motorista = Motorista::create(['utilizador_id' => $user->id, 'numero_carta' => 'CART-'.$user->id]);

        return (object) [
            'motorista' => $motorista,
            'id' => $motorista->id,
            'mot_user_id' => $user->id,
        ];
    }

    private function makeAgendamento(string $estado, ?Carbon $data = null, ?int $motoristaId = null): AgendamentoRecolha
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
