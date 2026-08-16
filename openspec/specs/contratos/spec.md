## Purpose

Define a base de dados dos contratos de recolha da ELISAL-EP: contratos de cliente com distrito e tipo de resíduo, parcelas de mensalidade e agendamentos de recolha.

## Requirements

### Requirement: Contratos de recolha
O sistema SHALL armazenar contratos de recolha que ligam um cliente (utilizador com perfil de cliente), um distrito e um tipo de resíduo, com estado `pendente`, `aprovado`, `rejeitado` ou `cancelado`. O contrato guarda os parâmetros de precificação (`frequencia_semanal`, `duracao_meses`), os valores calculados (`taxa_adesao`, `valor_mensal`, `valor_total`), morada opcional (`rua`, `ponto_referencia`) e, opcionalmente, as coordenadas `latitude` e `longitude`.

#### Scenario: Abrir contrato
- **WHEN** um cliente autenticado abre um contrato indicando distrito, tipo de resíduo, dias da semana e duração em meses
- **THEN** o contrato fica guardado com estado `pendente` e as referências ao cliente, distrito e tipo de resíduo
- **AND** os valores `taxa_adesao`, `valor_mensal` e `valor_total` são calculados automaticamente a partir do tipo de resíduo e da frequência escolhida
- **AND** `rua`, `ponto_referencia` e as coordenadas `latitude`/`longitude` podem ser armazenadas de forma opcional

#### Scenario: Valores calculados pela regra de preços
- **WHEN** um contrato é aberto com uma determinada frequência semanal e duração em meses
- **THEN** `valor_mensal` é o número de recolhas por semana vezes 4 vezes o preço unitário do tipo de resíduo
- **AND** `valor_total` é a taxa de adesão somada ao `valor_mensal` vezes o número de meses
- **AND** os valores são arredondados a duas casas decimais

#### Scenario: Frequência derivada dos dias escolhidos
- **WHEN** um cliente escolhe os dias da semana do contrato
- **THEN** a `frequencia_semanal` é calculada como o número de dias escolhidos
- **AND** o cliente não fornece a frequência diretamente

#### Scenario: Abertura de contrato por não-cliente
- **WHEN** um utilizador sem perfil de cliente tenta abrir um contrato
- **THEN** o sistema rejeita a abertura
- **AND** um pedido sem sessão autenticada é rejeitado

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

### Requirement: Dias de recolha do contrato
O sistema SHALL armazenar os dias da semana (1-7) em que cada contrato tem recolha, de forma que os dias escolhidos estejam contidos na disponibilidade do distrito do contrato.

#### Scenario: Registar dias de recolha do contrato
- **WHEN** um contrato é associado a dias da semana escolhidos pelo cliente
- **THEN** os dias ficam guardados associados ao contrato
- **AND** cada dia fica contido nos dias disponíveis do distrito do contrato

#### Scenario: Dia fora da disponibilidade do distrito
- **WHEN** é tentado associar ao contrato um dia da semana que não está na disponibilidade do distrito
- **THEN** o sistema rejeita o registo

### Requirement: Consulta dos próprios contratos
O sistema SHALL permitir ao cliente autenticado consultar os seus próprios contratos (listagem e detalhe), devolvendo os dias da semana escolhidos, sem expor contratos de outros clientes.

#### Scenario: Listar os meus contratos
- **WHEN** um cliente autenticado consulta a lista de contratos
- **THEN** o sistema devolve apenas os contratos abertos por esse cliente

#### Scenario: Ver detalhe de um contrato próprio
- **WHEN** um cliente consulta o detalhe de um dos seus contratos
- **THEN** o sistema devolve o contrato com os dias da semana escolhidos

#### Scenario: Consultar contrato de outro cliente
- **WHEN** um cliente tenta consultar o detalhe de um contrato de outro cliente
- **THEN** o sistema rejeita o pedido, não expondo contratos alheios

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
