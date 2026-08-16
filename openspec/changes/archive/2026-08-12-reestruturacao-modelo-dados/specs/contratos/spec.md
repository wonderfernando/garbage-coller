## MODIFIED Requirements

### Requirement: Contratos de recolha
O sistema SHALL armazenar contratos de recolha que ligam um cliente (utilizador com perfil de cliente), um distrito e um tipo de resíduo, com estado `pendente`, `aprovado`, `rejeitado` ou `cancelado`. O contrato guarda os parâmetros de precificação (`frequencia_semanal`, `duracao_meses`), os valores calculados (`taxa_adesao`, `valor_mensal`, `valor_total`), morada opcional (`rua`, `ponto_referencia`) e, opcionalmente, as coordenadas `latitude` e `longitude`.

#### Scenario: Abrir contrato
- **WHEN** um cliente abre um contrato indicando distrito, tipo de resíduo, frequência semanal e duração em meses
- **THEN** o contrato fica guardado com estado `pendente` e as referências ao cliente, distrito e tipo de resíduo
- **AND** os valores `taxa_adesao`, `valor_mensal` e `valor_total` são armazenados no contrato
- **AND** `rua`, `ponto_referencia` e as coordenadas `latitude`/`longitude` podem ser armazenadas de forma opcional

#### Scenario: Estado de contrato inválido
- **WHEN** é tentado guardar um contrato com estado fora dos quatro permitidos
- **THEN** o sistema rejeita o registo

#### Scenario: Contrato sem distrito ou tipo de resíduo
- **WHEN** é tentado guardar um contrato sem distrito ou sem tipo de resíduo associado
- **THEN** o sistema rejeita o registo

### Requirement: Parcelas de mensalidade
O sistema SHALL armazenar as parcelas mensais de cada contrato aprovado, cada uma referenciando o contrato, numerada (`numero_parcela`), com valor, data de vencimento e estado `pendente` ou `pago`. Quando uma parcela é paga, o sistema regista a `data_pagamento`, o utilizador que registou o pagamento (`registado_por_id`) e o número do recibo (`numero_recibo`).

#### Scenario: Criar parcelas de contrato
- **WHEN** um contrato aprovado gera as suas parcelas mensais
- **THEN** cada parcela fica guardada referenciando o contrato, com `numero_parcela`, valor, data de vencimento e estado `pendente`

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

## ADDED Requirements

### Requirement: Dias de recolha do contrato
O sistema SHALL armazenar os dias da semana (1-7) em que cada contrato tem recolha, de forma que os dias escolhidos estejam contidos na disponibilidade do distrito do contrato.

#### Scenario: Registar dias de recolha do contrato
- **WHEN** um contrato é associado a dias da semana escolhidos pelo cliente
- **THEN** os dias ficam guardados associados ao contrato
- **AND** cada dia fica contido nos dias disponíveis do distrito do contrato

#### Scenario: Dia fora da disponibilidade do distrito
- **WHEN** é tentado associar ao contrato um dia da semana que não está na disponibilidade do distrito
- **THEN** o sistema rejeita o registo
