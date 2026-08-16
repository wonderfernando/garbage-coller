## Purpose

Define a base de dados de geografia da ELISAL-EP: províncias, municípios e distritos de recolha, e os dias da semana em que cada distrito tem recolha disponível.

## Requirements

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

### Requirement: Consulta de geografia hierárquica
O sistema SHALL permitir ao administrador consultar a hierarquia geográfica, listando as províncias com os respetivos municípios e distritos.

#### Scenario: Listar provincias com hierarquia
- **WHEN** um administrador consulta a geografia
- **THEN** o sistema devolve as províncias, cada uma com os seus municípios e distritos

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

### Requirement: Consulta pública de distritos com disponibilidade
O sistema SHALL disponibilizar a consulta dos distritos sem autenticação, indicando os dias da semana em que cada distrito tem recolha disponível, para o cliente escolher os dias do contrato.

#### Scenario: Consultar distritos com disponibilidade
- **WHEN** um visitante sem sessão consulta a lista de distritos
- **THEN** o sistema devolve cada distrito com os respetivos dias de recolha disponíveis
- **AND** a gestão da disponibilidade continua reservada a administradores
