## Context

Fase 1 estabeleceu os modelos `Contrato` (com `diasSemana()`, `parcelas()`, `agendamentos()`), `ParcelaMensalidade` (fillable `data_vencimento`, `estado`, `numero_parcela`, `valor`) e `AgendamentoRecolha` (fillable `data_recolha`, `estado`, `observacao`). Fase 4 entregou a abertura de contratos (`ContratoClienteService`, estado `pendente`) e as rotas de cliente. `QUEUE_CONNECTION=database` já está configurado; não há pasta `app/Jobs` ainda. A fila é `database` (sem Redis), leitura por `queue:listen --tries=1` em `composer dev`. Ver `proposal.md` para o "why".

## Goals / Non-Goals

**Goals:**
- Endpoints de aprovação e rejeição de contrato pelo administrador, respeitando a regra "só sobre `pendente`".
- Geração de parcelas e agendamentos **assíncrona** (Jobs `ShouldQueue`) no momento da aprovação — nunca lógica síncrona no endpoint (AGENTS.md).
- Parcelas: uma por mês da duração, vencimento dia 5, `numero_parcela` sequencial, valor = `valor_mensal`, estado `pendente`.
- Agendamentos: datas de recolha por cada dia da semana escolhido, em **cada semana** de cada mês da duração, estado `pendente`.

**Non-Goals:**
- Faturação/liquidação de parcelas (pagamento, recibo) — Fase 6.
- Atribuição de motoristas a agendamentos — fase posterior (AGENTS.md: atribuição admin por zona).
- Alterações de schema, seeders ou novas dependências (tudo já existe).
- Agendamento recorrente em tempo real: gera-se o horizonte na aprovação (decisão do utilizador).

## Decisions

### D1 — `ContratoAprovacaoService` (regra de decisão no serviço)
Métodos `aprovar(Contrato $contrato): Contrato` e `rejeitar(Contrato $contrato): Contrato`.
- Guarda de estado: se `$contrato->estado !== 'pendente'` → `ValidationException` em português ("Apenas contratos pendentes podem ser aprovados/rejeitados.").
- `aprovar`: seta `estado='aprovado'`, guarda, e despacha `GerarParcelasContrato` + `GerarAgendamentoContrato` (com o contrato recarregado). Retorna o contrato.
- `rejeitar`: seta `estado='rejeitado'`, guarda, sem despachar jobs.

**Rationale**: a decisão e o disparo dos efeitos ficam perto do domínio, testáveis em isolamento (convenção AGENTS.md — regras nunca no controller). **Alternativas**: transição no controller (rejeitada); transição no modelo `Contrato` como método de domínio (aceitável mas menos consistente com o padrão `*Service` já usado).

### D2 — Jobs `GerarParcelasContrato` e `GerarAgendamentoContrato`
Ambos `implements ShouldQueue`, `public $contrato`, `handle()` com a lógica e `unique()`/`ViaQueue` opcionais; fila `default`.

**GerarParcelasContrato** — transaccional, idempotente (regenera só se o contrato ainda não tiver parcelas):
- `$inicio = now()->startOfMonth()`.
- Para `$p` de 0 a `duracao_meses-1`: cria `ParcelaMensalidade` com `contrato_id`, `numero_parcela = $p+1`, `valor = contrato->valor_mensal`, `data_vencimento = $inicio->copy()->addMonths($p)->day(5)`, `estado = 'pendente'`.

**GerarAgendamentoContrato**:
- `$inicio = now()->startOfMonth()`; `$fim = $inicio->copy()->addMonths(duracao_meses)`; `$dias = contrato->diasSemana()->pluck('dia_semana')`.
- Itera dia a dia de `$inicio->copy()` até `< $fim`; quando `$data->dayOfWeekIso` está em `$dias`, cria `AgendamentoRecolha` com `contrato_id`, `data_recolha = $data->setTime(8,0,0)` (hora padrão), `estado = 'pendente'`. → recolha semanal por cada dia escolhido.

**Rationale**: `ShouldQueue` garante que a aprovação não bloqueia no endpoint; fila `database` já prevista, consumida por `queue:listen`. **Alternativa**: geração síncrona no controller — rejeitada por AGENTS.md. Hora fixa 08:00 é uma convenção inicial (facilmente ajustável sem alterar specs).

### D3 — `ContratoAdminController`
- `aprovar(Contrato $contrato)` e `rejeitar(Contrato $contrato)` via route-model binding (404 para inexistente), delegando em `ContratoAprovacaoService`. Resposta 200 com o contrato (estado atualizado). Lida `ValidationException` → 422.

**Rationale**: controller fino, só orquestra input e resposta (padrão das fases anteriores). **Alternativa**: métodos no `ContratoClienteController` — rejeitada (separação admin/cliente já estabelecida).

### D4 — Rotas (em `routes/api.php`)
No grupo `auth:sanctum` + `role:admin`:
```
PATCH /contratos/{contrato}/aprovar   → ContratoAdminController@aprovar
PATCH /contratos/{contrato}/rejeitar  → ContratoAdminController@rejeitar
```
Não colidem com `GET /contratos/{contrato}` do cliente (método/verbo e middleware distintos).

### D5 — Testabilidade dos jobs
A geração não depende do worker: os testes Feature sob `Queue::fake()` verificam que a aprovação despachou os dois jobs; os testes Unit executam `->handle()` dos jobs directamente (fila `database` não corre sozinha sem worker). Parcelas/agendamentos são verificados nas tabelas.

## Risks / Trade-offs

- [Jobs não executados se não houver worker a correr (`queue:listen`)] → `composer dev` já sobe `queue:listen --tries=1`; documentado no onboarding. Em testes executa-se `handle()` síncrono.
- [`data_vencimento` dia 5 pode cair a um domingo/feriado] → sem regra de reajuste nesta fase; resolver na cobrança (Fase 6) sem alterar specs.
- [Agendamentos gerados em bloco para N meses podem crescer (ex.: 2 dias/semana × 12 meses ≈ 104 registos)] → volume baixo; rolling/limpeza fora de escopo.
- [Job duplicar parcelas se reprocessado] → guarda de idempotência (`parcelas()->exists()` no `handle` de parcelas).

## Migration Plan

Sem migrações. Rollback: remover as duas rotas admin, o controller, o serviço e os dois jobs; nenhum efeito persistente além dos registos já criados nos contratos aprovados. Deploy seguro a qualquer altura (novas rotas/classes adicionais).

## Open Questions

Nenhumas — as decisões materialmente relevantes (vencimento dia 5, rejeição incluída, horizonte = duração do contrato) foram confirmadas com o utilizador antes deste documento.