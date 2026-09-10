<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="utf-8">
    <style>
        * { font-family: 'DejaVu Sans', sans-serif; }
        body { font-size: 13px; color: #1f2937; }
        .header { border-bottom: 2px solid #16a34a; padding-bottom: 12px; margin-bottom: 16px; }
        .brand { font-size: 20px; font-weight: bold; color: #16a34a; }
        .subtitle { font-size: 11px; color: #6b7280; }
        .title { font-size: 18px; font-weight: bold; margin: 0 0 4px; }
        .meta { color: #6b7280; font-size: 11px; margin-bottom: 18px; }

        .campos { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
        .campos td { padding: 4px 0; vertical-align: top; }
        .campos .rotulo { width: 180px; color: #6b7280; font-size: 11px; padding-right: 12px; }
        .campos .valor { font-weight: bold; }

        .items { width: 100%; border-collapse: collapse; table-layout: fixed; }
        .items th, .items td { border: 1px solid #d1d5db; padding: 8px 10px; text-align: left; }
        .items th { background: #f3f4f6; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
        .items .c-parcela { width: 16%; }
        .items .c-descricao { width: 44%; }
        .items .c-vencimento { width: 20%; }
        .items .c-valor { width: 20%; text-align: right; }
        .items .total td { border-top: 2px solid #1f2937; font-weight: bold; text-align: right; }
        .items .total .amount { font-size: 18px; color: #333333; }
        .footer { margin-top: 28px; font-size: 10px; color: #6b7280; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <div class="brand">ELISAL-EP</div>
        <div class="subtitle">Empresa de Limpeza e Saneamento de Luanda · Recibo de Mensalidade</div>
    </div>

    <h1 class="title">Recibo Nº {{ $parcela->numero_recibo }}</h1>
    <div class="meta">Emitido a {{ \Carbon\Carbon::parse($parcela->data_pagamento)->format('d/m/Y H:i') }}
        · Contrato Nº {{ $parcela->contrato_id }}</div>

    <table class="campos">
        <tr><td class="rotulo">Cliente</td><td class="valor">{{ $parcela->contrato->cliente->nome }}</td></tr>
        <tr><td class="rotulo">NIF</td><td class="valor">{{ $parcela->contrato->cliente->nif ?? '—' }}</td></tr>
        <tr><td class="rotulo">Tipo de resíduo</td><td class="valor">{{ $parcela->contrato->tipoResiduo->nome }}</td></tr>
        <tr>
            <td class="rotulo">Localização</td>
            <td class="valor">
                {{ $parcela->contrato->distrito->municipio->provincia->nome }} ·
                {{ $parcela->contrato->distrito->municipio->nome }} ·
                {{ $parcela->contrato->distrito->nome }}
            </td>
        </tr>
         <tr><td class="rotulo">Liquidado por</td><td class="valor">{{ $parcela->registadoPor->nome ?? '—' }}</td></tr>
    </table>

    <table class="items">
        <colgroup>
            <col class="c-parcela"><col class="c-descricao"><col class="c-vencimento"><col class="c-valor">
        </colgroup>
        <thead>
            <tr>
                <th>Parcela</th>
                <th>Descrição</th>
                 <th>Valor (AOA)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{{ $parcela->numero_parcela }}</td>
                <td>Mensalidade de recolha de resíduos sólidos urbanos</td>
                 <td class="c-valor">{{ number_format((float) $parcela->valor, 2, ',', ' ') }}</td>
            </tr>
        </tbody>
      <tfoot>
            <tr class="total">
                <td colspan="2">Total pago</td>
                <td class="">{{ number_format((float) $parcela->valor, 2, ',', ' ') }}</td>
            </tr>
        </tfoot>
    </table>

    <div class="footer">
        Documento comprovativo de pagamento gerado eletronicamente pelo Sistema ELISAL-EP.<br>
        Estado: {{ mb_strtoupper($parcela->estado) }} · Data de pagamento: {{ \Carbon\Carbon::parse($parcela->data_pagamento)->format('d/m/Y') }}
    </div>
</body>
</html>