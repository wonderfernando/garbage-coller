<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Distrito;
use App\Services\DisponibilidadeDistritoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DisponibilidadeDistritoController extends Controller
{
    public function __construct(private readonly DisponibilidadeDistritoService $disponibilidade) {}

    public function store(Request $request, Distrito $distrito): JsonResponse
    {
        $data = $request->validate([
            'dia_semana' => ['required', 'integer', 'between:1,7'],
        ]);

        $dia = $this->disponibilidade->addDay($distrito, (int) $data['dia_semana']);

        return response()->json($dia, 201);
    }

    public function destroy(Distrito $distrito, int $dia): JsonResponse
    {
        $this->disponibilidade->removeDay($distrito, $dia);

        return response()->json(null, 204);
    }
}
