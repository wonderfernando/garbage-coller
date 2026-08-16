## Purpose

Define a base de dados MySQL 8.0 como o armazenamento do ambiente de desenvolvimento local do sistema ELISAL-EP, mantendo a suíte de testes independente do MySQL.

## Requirements

### Requirement: Ligação MySQL no ambiente de desenvolvimento local
O sistema SHALL ligar-se a uma base de dados MySQL 8.0 chamada `elisal` no ambiente de desenvolvimento local, usando as credenciais definidas nas variáveis de ambiente.

#### Scenario: Executar migrações em desenvolvimento local
- **WHEN** `php artisan migrate` é executado no ambiente de desenvolvimento local
- **THEN** a ligação é feita à base MySQL `elisal` e as tabelas são criadas nessa base

#### Scenario: Sessões, filas e cache persistidas em MySQL
- **WHEN** a aplicação corre em desenvolvimento local
- **THEN** sessões, trabalhos de fila e cache são persistidos na base MySQL `elisal`

### Requirement: Suite de testes independente do MySQL
A suíte de testes automatizados SHALL executar contra uma base SQLite em memória, sem depender da existência de um serviço MySQL ou da base `elisal`.

#### Scenario: Executar a suíte de testes
- **WHEN** `composer test` é executado
- **THEN** os testes correm contra SQLite `:memory:` sem exigir que o MySQL esteja ativo

### Requirement: Configuração da base via variáveis de ambiente
A configuração da base de dados SHALL ser lida de variáveis de ambiente (`.env`), sem valores da ligação hardcoded no código.

#### Scenario: Alterar credenciais sem tocar no código
- **WHEN** as variáveis `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME` ou `DB_PASSWORD` são alteradas no `.env`
- **THEN** a aplicação usa os novos valores na ligação MySQL sem qualquer alteração ao código
