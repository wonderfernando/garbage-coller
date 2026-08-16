<?php

namespace Tests\Unit;

use App\Jobs\GerarParcelasContrato;
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

class GerarParcelasContratoTest extends TestCase
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

    public function test_gera_uma_parcela_por_mes_de_duracao_com_vencimento_no_dia_5(): void
    {
        $contrato = $this->makeContrato(duracaoMeses: 3, valorMensal: 20000.00);

        (new GerarParcelasContrato($contrato))->handle();

        $this->assertDatabaseCount('parcelas_mensalidades', 3);

        $parcelas = $contrato->parcelas()->orderBy('numero_parcela')->get();

        $this->assertSame([1, 2, 3], $parcelas->pluck('numero_parcela')->all());

        foreach ($parcelas as $i => $parcela) {
            $this->assertSame('pendente', $parcela->estado);
            $this->assertSame(20000.00, (float) $parcela->valor);
            $vencimento = Carbon::parse($parcela->data_vencimento);
            $this->assertSame(5, $vencimento->day);
            $this->assertSame(1 + $i, $vencimento->month);
        }
    }

    public function test_nao_duplica_parcelas_quando_ja_existem(): void
    {
        $contrato = $this->makeContrato(duracaoMeses: 2, valorMensal: 10000.00);

        (new GerarParcelasContrato($contrato))->handle();
        (new GerarParcelasContrato($contrato))->handle();

        $this->assertDatabaseCount('parcelas_mensalidades', 2);
    }

    private function makeContrato(int $duracaoMeses, float $valorMensal): Contrato
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
            'valor_mensal' => $valorMensal,
            'valor_total' => $valorMensal * $duracaoMeses + 15000.00,
            'frequencia_semanal' => 1,
            'duracao_meses' => $duracaoMeses,
            'estado' => 'pendente',
        ]);

        ContratoDiaSemana::create(['contrato_id' => $contrato->id, 'dia_semana' => 1]);

        return $contrato;
    }
}
