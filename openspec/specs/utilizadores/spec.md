## Purpose

Define a base de dados de utilizadores e motoristas da ELISAL-EP: a tabela de utilizadores com perfil de acesso (admin, cliente, motorista) e o registo de motoristas associados a utilizadores.

## Requirements

### Requirement: Utilizadores com perfil de acesso
O sistema SHALL armazenar utilizadores autenticáveis com um perfil de acesso que só pode ser `admin`, `cliente` ou `motorista`, e com tipo de cliente `particular` ou `empresa` (default `particular`). São ainda armazenados dados de contacto e identificação: `nif` (opcional), `telefone` e `endereco_principal` (opcional, usado como morada de recolha do cliente).

#### Scenario: Registo de utilizador com perfil
- **WHEN** um utilizador é registado com nome, email, palavra-passe, perfil de acesso e tipo de cliente
- **THEN** os dados ficam guardados na tabela de utilizadores
- **AND** o perfil de acesso fica restringido a `admin`, `cliente` ou `motorista`
- **AND** o tipo de cliente fica restringido a `particular` ou `empresa`
- **AND** `nif`, `telefone`, `tipo_cliente` e `endereco_principal` ficam disponíveis para registo de clientes

#### Scenario: Perfil de acesso inválido
- **WHEN** é tentado guardar um utilizador com um perfil fora dos três permitidos
- **THEN** o sistema rejeita o registo

#### Scenario: Tipo de cliente inválido
- **WHEN** é tentado guardar um utilizador com um tipo de cliente fora de `particular` ou `empresa`
- **THEN** o sistema rejeita o registo

### Requirement: Email único de utilizador
O sistema SHALL garantir que o email de cada utilizador é único.

#### Scenario: Email duplicado
- **WHEN** é tentado registar um segundo utilizador com o mesmo email
- **THEN** o sistema rejeita o registo

### Requirement: Motoristas associados a utilizadores
O sistema SHALL registar motoristas como extensões de utilizadores, de forma que cada motorista referencia um único utilizador com perfil de motorista e guarda o número da carta. A matrícula do veículo é guardada no registo de veículos, não no motorista.

#### Scenario: Registar motorista
- **WHEN** um utilizador com perfil de motorista é associado a um registo de motorista com número da carta
- **THEN** o registo de motorista fica guardado referenciando esse utilizador, com `numero_carta`
- **AND** a matrícula do veículo, quando existir, fica guardada no registo de veículos

#### Scenario: Motorista sem utilizador
- **WHEN** é tentado registar um motorista sem utilizador associado
- **THEN** o sistema rejeita o registo

### Requirement: Consulta de motoristas
O sistema SHALL permitir ao administrador consultar a lista de motoristas registados.

#### Scenario: Listar motoristas
- **WHEN** um administrador consulta a lista de motoristas
- **THEN** o sistema devolve os motoristas registados com os dados de cada um
