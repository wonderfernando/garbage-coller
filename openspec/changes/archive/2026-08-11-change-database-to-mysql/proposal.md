## Why

O PRD define MySQL 8.0 como base de dados do sistema ELISAL-EP, mas o repositório está a correr em SQLite local (`.env` com `DB_CONNECTION=sqlite`). Alinhar o ambiente de desenvolvimento local com a stack planeada para que o comportamento real (transações, chaves estrangeiras, tipos de dados) seja o mesmo da produção.

## What Changes

- Definir `DB_CONNECTION=mysql` e as variáveis de ligação no `.env` local (`DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_DATABASE=elisal`, `DB_USERNAME=root`, `DB_PASSWORD=`), assumindo credenciais Laragon default.
- Criar a base de dados `elisal` no MySQL local (Laragon).
- Manter os testes (`phpunit.xml`) em SQLite `:memory:` — a suite não depende do MySQL.
- Sessões, filas e cache usam a ligação default, pelo que passam também a usar MySQL (já têm `SESSION_DRIVER=database`, `QUEUE_CONNECTION=database`, `CACHE_STORE=database`).
- Sem alteração ao `config/database.php` — o bloco `mysql` já existe por padrão do Laravel.
- **BREAKING**: qualquer `database.sqlite` preexistente deixa de ser usado em dev local (ficheiro permanece, mas inativo).

## Capabilities

### New Capabilities
- `database/mysql`: A aplicação liga-se a uma base MySQL 8.0 local com a base `elisal`, enquanto a suíte de testes continua a usar SQLite em memória.

### Modified Capabilities
<!-- Nenhuma — não existem specs prévias no repositório. -->

## Impact

- `.env` — descomentar/definir as variáveis `DB_*` (ficheiro já tem comentários com os valores).
- `phpunit.xml` — sem alteração (continua SQLite `:memory:`).
- `config/database.php` — sem alteração.
- Dependências/CLI — necessário ter o serviço MySQL do Laragon a correr; criação da base via `mysql` (ou alternativa) no passo de implementação.
- Documentação (`AGENTS.md`) — actualizar a tabela de estado (SQLite → MySQL em dev).
