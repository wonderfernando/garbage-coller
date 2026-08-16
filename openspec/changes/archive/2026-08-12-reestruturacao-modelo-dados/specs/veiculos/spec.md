## Purpose

Define a frota de veículos/camiões da ELISAL-EP: o registo de veículos com matrícula e modelo e a alocação opcional a um motorista, mantendo o veículo separado da pessoa que o conduz (RF-ADM-07).

## ADDED Requirements

### Requirement: Veículos da frota
O sistema SHALL armazenar os veículos/camiões da frota, cada um com matrícula única e modelo opcional, podendo ou não ter um motorista alocado.

#### Scenario: Registar veículo
- **WHEN** um veículo é registado com matrícula e, opcionalmente, modelo
- **THEN** o veículo fica guardado com a matrícula e o modelo

#### Scenario: Matrícula duplicada
- **WHEN** é tentado registar um segundo veículo com a mesma matrícula
- **THEN** o sistema rejeita o registo

### Requirement: Alocação de veículo a motorista
O sistema SHALL permitir associar um veículo a um motorista, ficando o veículo sem motorista quando não está alocado.

#### Scenario: Alocar veículo a motorista
- **WHEN** um administrador aloca um veículo a um motorista
- **THEN** o veículo passa a referenciar o motorista

#### Scenario: Veículo sem motorista alocado
- **WHEN** um veículo é registado sem motorista
- **THEN** o veículo fica guardado sem motorista alocado
