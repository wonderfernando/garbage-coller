<?php

namespace App\Services;

use App\Models\Contrato;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ContratoAprovacaoService
{
    public function __construct(
        private readonly GerarParcelasService $parcelas,
        private readonly GerarAgendamentoService $agendamentos,
    ) {}

    public function aprovar(Contrato $contrato): Contrato
    {
        $this->garantirPendente($contrato);

        return DB::transaction(function () use ($contrato) {
            $contrato->update(['estado' => 'aprovado']);
            $this->parcelas->gerar($contrato);
            $this->agendamentos->gerar($contrato);

            return $contrato->refresh();
        });
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