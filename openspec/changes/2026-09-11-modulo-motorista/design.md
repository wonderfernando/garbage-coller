## Context

O RBAC (`RoleMiddleware`, alias `role`) já cobre `motorista` e o `User` guarda `role`. Os agendamentos estão em `agendamentos_recolha` com `motorista_id` (id do registo `motoristas`), atribuição feita pelo admin (`AtribuirMotoristaService`). O `User` **não tem** relação `motorista()` — é a única adição de modelo necessária. O modelo `AgendamentoRecolha` já tem `motorista()`, `contrato()` e o contrato tem `cliente()`, `distrito()` e `tipoResiduo()`. No frontend, `roleHomePath('motorista')` já aponta `/motorista`, mas não existe rota nem layout. Não há alterações de schema — apenas código, rotas e testes. Ver `proposal.md` para o "why".

## Goals / Non-Goals

**Goals:**
- Área operacional do motorista autenticado: cronograma diário/semanal das recolhas atribuídas a ele, com ações Concluir/Cancelar.
- Isolamento estrito por dono no backend: o motorista só vê e só altera as próprias recolhas (404 para as dos outros).
- Regras de estado e de observação obrigatória no cancelamento aplicadas em serviços, fora do controller.
- Frontend no padrão existente (`MotoristaLayout` análogo ao `ClientLayout`).

**Non-Goals:**
- Atribuição/reagendamento de recolhas (continua só de admin, Fases 5).
- Estatísticas globais, mapas e acompanhamento (Fase 8).
- Veículo do motorista na listagem (fora do PRD desta fase; `veiculos.motorista_id` já existe mas não é consumido aqui).
- Geração/edição de agendamentos pelo motorista.
- Alterações de schema, seeders ou novas dependências.

## Decisions

### D1 — Identidade do motorista pelo utilizador autenticado
- Nova relação `User::motorista(): HasOne` (FK `motoristas.utilizador_id`) em `app/Models/User.php`.
- Nos controllers do motorista, `$motorista = $request->user()->motorista`; se `null` (papel motorista sem registo `motoristas`), lançar 404/401 — estado inconsistente pode acontecer se a BD for manipulada fora do `UserCreationService`.
- **Rationale**: nada no token/na BD liga o agendamento diretamente ao utilizador; a ponte é `utilizadores → motoristas → agendamentos_recolha.motorista_id`.
- **Alternativa**: resolver pelo `email`/nome — frágil; rejeitada.

### D2 — Consulta do cronograma (`GET /motorista/cronograma`)
- `MotoristaCronogramaService::consultar(Motorista $m, ?string $inicio, ?string $fim)`:
  - Datas validadas (formato `Y-m-d`); `inicio <= fim`; intervalo máximo de 31 dias (senão 422 em português).
  - Sem parâmetros → assume `inicio = fim = hoje`.
  - Query: `AgendamentoRecolha::where('motorista_id', $m->id)` + `whereBetween('data_recolha', [$inicio.' 00:00:00', $fim.' 23:59:59'])`, eager-load `contrato.cliente`, `contrato.distrito.municipio.provincia`, `contrato.tipoResiduo`, `motorista.utilizador`; `orderBy('data_recolha')`.
  - Resposta: array de `AgendamentoRecolha` (o contracto expõe as mesmas relações que o admin).
- **Rationale**: o filtro `motorista_id` no query base garante o isolamento no backend; o range é derivado pelo frontend do toggle Dia/Semana (um ou sete dias).
- **Alternativa**: escopar por `whereHas('motorista.utilizador_id', $user->id)` — equivalente; rejeitada por legibilidade.

### D3 — Concluir e cancelar recolha
- `ConcluirRecolhaService::concluir(Motorista $m, AgendamentoRecolha $a)` e `CancelarRecolhaService::cancelar(Motorista $m, AgendamentoRecolha $a, string $observacao)`.
- Ambos validam na mesma ordem, lançando `ValidationException`:
  1. `$a->motorista_id === $m->id` senão **404** (recolha alheia/inexistente; o controller devolve `NotFoundHttpException`).
  2. `estado === 'pendente'` senão 422 ("Apenas recolhas pendentes podem ser concluídas/canceladas.").
