## Purpose

Define a base de dados dos tipos de resíduos recolhidos pela ELISAL-EP, incluindo o preço unitário de recolha usado na precificação dos contratos.

## ADDED Requirements

### Requirement: Tipos de resíduos
O sistema SHALL armazenar os tipos de resíduos (ex.: doméstico, orgânico, reciclável), cada um com uma designação, uma descrição e um preço unitário de recolha.

#### Scenario: Registar tipo de resíduo
- **WHEN** um tipo de resíduo é registado com designação, descrição e preço unitário de recolha
- **THEN** os dados ficam guardados e o preço unitário fica disponível para cálculo de contratos

#### Scenario: Preço unitário negativo
- **WHEN** é tentado registar um tipo de resíduo com preço unitário negativo
- **THEN** o sistema rejeita o registo
