## Context

O repositório está na Fase 0: skeleton Laravel 13.8 em branco, com apenas as três migrações de série (`users`, `cache`, `jobs`), base local SQLite e testes em SQLite `:memory:`. Não existem migrações de domínio, models nem rotas. Motivação em `proposal.md` — Why.

Como nada foi implementado nem feito deploy, as migrações de série podem ser alteradas em segurança; não há dados nem produção a preservar.

## Goals / Non-Goals

**Goals:**
- Esquema de domínio completo via `Schema Builder` do Laravel, sem dependências externas novas.
- Migrações ordenadas e com chaves estrangeiras declaradas ao nível da base de dados.
- Renomear `users` → `utilizadores` com coluna `role`, sem quebrar a autenticação do framework.
- Migrações que passam em SQLite local e em memória nos testes.

**Non-Goals:**
- Eloquent models e relationships (ficam para a Fase 1-modelos / Fases seguintes).
- Sanctum, rotas de API, seeder de dados de referência (províncias/municípios reais).
- Lógica de negócio (precificação, geração de parcelas/agendamentos).
- Base de dados MySQL em produção — apenas garantir que as migrações são portáveis.

## Decisions

### D1 — Renomear a migração de série `users` em vez de criar uma migração de rename
Edita-se `0001_01_01_000000_create_users_table.php` → renomeada para `create_utilizadores_table` com a tabela `utilizadores` e a coluna `role` (enum `admin|cliente|motorista`, default `cliente`). O provider de autenticação em `config/auth.php` (`password.table`) passa a `utilizadores`, e `App\Models\User` passa a apontar `$table = 'utilizadores'`.

- Alternativa considerada: nova migração `rename users -> utilizadores`. Descartada: como o repositório está na Fase 0, sem dados nem deploys, editar a migração original mantém o histórico limpo sem migrações de "correção".
- Risco: perigoso num projeto já em produção — aqui não é o caso.

### D2 — Uma única tabela auto-referenciada para as divisões geográficas
`divisoes_geograficas` com colunas `nivel` (enum `provincia|municipio|distrito`), `nome` e `divisao_pai_id` (FK nula para si própria). Um municipio tem `divisao_pai_id` = provincia; um distrito tem `divisao_pai_id` = municipio; uma provincia tem pai nulo. A FK é adicionada num segundo `Schema::table` após a criação, para máxima compatibilidade SQLite/MySQL.

- Alternativa considerada: três tabelas separadas (provincias, municipios, distritos). Descartada: menos flexível e mais tabelas para o mesmo dado; a tabela única com nível é 3FN-compatível e facilita a API de distritos.
- Unicidade: índice único composto `(nivel, divisao_pai_id, nome)` — nomes únicos dentro do mesmo nível/pai.

### D3 — Enums como colunas `enum` da base de dados
`role`, `tipo_cliente` (`particular|empresa`), `estado` (contratos/parcelas/agendamentos) e `nivel` usam `$table->enum(...)` com default. O MySQL valida ao nível da BD; o SQLite trata `enum` como texto sem check — a validação estrita fica para a camada de aplicação nas fases seguintes (não há controllers agora).

### D4 — Valores monetários em `decimal(10, 2)`
`preco_unitario_recolha` (tipos_residuos), `taxa_adesao`, `valor_mensal`, `valor_total` (contratos) e `valor` (parcelas) como `decimal(10, 2)`, unsigned, moeda AOA com 2 casas. `recolhas_por_semana` e `duracao_meses` como `unsignedSmallInteger` com check `> 0` (parametrizam o `ContratoPricingService` na Fase 5, mas são guardados já no contrato). `latitude` e `longitude` como `varchar` nullable.

### D5 — Chaves estrangeiras com `constrained()` e ações on-delete
- `contratos.cliente_id` → `utilizadores.id` (cascade); `contratos.distrito_id` → `divisoes_geograficas.id` (restrict); `contratos.tipo_residuo_id` → `tipos_residuos.id` (restrict).
- `disponibilidade_distrito.distrito_id` → `divisoes_geograficas.id` (cascade), índice único `(distrito_id, dia_semana)`.
- `parcelas_mensalidades.contrato_id` → `contratos.id` (cascade), índice único `(contrato_id, numero_parcela)`.
- `motoristas.utilizador_id` → `utilizadores.id` (cascade), único.
- `agendamentos_recolha.contrato_id` → `contratos.id` (cascade); `motorista_id` → `motoristas.id` (set null), nullable.

### D7 — Preços denormalizados no contrato
Os valores calculados `taxa_adesao`, `valor_mensal` e `valor_total` são persistidos no próprio contrato no momento da aprovação (Fase 5), em vez de apenas serem calculados a pedido. Motivo: imutabilidade do histórico financeiro — se o preço unitário de um tipo de resíduo mudar depois, as faturas/parcelas continuam a refletir o valor acordado no contrato. `recolhas_por_semana` e `duracao_meses` ficam no contrato como os parâmetros que alimentam o cálculo.

- Alternativa considerada: calcular tudo on-the-fly a partir de `tipos_residuos.preco_unitario_recolha`. Descartada: qualquer alteração de preço depois da abertura do contrato alteraria retroativamente o histórico.

### D6 — Ordem de criação determinística
Ordem das migrações: `utilizadores` → `divisoes_geograficas` → `tipos_residuos` → `disponibilidade_distrito` → `contratos` → `parcelas_mensalidades` → `motoristas` → `agendamentos_recolha`, com os prefixos de data a garantir a ordem (agendamentos e motoristas podem referenciar contratos; contratos referenciam utilizadores/divisões/tipos).

## Risks / Trade-offs

- [Edição da migração `users` de série] → Seguro porque Fase 0 sem dados/deploys; documentado em D1. Se um dia houver dados reais, usar uma migração de rename.
- [SQLite não valida `enum`] → Validação estrita na camada de aplicação nas fases seguintes; testes de BD limitados ao schema.
- [Self-FK `divisao_pai_id` pode não ser suportada inline em alguns motores] → FK adicionada em `Schema::table` separado (D2).
- [`role` como nome de coluna pode colidir com palavras reservadas de alguns SGBDs] → Aceite em MySQL 8 e SQLite 3; sem necessidade de aspas.
- [DBML propõe `divisoes_geograficas` flat (colunas provincia/municipio/distrito)] → Rejeitado a favor do modelo hierárquico auto-referenciado (D2), por decisão do utilizador; o modelo flat é denormalizado e repete nomes.

## Migration Plan

- `composer test` — corre as migrações em SQLite `:memory:`; o teste `DatabaseSchemaTest` valida a existência das tabelas e colunas-chave.
- `php artisan migrate` — aplica as migrações na base local.
- Rollback: `php artisan migrate:rollback` reverte por batches; seguro porque não há dados.

## Open Questions

Nenhuma — as decisões que poderiam mudar specs, abordagem ou tarefas já foram resolvidas com o utilizador: rename de `users`, âmbito migrations-only, `recolhas_por_semana` mantido em `contratos`, geografia hierárquica (não flat) e `tipo_cliente` enum `particular|empresa`.
