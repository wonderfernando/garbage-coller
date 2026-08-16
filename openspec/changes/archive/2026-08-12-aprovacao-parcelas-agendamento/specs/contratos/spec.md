## ADDED Requirements

### Requirement: Aprovação e rejeição de contrato
O sistema SHALL permitir ao administrador aprovar ou rejeitar um contrato pendente, mudando respetivamente o estado para `aprovado` ou `rejeitado`, e SHALL proibir a aprovação ou rejeição de um contrato que não esteja no estado `pendente`. A aprovação de um contrato SHALL desencadear a geração das suas parcelas de mensalidade e dos seus agendamentos de recolha.

#### Scenario: Aprovar contrato pendente
- **WHEN** um administrador aprova um contrato pendente
- **THEN** o estado do contrato passa a `aprovado`
- **AND** o sistema gera as parcelas de mensalidade e os agendamentos de recolha do contrato

#### Scenario: Rejeitar contrato pendente
- **WHEN** um administrador rejeita um contrato pendente
- **THEN** o estado do contrato passa a `rejeitado`
- **AND** nenhuma parcela nem agendamento de recolha é gerado

#### Scenario: Aprovar contrato fora do estado pendente
- **WHEN** um administrador tenta aprovar ou rejeitar um contrato que não está no estado `pendente`
- **THEN** o sistema rejeita o pedido

#### Scenario: Aprovação por não-administrador
- **WHEN** um utilizador sem perfil de administrador tenta aprovar ou rejeitar um contrato
- **THEN** o sistema rejeita o pedido

## MODIFIED Requirements

### Requirement: Parcelas de mensalidade
O sistema SHALL armazenar as parcelas mensais de cada contrato aprovado, cada uma referenciando o contrato, numerada (`numero_parcela`), com valor, data de vencimento e estado `pendente` ou `pago`. Quando uma parcela é paga, o sistema regista a `data_pagamento`, o utilizador que registou o pagamento (`registado_por_id`) e o número do recibo (`numero_recibo`).

#### Scenario: Criar parcelas de contrato
- **WHEN** um contrato aprovado gera as suas parcelas mensais
- **THEN** cada parcela fica guardada referenciando o contrato, com `numero_parcela`, valor, data de vencimento e estado `pendente`

#### Scenario: Gerar parcelas com vencimento no dia 5
- **WHEN** um contrato pendente é aprovado com uma duração de N meses
- **THEN** são criadas N parcelas mensais, uma por mês da duração
- **AND** cada parcela tem `numero_parcela` sequencial, o `valor_mensal` do contrato, vencimento no dia 5 do mês e estado `pendente` e referencia o contrato

#### Scenario: Registar pagamento de parcela
- **WHEN** uma parcela pendente é paga
- **THEN** o estado da parcela passa a `pago` e a `data_pagamento` fica registada
- **AND** o utilizador que registou o pagamento (`registado_por_id`) e o número do recibo (`numero_recibo`) ficam guardados

#### Scenario: Parcela sem contrato
- **WHEN** é tentado guardar uma parcela sem contrato associado
- **THEN** o sistema rejeita o registo

### Requirement: Agendamentos de recolha
O sistema SHALL armazenar agendamentos de recolha, cada um referenciando um contrato e opcionalmente um motorista, com data prevista (`data_recolha` datetime), estado `pendente`, `concluido` ou `cancelado` e observação que é obrigatória quando o estado é `cancelado`.

#### Scenario: Gerar agendamentos de contrato
- **WHEN** um contrato aprovado gera as datas de recolha pelos dias da semana escolhidos
- **THEN** cada agendamento fica guardado referenciando o contrato, com `data_recolha` (datetime) e estado `pendente`
- **AND** uma `observacao` pode ser guardada de forma opcional

#### Scenario: Gerar agendamentos pela duração do contrato
- **WHEN** um contrato pendente é aprovado com uma duração de N meses
- **THEN** são criadas as datas de recolha de todos os dias da semana escolhidos em cada mês da duração
- **AND** cada agendamento referencia o contrato, tem `data_recolha` (datetime) e estado `pendente`

#### Scenario: Associar motorista a agendamento
- **WHEN** um motorista é atribuído a um agendamento
- **THEN** o agendamento passa a referenciar o motorista

#### Scenario: Cancelar agendamento exige observação
- **WHEN** um agendamento pendente é cancelado
- **THEN** o estado passa a `cancelado`
- **AND** o sistema exige uma observação justificando o cancelamento

#### Scenario: Agendamento sem contrato
- **WHEN** é tentado guardar um agendamento sem contrato associado
- **THEN** o sistema rejeita o registo