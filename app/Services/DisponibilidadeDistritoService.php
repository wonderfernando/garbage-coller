<?php

namespace App\Services;

use App\Models\DisponibilidadeDistrito;
use App\Models\Distrito;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\ValidationException;

class DisponibilidadeDistritoService
{
    public function addDay(Distrito $distrito, int $dia): DisponibilidadeDistrito
    {
        if ($dia < 1 || $dia > 7) {
            throw ValidationException::withMessages([
                'dia_semana' => 'O dia da semana deve estar entre 1 e 7.',
            ]);
        }

        $jaConfigurado = DisponibilidadeDistrito::where('distrito_id', $distrito->id)
            ->where('dia_semana', $dia)
            ->exists();

        if ($jaConfigurado) {
            throw ValidationException::withMessages([
                'dia_semana' => 'Este dia já está configurado na disponibilidade do distrito.',
            ]);
        }

        return DisponibilidadeDistrito::create([
            'distrito_id' => $distrito->id,
            'dia_semana' => $dia,
        ]);
    }

    public function removeDay(Distrito $distrito, int $dia): void
    {
        $diaConfigurado = DisponibilidadeDistrito::where('distrito_id', $distrito->id)
            ->where('dia_semana', $dia)
            ->first();

        if (! $diaConfigurado) {
            throw new HttpResponseException(response()->json([
                'message' => 'O dia não está configurado na disponibilidade do distrito.',
            ], 404));
        }

        $diaConfigurado->delete();
    }
}
