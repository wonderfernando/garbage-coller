<?php

namespace App\Services;

use App\Models\Contrato;
use App\Models\ContratoDiaSemana;
use App\Models\DisponibilidadeDistrito;
use App\Models\Distrito;
use App\Models\TipoResiduo;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ContratoClienteService
{
    public function __construct(private readonly ContratoPricingService $pricing) {}

    /**
     * @param  array{distrito_id: int, tipo_residuo_id: int, dias_semana: array<int>, duracao_meses: int, rua?: string|null, ponto_referencia?: string|null, latitude?: string|null, longitude?: string|null}  $data
     */
    public function abrir(User $cliente, array $data): Contrato
    {
        $distrito = Distrito::findOrFail($data['distrito_id']);
        $tipoResiduo = TipoResiduo::findOrFail($data['tipo_residuo_id']);

        $diasSemana = $this->validarDiasDisponiveis($distrito, $data['dias_semana']);
        $recolhasPorSemana = count($diasSemana);
        $duracaoMeses = (int) $data['duracao_meses'];
        $valores = $this->pricing->calculate($tipoResiduo, $recolhasPorSemana, $duracaoMeses);

        return DB::transaction(function () use ($cliente, $distrito, $tipoResiduo, $diasSemana, $recolhasPorSemana, $duracaoMeses, $valores, $data) {
            $contrato = Contrato::create([
                'cliente_id' => $cliente->id,
                'distrito_id' => $distrito->id,
                'tipo_residuo_id' => $tipoResiduo->id,
                'taxa_adesao' => $valores['taxa_adesao'],
                'valor_mensal' => $valores['valor_mensal'],
                'valor_total' => $valores['valor_total'],
                'frequencia_semanal' => $recolhasPorSemana,
                'duracao_meses' => $duracaoMeses,
                'estado' => 'pendente',
                'rua' => $data['rua'] ?? null,
                'ponto_referencia' => $data['ponto_referencia'] ?? null,
                'latitude' => $data['latitude'] ?? null,
                'longitude' => $data['longitude'] ?? null,
            ]);

            foreach ($diasSemana as $dia) {
                ContratoDiaSemana::create([
                    'contrato_id' => $contrato->id,
                    'dia_semana' => $dia,
                ]);
            }

            return $contrato;
        });
    }

    /**
     * @param  array<int>  $diasSemana
     * @return array<int>
     */
    private function validarDiasDisponiveis(Distrito $distrito, array $diasSemana): array
    {
        $disponiveis = DisponibilidadeDistrito::where('distrito_id', $distrito->id)
            ->pluck('dia_semana')
            ->all();

        $indisponiveis = array_values(array_diff($diasSemana, $disponiveis));

        if ($indisponiveis !== []) {
            throw ValidationException::withMessages([
                'dias_semana' => 'Os dias '.implode(', ', $indisponiveis).' não estão disponíveis no distrito selecionado.',
            ]);
        }

        return $diasSemana;
    }
}
