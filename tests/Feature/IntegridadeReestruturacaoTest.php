<?php

namespace Tests\Feature;

use App\Models\Contrato;
use App\Models\ContratoDiaSemana;
use App\Models\Distrito;
use App\Models\Motorista;
use App\Models\Municipio;
use App\Models\Provincia;
use App\Models\User;
use App\Models\Veiculo;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class IntegridadeReestruturacaoTest extends TestCase
{
    use RefreshDatabase;

    public function test_geografia_rejeita_municipio_duplicado_na_mesma_provincia(): void
    {
        $provincia = Provincia::create(['nome' => 'Luanda']);
        Municipio::create(['provincia_id' => $provincia->id, 'nome' => 'Belas']);

        $this->expectException(QueryException::class);

        Municipio::create(['provincia_id' => $provincia->id, 'nome' => 'Belas']);
    }

    public function test_mesmo_nome_de_municipio_permitido_em_provincias_diferentes(): void
    {
        $luanda = Provincia::create(['nome' => 'Luanda']);
        $benguela = Provincia::create(['nome' => 'Benguela']);

        Municipio::create(['provincia_id' => $luanda->id, 'nome' => 'Belas']);
        Municipio::create(['provincia_id' => $benguela->id, 'nome' => 'Belas']);

        $this->assertDatabaseCount('municipios', 2);
    }

    public function test_geografia_rejeita_distrito_duplicado_no_mesmo_municipio(): void
    {
        $provincia = Provincia::create(['nome' => 'Luanda']);
        $municipio = Municipio::create(['provincia_id' => $provincia->id, 'nome' => 'Belas']);
        Distrito::create(['municipio_id' => $municipio->id, 'nome' => 'Morro dos Veados']);

        $this->expectException(QueryException::class);

        Distrito::create(['municipio_id' => $municipio->id, 'nome' => 'Morro dos Veados']);
    }

    public function test_eliminar_provincia_elimina_municipios_e_distritos(): void
    {
        $provincia = Provincia::create(['nome' => 'Luanda']);
        $municipio = Municipio::create(['provincia_id' => $provincia->id, 'nome' => 'Belas']);
        Distrito::create(['municipio_id' => $municipio->id, 'nome' => 'Morro dos Veados']);

        $provincia->delete();

        $this->assertDatabaseMissing('provincias', ['id' => $provincia->id]);
        $this->assertDatabaseMissing('municipios', ['id' => $municipio->id]);
        $this->assertDatabaseCount('distritos', 0);
    }

    public function test_contrato_dias_semana_rejeita_mesmo_dia_no_mesmo_contrato(): void
    {
        $contrato = $this->makeContrato();
        ContratoDiaSemana::create(['contrato_id' => $contrato->id, 'dia_semana' => 2]);

        $this->expectException(QueryException::class);

        ContratoDiaSemana::create(['contrato_id' => $contrato->id, 'dia_semana' => 2]);
    }

    public function test_contrato_dias_semana_aceita_dias_diferentes_no_mesmo_contrato(): void
    {
        $contrato = $this->makeContrato();

        ContratoDiaSemana::create(['contrato_id' => $contrato->id, 'dia_semana' => 2]);
        ContratoDiaSemana::create(['contrato_id' => $contrato->id, 'dia_semana' => 5]);

        $this->assertDatabaseCount('contrato_dias_semana', 2);
    }

    public function test_eliminar_contrato_elimina_dias_semana(): void
    {
        $contrato = $this->makeContrato();
        ContratoDiaSemana::create(['contrato_id' => $contrato->id, 'dia_semana' => 2]);

        $contrato->delete();

        $this->assertDatabaseCount('contrato_dias_semana', 0);
    }

    public function test_veiculo_rejeita_matricula_duplicada(): void
    {
        Veiculo::create(['matricula' => 'LD-20-11-AB']);

        $this->expectException(QueryException::class);

        Veiculo::create(['matricula' => 'LD-20-11-AB']);
    }

    public function test_veiculo_pode_existir_sem_motorista(): void
    {
        $veiculo = Veiculo::create(['matricula' => 'LD-20-11-AB']);

        $this->assertDatabaseHas('veiculos', [
            'id' => $veiculo->id,
            'motorista_id' => null,
        ]);
    }

    public function test_eliminar_motorista_liberta_veiculo(): void
    {
        $user = User::factory()->create(['role' => 'motorista']);
        $motorista = Motorista::create(['utilizador_id' => $user->id, 'numero_carta' => 'CART-123']);
        $veiculo = Veiculo::create([
            'matricula' => 'LD-20-11-AB',
            'motorista_id' => $motorista->id,
        ]);

        $motorista->delete();

        $this->assertDatabaseHas('veiculos', [
            'id' => $veiculo->id,
            'motorista_id' => null,
        ]);
    }

    private function makeContrato(): Contrato
    {
        $cliente = User::factory()->create(['role' => 'cliente']);
        $distrito = $this->makeDistrito();
        $tipoResiduoId = DB::table('tipos_residuos')->insertGetId([
            'nome' => 'Resíduos Domésticos',
            'descricao' => 'Recolha de resíduos domésticos',
            'preco_unitario_recolha' => 2500.00,
            'taxa_adesao' => 15000.00,
        ]);

        return Contrato::create([
            'cliente_id' => $cliente->id,
            'distrito_id' => $distrito->id,
            'tipo_residuo_id' => $tipoResiduoId,
            'taxa_adesao' => 15000.00,
            'valor_mensal' => 10000.00,
            'valor_total' => 65000.00,
            'frequencia_semanal' => 1,
            'duracao_meses' => 5,
            'estado' => 'pendente',
        ]);
    }

    private function makeDistrito(): Distrito
    {
        $provincia = Provincia::create(['nome' => 'Luanda']);
        $municipio = Municipio::create(['provincia_id' => $provincia->id, 'nome' => 'Belas']);

        return Distrito::create(['municipio_id' => $municipio->id, 'nome' => 'Morro dos Veados']);
    }
}
