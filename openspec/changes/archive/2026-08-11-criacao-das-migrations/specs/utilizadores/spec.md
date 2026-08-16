## Purpose

Define a base de dados de utilizadores e motoristas da ELISAL-EP: a tabela de utilizadores com perfil de acesso (admin, cliente, motorista) e o registo de motoristas associados a utilizadores.

## ADDED Requirements

### Requirement: Utilizadores com perfil de acesso
O sistema SHALL armazenar utilizadores autenticáveis com um perfil de acesso que só pode ser `admin`, `cliente` ou `motorista`, e com tipo de cliente `particular` ou `empresa` (default `particular`). São ainda armazenados dados de contacto e identificação: `nif` (opcional), `telefone`.

#### Scenario: Registo de utilizador com perfil
- **WHEN** um utilizador é registado com nome, email, palavra-passe, perfil de acesso e tipo de cliente
- **THEN** os dados ficam guardados na tabela de utilizadores
- **AND** o perfil de acesso fica restringido a `admin`, `cliente` ou `motorista`
- **AND** o tipo de cliente fica restringido a `particular` ou `empresa`
- **AND** `nif`, `telefone` e `tipo_cliente` ficam disponíveis para registo de clientes

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
O sistema SHALL registar motoristas como extensões de utilizadores, de forma que cada motorista referencia um único utilizador com perfil de motorista e guarda o número da carta e a matrícula do veículo.

#### Scenario: Registar motorista
- **WHEN** um utilizador com perfil de motorista é associado a um registo de motorista com número da carta e matrícula do veículo
- **THEN** o registo de motorista fica guardado referenciando esse utilizador, com `numero_carta` e `veiculo_matricula`

#### Scenario: Motorista sem utilizador
- **WHEN** é tentado registar um motorista sem utilizador associado
- **THEN** o sistema rejeita o registo
