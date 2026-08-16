<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Distrito;
use App\Models\Provincia;
use Illuminate\Http\JsonResponse;

class GeografiaController extends Controller
{
    public function index(): JsonResponse
    {
        $provincias = Provincia::with('municipios.distritos')->orderBy('nome')->get();

        return response()->json($provincias);
    }

    public function distritos(): JsonResponse
    {
        $distritos = Distrito::with('municipio.provincia', 'disponibilidades')->orderBy('nome')->get();

        return response()->json($distritos);
    }
}
