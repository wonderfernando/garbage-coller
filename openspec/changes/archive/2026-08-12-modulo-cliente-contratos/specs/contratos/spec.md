## MODIFIED Requirements

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

## ADDED Requirements

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
