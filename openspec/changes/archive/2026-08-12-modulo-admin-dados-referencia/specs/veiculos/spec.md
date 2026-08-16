## MODIFIED Requirements

### Requirement: Veículos da frota
O sistema SHALL armazenar os veículos/camiões da frota, cada um com matrícula única e modelo opcional, podendo ou não ter um motorista alocado, e permitir ao administrador registar, consultar, atualizar e eliminar veículos, bloqueando a eliminação de veículos com motorista alocado.

#### Scenario: Registar veículo
- **WHEN** um veículo é registado com matrícula e, opcionalmente, modelo
- **THEN** o veículo fica guardado com a matrícula e o modelo

#### Scenario: Matrícula duplicada
- **WHEN** é tentado registar um segundo veículo com a mesma matrícula
- **THEN** o sistema rejeita o registo

#### Scenario: Atualizar veículo
- **WHEN** um administrador atualiza um veículo existente (matrícula, modelo ou motorista alocado)
- **THEN** os dados do veículo ficam atualizados

#### Scenario: Eliminar veículo sem motorista
- **WHEN** um administrador elimina um veículo que não tem motorista alocado
- **THEN** o veículo é removido da frota

#### Scenario: Eliminar veículo com motorista alocado
- **WHEN** um administrador tenta eliminar um veículo que tem motorista alocado
- **THEN** o sistema bloqueia a eliminação

### Requirement: Alocação de veículo a motorista
O sistema SHALL permitir associar um veículo a um motorista, ficando o veículo sem motorista quando não está alocado.

#### Scenario: Alocar veículo a motorista
- **WHEN** um administrador aloca um veículo a um motorista
- **THEN** o veículo passa a referenciar o motorista

#### Scenario: Desalocar veículo
- **WHEN** um administrador remove a alocação de um veículo a um motorista
- **THEN** o veículo fica sem motorista alocado

#### Scenario: Veículo sem motorista alocado
- **WHEN** um veículo é registado sem motorista
- **THEN** o veículo fica guardado sem motorista alocado
