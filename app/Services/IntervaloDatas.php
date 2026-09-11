<?php

namespace App\Services;

use Carbon\CarbonImmutable;
use Illuminate\Validation\ValidationException;

class IntervaloDatas
{
    /** @return array{CarbonImmutable, CarbonImmutable} */
    public static function normalizar(?string $inicio, ?string $fim): array
    {
        if ($inicio === null && $fim === null) {
            $hoje = CarbonImmutable::today();

            return [$hoje, $hoje];
        }

        if ($inicio === null || $fim === null) {
            throw ValidationException::withMessages([
                'inicio' => 'Os parâmetros inicio e fim têm de ser indicados em conjunto.',
            ]);
        }

        try {
            $inicioData = CarbonImmutable::createFromFormat('Y-m-d', $inicio)->startOfDay();
            $fimData = CarbonImmutable::createFromFormat('Y-m-d', $fim)->startOfDay();
        } catch (\Throwable) {
            throw ValidationException::withMessages([
                'inicio' => 'Data inválida. Use o formato AAAA-MM-DD.',
            ]);
        }

        if ($inicioData->format('Y-m-d') !== $inicio || $fimData->format('Y-m-d') !== $fim) {
            throw ValidationException::withMessages([
                'inicio' => 'Data inválida. Use o formato AAAA-MM-DD.',
            ]);
        }

        if ($inicioData->greaterThan($fimData)) {
            throw ValidationException::withMessages([
                'inicio' => 'A data de início não pode ser posterior à data de fim.',
            ]);
        }

        if ($inicioData->diffInDays($fimData) > 30) {
            throw ValidationException::withMessages([
                'inicio' => 'O intervalo máximo para o cronograma é de 31 dias.',
            ]);
        }

        return [$inicioData, $fimData];
    }
}
