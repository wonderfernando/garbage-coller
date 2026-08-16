## Context

Modelo atual em MySQL dev (`elisal`) e SQLite de testes: geografia numa tabela única hierárquica `divisoes_geograficas`, `motoristas.veiculo_matricula`, `contratos.recolhas_por_semana`, sem dias de recolha por contrato, sem `taxa_adesao` em `tipos_residuos`, sem veículos e sem rastreio de pagamentos. Regras a suportar: RF-CLI-01 (endereço principal), RF-ADM-03/04 (taxa de adesão e preço por tipo de resíduo), RF-ADM-07 (veículo separado do motorista), RF-MOT-02 (observação obrigatória em cancelamento). Motivação completa em proposal.md — Why; requisitos em specs/ (deltas).

## Goals / Non-Goals

**Goals:**
- Reestruturar o schema para tabelas dedicadas de geografia, dias de recolha por contrato, veículos e rastreio de pagamentos.
- Migrar os dados existentes (hierarquia geográfica e matrículas) sem perda, quando houver dados.
- Manter a suíte de testes em SQLite `:memory:` verde após a reestruturação.

**Non-Goals:**
- Endpoints/controllers novos (as tabelas servem fases futuras; nesta fase só o necessário para a modelagem).
- Mudança de regras de precificação para além do renome de `recolhas_por_semana` → `frequencia_semanal`.
- Seed de dados de geografia/veículos.

## Decisions

- **D1: Geografia em três tabelas dedicadas (`provincias`, `municipios`, `distritos`) em vez de tabela única genérica.** FKs explícitas (`municipios.provincia_id`, `distritos.municipio_id`) tornam a integridade referencial nativa e as queries de validação mais simples. *Alternativa:* manter `divisoes_geograficas` — rejeitada porque o PRD e as fases seguintes exigem distritos com FKs limpas e unicidade por nível.
- **D2: `taxa_adesao` como coluna de `tipos_residuos` (RF-ADM-04), com snapshot no contrato.** O contrato copia o valor no momento da criação (como já faz com os valores calculados); alterações futuras ao tipo de resíduo não alteram contratos já abertos.
- **D3: `contrato_dias_semana` como tabela própria (1:N), validada contra `disponibilidade_distrito`.** Registo relacional normalizado (3FN) em vez de coluna JSON; a validação (dias ⊆ disponibilidade) vive em serviço, nunca no controller.
- **D4: `veiculos` separada de `motoristas` (RF-ADM-07).** `motorista_id` nullable; a matrícula move-se de `motoristas.veiculo_matricula` para `veiculos.matricula`. *Alternativa:* manter matrícula no motorista — rejeitada porque um camião pode ficar sem motorista e um motorista pode trocar de veículo.
- **D5: Renome `recolhas_por_semana` → `frequencia_semanal`.** Mantém o mesmo significado; evita duplicação semântica com os dias de recolha (`contrato_dias_semana`).
- **D6: Fator do cálculo mensal = 4 (semanas/mês).** `valor_mensal = preco_unitario_recolha × frequencia_semanal × 4`, consistente com AGENTS.md (`RecolhasPorSemana × 4 × PrecoUnitarioResiduo`). O modelo do utilizador indicava `× fator`; o fator assume o valor já documentado no projeto.
- **D7: Rastreio de pagamentos com `registado_por_id` (FK para `utilizadores`, nullable) e `numero_recibo`.** Permite auditoria (quem registou) e número de recibo para faturação (Fase 6).
- **D8: `agendamentos_recolha.motorista_id` nullable (como já é); observação obrigatória quando `estado = cancelado` (RF-MOT-02).** Regra de negócio em serviço/validação, mensagem em português.
- **D9: Migração destrutiva em fases, com backfill.** Criar novas tabelas e colunas; copiar dados de `divisoes_geograficas` e `motoristas.veiculo_matricula`; só depois remover `divisoes_geograficas` e `veiculo_matricula`. Rollback = `migrate:rollback` até à migração anterior; testes em SQLite `:memory:` garantem fresh install.

## Risks / Trade-offs

- [Enum rígido no MySQL dificulta alterações futuras de `role`/`estado`] → sem mudança de enums nesta fase; se necessário, migração dedicada com `ALTER TABLE ... MODIFY`.
- [Remoção de `divisoes_geograficas` com dados reais em dev] → backfill em duas etapas (copiar → apagar); se a base de dev estiver vazia, a migração limpa apenas remove a tabela.
- [Renome de coluna pode partir código existente (`recolhas_por_semana`)] → pesquisa de usos no código (modelos/rotas/testes) na fase de apply; testes Feature atualizados.
- [Validação dias ⊆ disponibilidade duplicada na criação de contrato] → centralizada em serviço (`ContratoService`/`UserCreationService` não; serviço de contratos na fase seguinte); teste de validação dedicado.
- [Matrícula passou a viver noutra tabela — scripts/controllers antigos podem referenciá-la] → atualização do `UserCreationService`/controllers de motorista e testes correspondentes.
- [Backfill de matrícula para `veiculos` exige decisão de modelo opcional] → modelo fica `null` quando a matrícula antiga é movida; motorista pode depois ser alocado ao veículo.

## Migration Plan

1. Criar migrações: `provincias`, `municipios`, `distritos`, `contrato_dias_semana`, `veiculos`; `ALTER` em `utilizadores` (+`endereco_principal`), `tipos_residuos` (+`taxa_adesao`), `contratos` (rename +`rua`+`ponto_referencia` + FK distritos), `parcelas_mensalidades` (+`registado_por_id`+`numero_recibo`), `motoristas` (−`veiculo_matricula`), `agendamentos_recolha` (FK motoristas nullable).
2. Backfill: hierarquia `divisoes_geograficas` → 3 tabelas; `motoristas.veiculo_matricula` → `veiculos` (modelo `null`).
3. Remover `divisoes_geograficas` e `motoristas.veiculo_matricula`.
4. Atualizar modelos, `DatabaseSchemaTest`, `UserCreationService`/controllers e testes.
5. `php artisan migrate` em MySQL dev; `composer test` (SQLite `:memory:`); `pint`.
6. **Rollback:** `migrate:rollback` reverte tudo até ao estado anterior (migrações `down` implementadas); dados backfilled perdem-se nesse rollback (aceite em dev).

## Open Questions

- Nenhuma — decisões registadas em D1–D9 (incluindo o fator 4 do cálculo mensal e a manutenção do enum `tipo_cliente`).
