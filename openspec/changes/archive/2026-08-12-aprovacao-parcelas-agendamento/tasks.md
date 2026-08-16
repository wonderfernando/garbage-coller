## 1. Serviço e jobs (regras de negócio)

- [x] 1.1 Criar `ContratoAprovacaoService` — `aprovar()` e `rejeitar()` com guarda de estado (`pendente` senão `ValidationException` em português); `aprovar` muda estado para `aprovado` e despacha os dois jobs; `rejeitar` muda para `rejeitado` sem despachar
- [x] 1.2 Criar `GerarParcelasContrato` (ShouldQueue) — gera N parcelas (N = `duracao_meses`) com `numero_parcela` sequencial, `valor = valor_mensal`, `data_vencimento` dia 5 de cada mês, estado `pendente`; idempotente (`parcelas()->exists()` skip)
- [x] 1.3 Criar `GerarAgendamentoContrato` (ShouldQueue) — para cada semana de cada mês da duração, para cada `dia_semana` escolhido, cria `AgendamentoRecolha` com `data_recolha` (datetime) e estado `pendente`

## 2. Controller e rotas

- [x] 2.1 Criar `ContratoAdminController` — `aprovar(Contrato $contrato)` e `rejeitar(Contrato $contrato)` via route-model binding, delegando em `ContratoAprovacaoService`, resposta 200, `ValidationException` → 422
- [x] 2.2 Registrar em `routes/api.php` no grupo `auth:sanctum` + `role:admin`: `PATCH /contratos/{contrato}/aprovar` e `PATCH /contratos/{contrato}/rejeitar`

## 3. Testes

- [x] 3.1 Teste Unit dos Jobs — `GerarParcelasContrato` cria N parcelas com vencimento dia 5, sequência e valor; `GerarAgendamentoContrato` cria as datas pelos dias da semana em cada mês da duração
- [x] 3.2 Testes Feature de aprovação — admin aprova contrato pendente → 200, estado `aprovado`, `Queue::fake()` confirma despacho dos dois jobs, parcelas/agendamentos gerados
- [x] 3.3 Testes Feature de rejeição — admin rejeita contrato pendente → 200, estado `rejeitado`, nenhum job despachado nem parcelas/agendamentos criados
- [x] 3.4 Testes de guarda e RBAC — aprovar/rejeitar contrato fora do estado `pendente` → 422; não-admin (cliente/motorista) → 403; sem token → 401

## 4. Verificação

- [x] 4.1 Correr `composer test` (suite verde)
- [x] 4.2 Correr `pint` (formatação)