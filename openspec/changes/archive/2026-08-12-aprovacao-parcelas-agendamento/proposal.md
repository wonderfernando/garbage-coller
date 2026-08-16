## Why

Os contratos abertos pelos clientes ficam em estado `pendente` até serem validados. Sem aprovação, não há base para gerar as parcelas de mensalidade nem os agendamentos de recolha. Esta fase torna operável o fluxo de aprovação/rejeição de contratos pelo administrador e materializa automaticamente as parcelas e as datas de recolha a partir do contrato aprovado.

## What Changes

- Fluxo de decisão do administrador sobre um contrato `pendente`: **aprovar** (`PATCH /contratos/{id}/aprovar`) ou **rejeitar** (`PATCH /contratos/{id}/rejeitar`), mudando o estado do contrato.
- Aprovação dispara, de forma **assíncrona** (Jobs `ShouldQueue`, nunca lógica síncrona no endpoint), dois efeitos sobre o contrato aprovado:
  1. **GerarParcelasContrato** — cria uma parcela mensal por cada mês da `duracao_meses`, com vencimento no dia 5 do mês, estado `pendente`.
  2. **GerarAgendamentoContrato** — calcula todas as datas de recolha pelos dias da semana escolhidos, para todos os meses da `duracao_meses`, inserindo-as em `agendamentos_recolha` com estado `pendente`.
- Rejeição apenas muda o estado para `rejeitado`, sem gerar parcelas nem agendamentos.
- Aprovação/rejeição só são válidas sobre contratos `pendente`; contratos noutro estado são rejeitados pelo sistema.

## Capabilities

### New Capabilities
- `contratos`: o fluxo de aprovação/rejeição e a geração automática de parcelas e agendamentos de um contrato aprovado. (A spec principal `contratos` já cobre parcelas e agendamentos; esta fase altera e adiciona requisitos nessa mesma capability.)

### Modified Capabilities
- `contratos`: novos/reforçados requisitos — aprovação de contrato pelo admin (apenas sobre `pendente`), rejeição de contrato, geração automática de parcelas mensais (vencimento dia 5) e de agendamentos de recolha (duração do contrato).

## Impact

- **Código**: novo `ContratoAprovacaoService` (regra de decisão), novos Jobs `GerarParcelasContrato` e `GerarAgendamentoContrato`, novo `ContratoAdminController` (ou métodos de aprovação), rotas de admin.
- **API**: `PATCH /contratos/{id}/aprovar` e `PATCH /contratos/{id}/rejeitar` sob `auth:sanctum` + `role:admin`.
- **Base de dados**: sem migrações — `parcelas_mensalidades`, `agendamentos_recolha`, `contrato_dias_semana` já existem.
- **Filas**: `QUEUE_CONNECTION=database` já configurado; Jobs usam a fila `default`.
- **Modelos**: `ParcelaMensalidade`, `AgendamentoRecolha` e `ContratoDiaSemana` já existem (Fase 1).