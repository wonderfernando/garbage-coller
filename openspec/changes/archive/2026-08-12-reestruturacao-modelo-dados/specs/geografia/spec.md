## MODIFIED Requirements

### Requirement: Divisões geográficas hierárquicas
O sistema SHALL armazenar as divisões geográficas em tabelas dedicadas — `provincias`, `municipios` e `distritos` — com relações de parentesco explícitas, em que cada municipio referencia a sua provincia e cada distrito referencia o seu municipio.

#### Scenario: Criar hierarquia de divisões geográficas
- **WHEN** uma provincia, um municipio e um distrito são registados
- **THEN** os registos ficam guardados nas respetivas tabelas
- **AND** cada distrito referencia obrigatoriamente o seu municipio e cada municipio referencia a sua provincia

### Requirement: Nomes únicos por divisão
O sistema SHALL impedir divisões geográficas duplicadas, garantindo unicidade do nome da provincia, do nome do municipio dentro da provincia e do nome do distrito dentro do municipio.

#### Scenario: Duplicar provincia
- **WHEN** é tentado registar uma provincia com nome já existente
- **THEN** o sistema rejeita o registo duplicado

#### Scenario: Duplicar municipio na mesma provincia
- **WHEN** é tentado registar um municipio com nome já existente na mesma provincia
- **THEN** o sistema rejeita o registo duplicado

### Requirement: Disponibilidade de recolha por distrito
O sistema SHALL guardar os dias da semana (1-7) em que cada distrito tem recolha de resíduos disponível, referenciando a tabela de distritos.

#### Scenario: Registar dias de recolha
- **WHEN** um distrito é associado a um dia da semana entre 1 (segunda) e 7 (domingo)
- **THEN** a associação fica guardada na disponibilidade do distrito

#### Scenario: Dia da semana inválido
- **WHEN** é tentado registar um dia da semana fora do intervalo 1-7
- **THEN** o sistema rejeita o registo
