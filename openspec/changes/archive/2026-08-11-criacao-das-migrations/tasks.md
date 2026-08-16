## 1. Renomear utilizadores

- [x] 1.1 Renomear a migração `0001_01_01_000000_create_users_table.php` para `create_utilizadores_table.php`, com tabela `utilizadores` e colunas: `nome`, `email` (único), `password`, `role` enum `admin|cliente|motorista` default `cliente`, `tipo_cliente` enum `particular|empresa` default `particular`, `nif` (nullable), `telefone`, `remember_token`, timestamps
- [x] 1.2 Atualizar `config/auth.php` — `password.table` passa a `utilizadores`
- [x] 1.3 Atualizar `App\Models\User` — `protected $table = 'utilizadores'`

## 2. Geografia e tipos de resíduos

- [x] 2.1 Criar migração `create_divisoes_geograficas_table`: `nivel` enum `provincia|municipio|distrito`, `nome`, `divisao_pai_id` (nullable unsignedBigInteger), timestamps; índice único `(nivel, divisao_pai_id, nome)`
- [x] 2.2 Adicionar FK `divisao_pai_id` → `divisoes_geograficas.id` em `Schema::table` separado (cascade)
- [x] 2.3 Criar migração `create_tipos_residuos_table`: `nome` (único), `descricao` text, `preco_unitario_recolha` decimal(10,2) unsigned, timestamps
- [x] 2.4 Criar migração `create_disponibilidade_distrito_table`: `distrito_id` FK → `divisoes_geograficas.id` (cascade), `dia_semana` unsignedTinyInteger com check 1-7; índice único `(distrito_id, dia_semana)`

## 3. Contratos e parcelas

- [x] 3.1 Criar migração `create_contratos_table`: `cliente_id` FK → `utilizadores.id` (cascade), `distrito_id` FK → `divisoes_geograficas.id` (restrict), `tipo_residuo_id` FK → `tipos_residuos.id` (restrict), `taxa_adesao`/`valor_mensal`/`valor_total` decimal(10,2) unsigned, `recolhas_por_semana` e `duracao_meses` unsignedSmallInteger (check > 0), `estado` enum `pendente|aprovado|rejeitado|cancelado` default `pendente`, `latitude` e `longitude` varchar nullable, timestamps
- [x] 3.2 Criar migração `create_parcelas_mensalidades_table`: `contrato_id` FK → `contratos.id` (cascade), `numero_parcela` unsignedInteger, `valor` decimal(10,2) unsigned, `data_vencimento` date, `estado` enum `pendente|pago` default `pendente`, `data_pagamento` date nullable, `data_due` date nullable, timestamps; índice único `(contrato_id, numero_parcela)`

## 4. Motoristas e agendamentos

- [x] 4.1 Criar migração `create_motoristas_table`: `utilizador_id` FK → `utilizadores.id` (cascade, único), `numero_carta`, `veiculo_matricula`, timestamps
- [x] 4.2 Criar migração `create_agendamentos_recolha_table`: `contrato_id` FK → `contratos.id` (cascade), `motorista_id` FK nullable → `motoristas.id` (set null), `data_recolha` datetime, `estado` enum `pendente|concluido|cancelado` default `pendente`, `observacao` text nullable, timestamps; índice em `(data_recolha, estado)`

## 5. Verificação

- [x] 5.1 Criar `tests/Feature/DatabaseSchemaTest.php` que corre as migrações em SQLite `:memory:` e valida a existência das tabelas `utilizadores`, `divisoes_geograficas`, `disponibilidade_distrito`, `tipos_residuos`, `contratos`, `parcelas_mensalidades`, `motoristas`, `agendamentos_recolha` e colunas-chave (`role`, `tipo_cliente`, `nivel`, `dia_semana`, `preco_unitario_recolha`, `descricao`, `taxa_adesao`, `valor_mensal`, `valor_total`, `numero_parcela`, `data_pagamento`, `numero_carta`, `veiculo_matricula`, `data_recolha`, `observacao`, `estado`)
- [x] 5.2 Correr `composer test` e confirmar que tudo passa
- [x] 5.3 Correr `php artisan migrate` e `php artisan migrate:rollback` na base local para confirmar ida e volta
