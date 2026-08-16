## Purpose

Define a base de dados dos tipos de resíduos recolhidos pela ELISAL-EP, incluindo o preço unitário de recolha usado na precificação dos contratos.

## Requirements

### Requirement: Tipos de resíduos
O sistema SHALL armazenar os tipos de resíduos (ex.: doméstico, orgânico, reciclável), cada um com uma designação, uma descrição, um preço unitário de recolha e uma taxa de adesão base usada no cálculo dos contratos, e permitir ao administrador gerir esses registos (registar, consultar, atualizar e eliminar).

#### Scenario: Registar tipo de resíduo
- **WHEN** um tipo de resíduo é registado com designação, descrição, preço unitário de recolha e taxa de adesão
- **THEN** os dados ficam guardados e o preço unitário e a taxa de adesão ficam disponíveis para o cálculo de contratos

#### Scenario: Preço unitário negativo
- **WHEN** é tentado registar um tipo de resíduo com preço unitário negativo
- **THEN** o sistema rejeita o registo

#### Scenario: Taxa de adesão negativa
- **WHEN** é tentado registar um tipo de resíduo com taxa de adesão negativa
- **THEN** o sistema rejeita o registo

#### Scenario: Atualizar tipo de resíduo
- **WHEN** um administrador atualiza um tipo de resíduo existente
- **THEN** os dados do tipo de resíduo ficam atualizados

#### Scenario: Designação duplicada
- **WHEN** é tentado registar um tipo de resíduo com designação já existente
- **THEN** o sistema rejeita o registo

#### Scenario: Eliminar tipo de resíduo em uso
- **WHEN** um administrador tenta eliminar um tipo de resíduo referenciado por contratos
- **THEN** o sistema bloqueia a eliminação

### Requirement: Consulta pública de tipos de resíduos
O sistema SHALL disponibilizar a consulta dos tipos de resíduos sem autenticação, expondo o preço unitário de recolha e a taxa de adesão para a preparação de contratos, sem permitir escrita por utilizadores não-admin.

#### Scenario: Consultar tipos de resíduos publicamente
- **WHEN** um visitante sem sessão consulta a lista de tipos de resíduos
- **THEN** o sistema devolve os tipos de resíduos com preço unitário de recolha e taxa de adesão
- **AND** a escrita (registar, atualizar, eliminar) continua reservada a administradores
