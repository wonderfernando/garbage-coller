## Purpose

Define a base de dados de geografia da ELISAL-EP: províncias, municípios e distritos de recolha, e os dias da semana em que cada distrito tem recolha disponível.

## ADDED Requirements

### Requirement: Divisões geográficas hierárquicas
O sistema SHALL armazenar as divisões geográficas — provincia, municipio e distrito — como registos hierárquicos, em que um distrito pertence a um municipio e um municipio pertence a uma provincia.

#### Scenario: Criar hierarquia de divisões geográficas
- **WHEN** uma provincia, um municipio e um distrito são registados
- **THEN** os registos ficam guardados com os respetivos níveis e relações de parentesco
- **AND** cada distrito referencia obrigatoriamente o seu municipio e cada municipio referencia a sua provincia

### Requirement: Nomes únicos por divisão
O sistema SHALL impedir divisões geográficas duplicadas dentro do mesmo nível de parentesco, garantindo unicidade do nome da provincia, do municipio dentro da provincia e do distrito dentro do municipio.

#### Scenario: Duplicar provincia
- **WHEN** é tentado registar uma provincia com nome já existente
- **THEN** o sistema rejeita o registo duplicado

### Requirement: Disponibilidade de recolha por distrito
O sistema SHALL guardar os dias da semana (1-7) em que cada distrito tem recolha de resíduos disponível, referenciando o distrito.

#### Scenario: Registar dias de recolha
- **WHEN** um distrito é associado a um dia da semana entre 1 (segunda) e 7 (domingo)
- **THEN** a associação fica guardada na disponibilidade do distrito

#### Scenario: Dia da semana inválido
- **WHEN** é tentado registar um dia da semana fora do intervalo 1-7
- **THEN** o sistema rejeita o registo
