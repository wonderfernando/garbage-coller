<?php

namespace App\Services;

use App\Jobs\GerarAgendamentoContrato;
use App\Jobs\GerarParcelasContrato;
use App\Models\Contrato;
use Illuminate\Validation\ValidationException;

class ContratoAprovacaoService
{
    public function aprovar(Contrato $contrato): Contrato
    {
        $this->garantirPendente($contrato);

        $contrato->update(['estado' => 'aprovado']);

        GerarParcelasContrato::dispatch($contrato);
        GerarAgendamentoContrato::dispatch($contrato);

        return $contrato->refresh();
    }

    public function rejeitar(Contrato $contrato): Contrato
    {
        $this->garantirPendente($contrato);

        $contrato->update(['estado' => 'rejeitado']);

        return $contrato->refresh();
    }

    private function garantirPendente(Contrato $contrato): void
    {
        if ($contrato->estado !== 'pendente') {
            throw ValidationException::withMessages([
                'contrato' => 'Apenas contratos pendentes podem ser aprovados ou rejeitados.',
            ]);
        }
    }
}
