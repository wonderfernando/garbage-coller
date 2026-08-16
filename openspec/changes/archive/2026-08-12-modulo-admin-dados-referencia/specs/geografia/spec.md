## ADDED Requirements

### Requirement: Consulta de geografia hierárquica
O sistema SHALL permitir ao administrador consultar a hierarquia geográfica, listando as províncias com os respetivos municípios e distritos.

#### Scenario: Listar províncias com hierarquia
- **WHEN** um administrador consulta a geografia
- **THEN** o sistema devolve as províncias, cada uma com os seus municípios e distritos

## MODIFIED Requirements

### Requirement: Disponibilidade de recolha por distrito
O sistema SHALL guardar os dias da semana (1-7) em que cada distrito tem recolha de resíduos disponível, referenciando a tabela de distritos, e permitir ao administrador adicionar ou remover um dia individualmente.

#### Scenario: Registar dias de recolha
- **WHEN** um distrito é associado a um dia da semana entre 1 (segunda) e 7 (domingo)
- **THEN** a associação fica guardada na disponibilidade do distrito

#### Scenario: Adicionar dia já existente
- **WHEN** é tentado adicionar a um distrito um dia da semana que já está na disponibilidade
- **THEN** o sistema rejeita o registo

#### Scenario: Dia da semana inválido
- **WHEN** é tentado registar um dia da semana fora do intervalo 1-7
- **THEN** o sistema rejeita o registo

#### Scenario: Remover dia de recolha
- **WHEN** um administrador remove um dia da semana da disponibilidade de um distrito
- **THEN** o dia deixa de estar disponível para esse distrito
