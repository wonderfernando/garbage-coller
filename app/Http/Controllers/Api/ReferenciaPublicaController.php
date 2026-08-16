<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Distrito;
use App\Models\TipoResiduo;
use Illuminate\Http\JsonResponse;

class ReferenciaPublicaController extends Controller
{
    public function tiposResiduos(): JsonResponse
    {
        return response()->json(TipoResiduo::orderBy('nome')->get());
    }

    public function distritos(): JsonResponse
    {
        $distritos = Distrito::with('municipio.provincia', 'disponibilidades')->orderBy('nome')->get();

        return response()->json($distritos);
    }
}