- `cancelar` exige `observacao` não vazia (trim) → 422 se ausente/vazia; guarda `observacao` e `estado = 'cancelado'`.
- `concluir` grava `estado = 'concluido'` (sem observação obrigatória).
- **Rationale**: regra de estado duplicada entre serviços é intencional (dois verbos de negócio distintos, cada um com a sua mensagem); é a mesma lógica já usada em `AtribuirMotoristaService`/`AnularContratoService`.
- **Alternativa**: um serviço com método paramétrico — rejeitada para manter paralelismo com os serviços "um por ação" do projeto.

### D4 — Controller e rotas
- `MotoristaController` com `cronograma()`, `concluir(AgendamentoRecolha $agendamento)`, `cancelar(AgendamentoRecolha $agendamento)`; o `$agendamento` entra via route-model binding.
- Validação de input (`inicio`, `fim`, `observacao`) feita no controller (regra de formato/obrigatoriedade); regras de negócio nos serviços.
- Rotas em grupo `['auth:sanctum', 'role:motorista']`:
  - `GET /motorista/cronograma`
  - `PATCH /motorista/agendamentos/{agendamento}/concluir`
  - `PATCH /motorista/agendamentos/{agendamento}/cancelar`
- **Rationale**: `role:motorista` no middleware garante RBAC no backend; o controller delegua toda a lógica aos serviços (convenção AGENTS.md).
- **Alternativa**: debaixo de `/administracao` — rejeitada (separação de áreas por papel).

### D5 — Frontend
- `src/api/motorista.ts`: `cronograma(inicio?, fim?)`, `concluir(id)`, `cancelar(id, observacao)` via `api` (token já injetado por `setAuthToken`).
- `MotoristaLayout` clonado do `ClientLayout` (identidade ELISAL-EP, verdes) com nav: `/motorista` (Visão geral) e `/motorista/cronograma` (Cronograma).
- `DashboardPage` (`/motorista`): contagens do dia (pendentes/concluídas/canceladas) e lista das recolhas de hoje.
- `CronogramaPage` (`/motorista/cronograma`): toggle Dia/Semana, navegação `‹ ›` de datas, lista com cliente/distrito/rua/hora/estado, botões Concluir (confirmação simples) e Cancelar (diálogo com observação obrigatória); após ação, re-carrega a lista.
- Rotas em `App.tsx` sob `RequireAuth` + `RequireRole role="motorista"`.
- **Rationale**: mesmo padrão de layouts/páginas do cliente e admin; a observação obrigatória no cancelamento é validada no frontend e no backend.
- **Alternativa**: uma única página com abas — rejeitada por clareza e alinhamento com a estrutura existente.

## Risks / Trade-offs

- [Motorista sem registo em `motoristas`] → tratado como 404; a criação passa sempre por `UserCreationService::createMotorista`, que cria o par user+motorista em transação.
- [Data futura/passada sem autorização: o motorista só pode agir sobre `pendente`, independentemente da data] → délibéré: a confirmação de conclusão/cancelamento é do registo, não de janelas temporais (não há regra de tempo definida; fica como questão aberta).
- [Concluir permite observação? Não é obrigatória] → comportamento assumido (mensagem opcional pode ser adicionada depois sem mudar specs/arquitetura).
- [Intervalo máximo de datas arbitrário (31 dias)] → suficiente para a vista semanal; não afeta o comportamento do Dia.

## Migration Plan

Sem migrações nem transformação de dados. Rollback: remover rotas/controller/services novos, a relação `User::motorista()` e o frontend novo — nenhum efeito persistente. Deploy seguro a qualquer altura (novos endpoints sob papel novo; não tocam fluxos existentes).

## Open Questions

- O motorista deve poder concluir/cancelar uma recolha em qualquer data ou apenas dentro de uma janela (ex.: no próprio dia)? Deferível — decidir com a ELISAL-EP sem impacto em specs/arquitetura.
- A conclusão deve guardar `observacao` opcional (ex.: "não havia resíduo")? Deferível.