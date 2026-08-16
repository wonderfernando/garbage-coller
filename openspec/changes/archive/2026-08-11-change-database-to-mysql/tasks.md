## 1. Pré-requisitos e criação da base

- [x] 1.1 Confirmar que o MySQL do Laragon está ativo em `127.0.0.1:3306` e que o PHP (Laragon, via `cmd.exe`) inclui `pdo_mysql` (`php -m`)
- [x] 1.2 Confirmar a versão do servidor com `SELECT VERSION()` (expectável MySQL 8.x; registar se for MariaDB)
- [x] 1.3 Criar a base `elisal` com charset `utf8mb4` e collation `utf8mb4_unicode_ci`

## 2. Configuração do ambiente

- [x] 2.1 Editar `.env`: definir `DB_CONNECTION=mysql` e as variáveis `DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_DATABASE=elisal`, `DB_USERNAME=root`, `DB_PASSWORD=`
- [x] 2.2 Correr `php artisan config:clear` e confirmar com `php artisan config:show` (ou `php artisan about`) que a ligação default é `mysql`/`elisal`

## 3. Migrações e verificação

- [x] 3.1 Correr `php artisan migrate` e confirmar que as tabelas de infraestrutura (sessions, jobs, cache, migrations) são criadas na base `elisal`
- [x] 3.2 Correr `composer test` e confirmar que a suite continua a passar em SQLite `:memory:` sem depender do MySQL
- [x] 3.3 Atualizar o estado do projeto em `AGENTS.md` (linha da Base de dados: SQLite local → MySQL `elisal` em dev, SQLite `:memory:` nos testes)
