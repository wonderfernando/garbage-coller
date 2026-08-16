## Context

O backend é um skeleton Laravel 13.8 em Fase 0. O `.env` está com `DB_CONNECTION=sqlite`; o `config/database.php` já inclui o bloco `mysql` por defeito do Laravel (host/porta/credenciais via `env()`, charset `utf8mb4`), pelo que a alteração é de configuração de ambiente, não de código. Os testes já forçam SQLite `:memory:` no `phpunit.xml` (`DB_CONNECTION=sqlite`, `DB_DATABASE=:memory:`, `DB_URL=`). O desenvolvimento usa o serviço MySQL do Laragon (`127.0.0.1:3306`, `root` sem senha). Ver proposal.md para a motivação.

## Goals / Non-Goals

**Goals:**
- Fazer o ambiente de dev local ligar ao MySQL com a base `elisal`.
- Manter a suite de testes em SQLite `:memory:`, sem dependência do MySQL.
- Fazer migrar para MySQL sessões, filas e cache, que usam a ligação default.
- Alterar só `.env` (e criar a base) — sem tocar em código PHP.

**Non-Goals:**
- Configurar produção/CI — fora de âmbito.
- Mudar o driver de testes.
- Migrar dados do SQLite existente (não há dados de domínio em Fase 0).

## Decisions

- **D1: Configurar ligação só via `.env`.** Definir `DB_CONNECTION=mysql` e descomentar/ajustar `DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_DATABASE=elisal`, `DB_USERNAME=root`, `DB_PASSWORD=`. *Alternativa considerada:* usar `DB_URL` (DSN único) — rejeitado por ser menos explícito e divergir do formato comentado já presente no `.env`.
- **D1b (durante a implementação): a porta 3306 estava ocupada pelo serviço Windows `MysqlKsoft` (MySQL 5.6.31, root/root), não pelo Laragon.** Com aprovação do utilizador: parado o serviço `MysqlKsoft` (elevação UAC) e iniciado o mysqld 8.4.3 do Laragon na porta 3306. O root do Laragon ficou confirmado sem senha, como assumido em D1.
- **D2: Criar a base `elisal` no MySQL do Laragon.** Via comando `mysql` (ex.: `CREATE DATABASE elisal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`) ou interface do Laragon. *Alternativa:* deixar o Laravel criar — não é suportado; a base tem de existir antes de `migrate`.
- **D3: Não alterar `config/database.php` nem `phpunit.xml`.** O bloco `mysql` e as overrides de teste já estão correctos.
- **D4: Limpar cache de configuração após a alteração.** Alterações ao `.env` não têm efeito enquanto houver `config` cacheado (`php artisan config:clear`).
- **D5: Correr `php artisan migrate` para criar na base `elisal` as tabelas de infraestrutura** (sessions, jobs, cache, etc.) que usam a ligação default. *Alternativa:* manter sessions/queue/cache noutra base — rejeitado por adicionar complexidade sem benefício em dev.

## Risks / Trade-offs

- [Serviço MySQL do Laragon desligado] → iniciar o serviço e confirmar antes de `migrate`; verificar com `php artisan db:show` (ou `mysql -e "SELECT 1"`).
- [Porta 3306 ocupada por outro MySQL (verificado: `MysqlKsoft` 5.6.31)] → parar o serviço conflitante (requer admin) e iniciar o mysqld do Laragon 8.4.3 na porta 3306. Se o `MysqlKsoft` voltar a arrancar no boot (Startup Type), repetir a paragem ou mudar o arranque para Manual.
- [Extensão `pdo_mysql` ausente no PHP usado pelo WSL] → confirmar com `php -m`; o PHP do Laragon (via `cmd.exe`) normalmente inclui `pdo_mysql`.
- [Laragon pode estar com MariaDB em vez de MySQL 8.0] → a especificação pede MySQL 8.0; MariaDB é compatível com a config actual, mas deve-se confirmar a versão com `SELECT VERSION()`.
- [Dados de sessão/cache SQLite anteriores ficam órfãos] → irrelevante em dev (Fase 0, sem dados de domínio); rollback trivial revertendo o `.env`.
- [`config:clear` esquecido deixa o app a usar a ligação antiga] → documentar a ordem no plano de implementação e nas tarefas.

## Migration Plan

1. Confirmar que o MySQL do Laragon está ativo (`127.0.0.1:3306`).
2. Criar a base `elisal` (charset `utf8mb4`, collation `utf8mb4_unicode_ci`).
3. Editar `.env`: `DB_CONNECTION=mysql` + vars `DB_*`.
4. `php artisan config:clear`; `php artisan migrate`.
5. `composer test` — confirmar que a suite continua a passar em SQLite.
6. **Rollback:** reverter o `.env` para `DB_CONNECTION=sqlite`, `php artisan config:clear`. (Não há dados a migrar.)

## Open Questions

- Nenhuma que afecte specs, abordagem ou tarefas. Se durante a implementação o serviço do Laragon for MariaDB, confirma-se a versão e regista-se no estado do projecto (AGENTS.md), sem mudar a abordagem.
