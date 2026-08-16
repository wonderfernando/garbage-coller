## Purpose

Define a base de dados dos contratos de recolha da ELISAL-EP: contratos de cliente com distrito e tipo de resíduo, parcelas de mensalidade e agendamentos de recolha.

## ADDED Requirements

### Requirement: Contratos de recolha
O sistema SHALL armazenar contratos de recolha que ligam um cliente (utilizador com perfil de cliente), um distrito e um tipo de resíduo, com estado `pendente`, `aprovado`, `rejeitado` ou `cancelado`. O contrato guarda os parâmetros de precificação (`recolhas_por_semana`, `duracao_meses`), os valores calculados (`taxa_adesao`, `valor_mensal`, `valor_total`) e, opcionalmente, as coordenadas `latitude` e `longitude`.

#### Scenario: Abrir contrato
- **WHEN** um cliente abre um contrato indicando distrito, tipo de resíduo, recolhas por semana e duração em meses
- **THEN** o contrato fica guardado com estado `pendente` e as referências ao cliente, distrito e tipo de resíduo
- **AND** os valores `taxa_adesao`, `valor_mensal` e `valor_total` são armazenados no contrato
- **AND** as coordenadas `latitude` e `longitude` podem ser armazenadas de forma opcional

#### Scenario: Estado de contrato inválido
- **WHEN** é tentado guardar um contrato com estado fora dos quatro permitidos
- **THEN** o sistema rejeita o registo

#### Scenario: Contrato sem distrito ou tipo de resíduo
- **WHEN** é tentado guardar um contrato sem distrito ou sem tipo de resíduo associado
- **THEN** o sistema rejeita o registo

### Requirement: Parcelas de mensalidade
O sistema SHALL armazenar as parcelas mensais de cada contrato aprovado, cada uma referenciando o contrato, numerada (`numero_parcela`), com valor, data de vencimento e estado `pendente` ou `pago`. Quando uma parcela é paga, o sistema regista a `data_pagamento`.

#### Scenario: Criar parcelas de contrato
- **WHEN** um contrato aprovado gera as suas parcelas mensais
- **THEN** cada parcela fica guardada referenciando o contrato, com `numero_parcela`, valor, data de vencimento e estado `pendente`

#### Scenario: Registar pagamento de parcela
- **WHEN** uma parcela pendente é paga
- **THEN** o estado da parcela passa a `pago` e a `data_pagamento` fica registada

#### Scenario: Parcela sem contrato
- **WHEN** é tentado guardar uma parcela sem contrato associado
- **THEN** o sistema rejeita o registo

### Requirement: Agendamentos de recolha
O sistema SHALL armazenar agendamentos de recolha, cada um referenciando um contrato e opcionalmente um motorista, com data prevista (`data_recolha` datetime), estado `pendente`, `concluido` ou `cancelado` e observação opcional.

#### Scenario: Gerar agendamentos de contrato
- **WHEN** um contrato aprovado gera as datas de recolha pelos dias da semana escolhidos
- **THEN** cada agendamento fica guardado referenciando o contrato, com `data_recolha` (datetime) e estado `pendente`
- **AND** uma `observacao` pode ser guardada de forma opcional

#### Scenario: Associar motorista a agendamento
- **WHEN** um motorista é atribuído a um agendamento
- **THEN** o agendamento passa a referenciar o motorista

#### Scenario: Agendamento sem contrato
- **WHEN** é tentado guardar um agendamento sem contrato associado
- **THEN** o sistema rejeita o registo
