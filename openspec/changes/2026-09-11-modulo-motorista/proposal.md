## Why

O admin consegue registar motoristas (Fase 2), atribuí-los a recolhas (Fase 5) e o fluxo de agendamentos já gera datas por contrato. No entanto, o motorista não tem área própria: não consegue ver o seu cronograma diário/semanal nem marcar as recolhas como concluídas ou canceladas. Sem isto, a operação no terreno não fecha o ciclo — o administrador seria o único a registar o estado das recolhas. Esta fase cria o módulo motorista do lado do operacional (PRD: "MOTORISTA — consulta cronograma diário/semanal, marca recolhas como concluídas/canceladas").

## What Changes

- **Área do motorista no backend** sob middleware `auth:sanctum` + `role:motorista`, com o motorista identificado a partir do utilizador autenticado (relação nova `User::motorista()`):
  - `GET /motorista/cronograma` — devolve as recolhas atribuídas ao motorista autenticado (`agendamentos_recolha.motorista_id` = id do seu registo de motorista), com filtro opcional `inicio`/`fim` (YYYY-MM-DD) e eager-load do contrato (cliente, distrito, tipo de resíduo). Sem filtro, assume o dia de hoje. Ordenado por `data_recolha` crescente. Recolhas de outros motoristas nunca aparecem.
  - `PATCH /motorista/agendamentos/{agendamento}/concluir` — só recolhas `pendente` do próprio motorista → estado `concluido`.
  - `PATCH /motorista/agendamentos/{agendamento}/cancelar` — só recolhas `pendente` do próprio motorista, com `observacao` obrigatória → estado `cancelado` (regra de negócio já existente no sistema).
  - 404 para recolhas inexistentes ou de outro motorista (não revela existência); 422 para ações sobre estados inválidos ou cancelamento sem observação.
- **Regras de negócio em serviços** (nunca no controller): `MotoristaCronogramaService` (consulta isolada por dono + range de datas), `ConcluirRecolhaService` e `CancelarRecolhaService` (validações de dono e estado).
- **Frontend**: novas rotas `/motorista` e `/motorista/cronograma` sob `RequireAuth` + `RequireRole role="motorista"`; novo `MotoristaLayout` (padrão do `ClientLayout`, identidade ELISAL-EP); página de visão geral (hoje) e página de cronograma com navegação de datas e toggle Dia/Semana; ações "Concluir" e "Cancelar" (diálogo com observação obrigatória no cancelamento), atualizando a lista sem recarregar.
- **API de frontend**: novo módulo `src/api/motorista.ts` (`cronograma`, `concluir`, `cancelar`); tipos reaproveitam `AgendamentoRecolha` existente.
- **Homologação do login**: o papel `motorista` passa a ter destino (`/motorista`) e área próprios — `roleHomePath` já contempla `/motorista`.

## Capabilities

### New Capabilities

- `motorista`: área operacional do motorista — consulta do próprio cronograma (diário/semanal) e registo de recolhas como concluídas/canceladas, com isolamento por dono e regras de estado obrigatórias.

### Modified Capabilities

_(nenhuma — os endpoints admin de atribuição/reagendamento mantêm-se intactos)_

## Impact

- **Código**: três serviços novos (`MotoristaCronogramaService`, `ConcluirRecolhaService`, `CancelarRecolhaService`) e um controller novo (`MotoristaController`) em `app/Http/Controllers/Api/`; registo `GET`/`PATCH` em `routes/api.php`; relação `User::motorista()` (hasOne) em `app/Models/User.php`.
- **Frontend**: `MotoristaLayout`, duas páginas (`CronogramaPage`, `DashboardPage`), `src/api/motorista.ts`, rotas novas em `App.tsx`.
- **API**: três endpoints novos sob `/motorista`, restritos a `role:motorista`.
- **Dependências/schema**: nenhuma migração nem dependência nova — `agendamentos_recolha.motorista_id` e o modelo `Motorista` já existem (Fase 1).
- **Testes**: testes Feature do módulo motorista (consulta isolada por dono, filtro de datas, concluir/cancelar com validações de estado e observação, RBAC, 404 para recolhas alheias).