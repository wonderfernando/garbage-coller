<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ParcelaMensalidade;
use App\Services\ParcelaLiquidacaoService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ParcelaAdminController extends Controller
{
    public function __construct(private readonly ParcelaLiquidacaoService $liquidacao) {}

    public function liquidar(Request $request, ParcelaMensalidade $parcela): JsonResponse
    {
        $data = $request->validate([
            'numero_recibo' => ['nullable', 'string', 'max:50'],
        ]);

        $parcela = $this->liquidacao->liquidar($parcela, $request->user(), $data['numero_recibo'] ?? null);

        return response()->json($parcela->load('registadoPor'));
    }

    public function recibo(ParcelaMensalidade $parcela): \Illuminate\Http\Response
    {
        $parcela->load('contrato.cliente', 'contrato.tipoResiduo', 'contrato.distrito.municipio.provincia', 'registadoPor');

        $pdf = Pdf::loadView('recibos.parcela', compact('parcela'));

        return $pdf->stream('recibo-'.$parcela->numero_recibo.'.pdf');
    }
}