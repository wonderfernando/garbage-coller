<?php

namespace Tests\Unit;

use App\Jobs\GerarAgendamentoContrato;
use App\Models\Contrato;
use App\Models\ContratoDiaSemana;
use App\Models\Distrito;
use App\Models\Municipio;
use App\Models\Provincia;
use App\Models\TipoResiduo;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GerarAgendamentoContratoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow('2026-01-10 10:00:00');
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_gera_agendamentos_pelos_dias_da_semana_em_cada_semana_da_duracao(): void
    {
        $contrato = $this->makeContrato(duracaoMeses: 1, dias: [1]);

        (new GerarAgendamentoContrato($contrato))->handle();

        $this->assertDatabaseCount('agendamentos_recolha', 4);

        $agendamentos = $contrato->agendamentos()->get();

        foreach ($agendamentos as $agendamento) {
            $this->assertSame('pendente', $agendamento->estado);
            $data = Carbon::parse($agendamento->data_recolha);
            $this->assertSame('2026-01', $data->format('Y-m'));
            $this->assertSame(1, $data->dayOfWeekIso);
        }
    }

    public function test_sem_dias_escolhidos_nao_gera_agendamentos(): void
    {
        $contrato = $this->makeContrato(duracaoMeses: 2, dias: []);

        (new GerarAgendamentoContrato($contrato))->handle();

        $this->assertDatabaseCount('agendamentos_recolha', 0);
    }

    private function makeContrato(int $duracaoMeses, array $dias): Contrato
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

        $contrato = Contrato::create([
            'cliente_id' => $cliente->id,
            'distrito_id' => $distrito->id,
            'tipo_residuo_id' => $tipo->id,
            'taxa_adesao' => 15000.00,
            'valor_mensal' => 20000.00,
            'valor_total' => 20000.00 * $duracaoMeses + 15000.00,
            'frequencia_semanal' => count($dias),
            'duracao_meses' => $duracaoMeses,
            'estado' => 'pendente',
        ]);

        foreach ($dias as $dia) {
            ContratoDiaSemana::create(['contrato_id' => $contrato->id, 'dia_semana' => $dia]);
        }

        return $contrato;
    }
}
