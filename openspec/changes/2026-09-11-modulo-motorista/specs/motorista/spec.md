## ADDED Requirements

### Requirement: Consulta do próprio cronograma
O sistema SHALL permitir ao motorista autenticado consultar as recolhas de `agendamentos_recolha` que lhe estão atribuídas (`motorista_id` igual ao seu registo em `motoristas`), filtradas por intervalo de datas e ordenadas por `data_recolha` crescente, devolvendo o contrato associado (cliente, distrito e tipo de resíduo) e o respetivo estado.

#### Scenario: Consultar o cronograma de hoje
- **WHEN** um motorista autenticado consulta o cronograma sem indicar datas
- **THEN** o sistema devolve apenas as recolhas pendentes, concluídas ou canceladas atribuídas a esse motorista com `data_recolha` no dia de hoje
- **AND** cada recolha vem acompanhada do contrato (cliente, distrito e tipo de resíduo) e do seu estado

#### Scenario: Consultar o cronograma de um intervalo
- **WHEN** um motorista autenticado consulta o cronograma com `inicio` e `fim` (YYYY-MM-DD)
- **THEN** o sistema devolve as recolhas atribuídas a esse motorista com `data_recolha` dentro do intervalo
- **AND** as recolhas vêm ordenadas por `data_recolha` crescente

#### Scenario: Recolha de outro motorista fora do cronograma
- **WHEN** uma recolha está atribuída a outro motorista
- **THEN** essa recolha nunca aparece no cronograma do motorista autenticado

### Requirement: Concluir recolha pelo motorista
O sistema SHALL permitir ao motorista autenticado marcar como `concluido` uma recolha `pendente` que lhe esteja atribuída.

#### Scenario: Concluir recolha própria pendente
- **WHEN** um motorista autenticado marca uma recolha `pendente` sua como concluída
- **THEN** o estado da recolha passa a `concluido`

#### Scenario: Concluir recolha já concluída ou cancelada
- **WHEN** um motorista autenticado tenta marcar como concluída uma recolha que não está `pendente`
- **THEN** o sistema rejeita o pedido

#### Scenario: Concluir recolha de outro motorista
- **WHEN** um motorista autenticado tenta marcar como concluída uma recolha atribuída a outro motorista
- **THEN** o sistema rejeita o pedido sem revelar a existência da recolha

#### Scenario: Ação de concluir por não-motorista
- **WHEN** um utilizador sem perfil de motorista tenta concluir uma recolha
- **THEN** o sistema rejeita o pedido

### Requirement: Cancelar recolha pelo motorista
O sistema SHALL permitir ao motorista autenticado cancelar uma recolha `pendente` que lhe esteja atribuída, exigindo uma `observacao` que justifique o cancelamento.

#### Scenario: Cancelar recolha própria pendente com observação
- **WHEN** um motorista autenticado cancela uma recolha `pendente` sua, indicando o motivo
- **THEN** o estado da recolha passa a `cancelado`
- **AND** a observação do motivo fica guardada

#### Scenario: Cancelar recolha sem observação
- **WHEN** um motorista autenticado tenta cancelar uma recolha sem indicar o motivo
- **THEN** o sistema rejeita o pedido

#### Scenario: Cancelar recolha já concluída ou cancelada
- **WHEN** um motorista autenticado tenta cancelar uma recolha que não está `pendente`
- **THEN** o sistema rejeita o pedido

#### Scenario: Cancelar recolha de outro motorista
- **WHEN** um motorista autenticado tenta cancelar uma recolha atribuída a outro motorista
- **THEN** o sistema rejeita o pedido sem revelar a existência da recolha