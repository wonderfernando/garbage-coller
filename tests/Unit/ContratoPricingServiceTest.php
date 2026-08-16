<?php

namespace Tests\Unit;

use App\Models\TipoResiduo;
use App\Services\ContratoPricingService;
use PHPUnit\Framework\TestCase;

class ContratoPricingServiceTest extends TestCase
{
    private ContratoPricingService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new ContratoPricingService;
    }

    public function test_valor_mensal_e_o_numero_de_recolhas_vezes_quatro_vezes_o_preco_unitario(): void
    {
        $tipo = $this->tipoResiduo(preco: 2500.00, taxa: 15000.00);

        $resultado = $this->service->calculate($tipo, recolhasPorSemana: 2, duracaoMeses: 5);

        $this->assertSame(20000.00, $resultado['valor_mensal']);
    }

    public function test_valor_total_soma_a_taxa_de_adesao_ao_valor_mensal_vezes_a_duracao(): void
    {
        $tipo = $this->tipoResiduo(preco: 2500.00, taxa: 15000.00);

        $resultado = $this->service->calculate($tipo, recolhasPorSemana: 2, duracaoMeses: 5);

        $this->assertSame(115000.00, $resultado['valor_total']);
    }

    public function test_valores_sao_arredondados_a_duas_casas_decimais(): void
    {
        $tipo = $this->tipoResiduo(preco: 1234.567, taxa: 9999.999);

        $resultado = $this->service->calculate($tipo, recolhasPorSemana: 1, duracaoMeses: 1);

        $this->assertSame(4938.27, $resultado['valor_mensal']);
        $this->assertSame(14938.27, $resultado['valor_total']);
    }

    public function test_devolve_a_taxa_de_adesao_como_snapshot(): void
    {
        $tipo = $this->tipoResiduo(preco: 2500.00, taxa: 15000.00);

        $resultado = $this->service->calculate($tipo, recolhasPorSemana: 1, duracaoMeses: 1);

        $this->assertSame(15000.00, $resultado['taxa_adesao']);
    }

    private function tipoResiduo(float $preco, float $taxa): TipoResiduo
    {
        $tipo = new TipoResiduo;
        $tipo->preco_unitario_recolha = $preco;
        $tipo->taxa_adesao = $taxa;

        return $tipo;
    }
}
