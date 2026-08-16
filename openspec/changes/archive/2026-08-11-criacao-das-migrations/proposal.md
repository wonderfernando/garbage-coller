## Why

O projeto está na Fase 0 (skeleton Laravel em branco, apenas com as migrações de série `users`, `cache` e `jobs`). A Fase 1 do PRD exige a base de dados de domínio: sem as tabelas de geografia, resíduos, contratos, parcelas e agendamentos não é possível construir autenticação, contratos ou o módulo do motorista. Este change cria todas as migrações de domínio e adapta a tabela de utilizadores ao modelo do PRD.

## What Changes

- Renomear a tabela de série `users` para `utilizadores` e acrescentar a coluna `role` (`admin`, `cliente`, `motorista`) e `tipo_cliente` (`particular|empresa`), além de `nif` (opcional) e `telefone`, seguindo o modelo de dados atualizado.
- Ajuste mínimo de suporte para o rename: provider de autenticação em `config/auth.php` passa a apontar para `utilizadores`.
- Criar a tabela `divisoes_geograficas` hierárquica (provincia, municipio, distrito, com `nivel` e parentesco) — dados de referência geográfica.
- Criar a tabela `disponibilidade_distrito` (FK `distrito_id`, `dia_semana` 1-7) — dias de recolha por distrito.
- Criar a tabela `tipos_residuos` (`nome`, `descricao`, `preco_unitario_recolha`) — tipos de resíduos e preço por recolha.
- Criar a tabela `contratos` (FK `cliente_id`, `distrito_id`, `tipo_residuo_id`; valores guardados `taxa_adesao`, `valor_mensal`, `valor_total`; `recolhas_por_semana`, `duracao_meses`; `estado`: pendente, aprovado, rejeitado, cancelado; `latitude`/`longitude` opcionais).
- Criar a tabela `parcelas_mensalidades` (FK `contrato_id`; `numero_parcela`, `valor`, `data_vencimento`, `data_pagamento`, `data_due`; `estado`: pendente, pago).
- Criar a tabela `motoristas` (FK `utilizador_id`; `numero_carta`, `veiculo_matricula`).
- Criar a tabela `agendamentos_recolha` (FK `contrato_id`, `motorista_id`; `data_recolha` datetime, `observacao`; `estado`: pendente, concluido, cancelado).
- Manter intactas as migrações de série `cache` e `jobs`.

## Capabilities

### New Capabilities
- `geografia`: divisões geográficas hierárquicas (provincia, municipio, distrito) e disponibilidade de recolha por distrito.
- `utilizadores`: tabela de utilizadores com `role` e motoristas associados.
- `tipos-residuos`: tipos de resíduos e preço unitário de recolha.
- `contratos`: contratos de recolha, parcelas de mensalidade e agendamentos de recolha.

### Modified Capabilities
<!-- Nenhuma capability existente — não há specs antes desta mudança. -->

## Impact

- `database/migrations/` — renomeada a migração `users` e criadas novas migrações de domínio.
- `config/auth.php` — provider `users` passa a usar a tabela `utilizadores`.
- `App\Models\User` — referência de tabela (se necessário, apenas o nome da tabela; sem novos models neste change).
- Sem novas dependências do Composer.
- Nenhuma API existente é afetada (não há rotas de domínio ainda).
