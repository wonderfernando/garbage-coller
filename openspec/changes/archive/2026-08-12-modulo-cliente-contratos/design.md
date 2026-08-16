## Context

Autenticação (Sanctum) e RBAC (`RoleMiddleware`, alias `role`) estão implementados; as rotas admin vivem sob `/administracao` com `auth:sanctum` + `role:admin`. Os modelos `Contrato`, `ContratoDiaSemana`, `Distrito`, `DisponibilidadeDistrito` e `TipoResiduo` existem (Fase 1); o `Contrato` já tem `diasSemana()` mas não tem relação `tipoResiduo()`. Não há alterações de schema — apenas código e rotas. Ver `proposal.md` para o "why".

## Goals / Non-Goals

**Goals:**
- Fluxo de abertura de contrato pelo cliente autenticado, com valores calculados pelo `ContratoPricingService` (regra fora do controller, por AGENTS.md).
- Validação dos dias escolhidos contra `disponibilidade_distrito` (regra de negócio em serviço, 422 em português).
- Consulta pública de tipos de resíduos e distritos para o frontend, mantendo escrita/gestão só de admin.
- Consulta dos próprios contratos pelo cliente, sem expor contratos alheios.

**Non-Goals:**
- Aprovação de contratos, geração de parcelas e agendamentos (Fase 5).
- Faturação/liquidação (Fase 6) e módulo motorista (Fase 7).
- Alterações de schema, seeders ou novas dependências.

## Decisions

### D1 — API pública de dados de referência
- `GET /tipos-residuos` (público) e `GET /distritos` (público, com dias de recolha disponíveis), sem middleware de auth.
- Novo `ReferenciaPublicaController` com `tiposResiduos()` e `distritos()`, devolvendo as mesmas queries dos endpoints admin (`TipoResiduo::orderBy('nome')`; `Distrito::with('municipio.provincia','disponibilidades')`).
- Os endpoints de escrita/gestão continuam em `AdminTipoResiduoController`/`DisponibilidadeDistritoController` sob `/administracao` com `role:admin`.

**Rationale**: separar responsabilidade de leitura pública da gestão admin; a segurança vive no middleware das rotas. `ReferenciaPublicaController` evita reutilizar controllers "Admin" em rotas públicas (clareza de intenção).
**Alternativa**: registar as rotas públicas a apontar para os métodos `index`/`distritos` já existentes — rejeitada por clareza (nomes "Admin" em rotas públicas).

### D2 — `ContratoPricingService`
```
recolhasPorSemana = count(dias_semana)
valorMensal = round(recolhasPorSemana * 4 * preco_unitario_recolha, 2)
valorTotal  = round(taxa_adesao + valorMensal * duracao_meses, 2)
```
- `calculate(TipoResiduo $tipo, int $recolhasPorSemana, int $duracaoMeses): array{valor_mensal: float, valor_total: float}`.
- A `taxa_adesao` do contrato é um *snapshot* da `taxa_adesao` do tipo de resíduo no momento da abertura (o contrato guarda o valor à data, não uma referência viva).

**Rationale**: regra central e testável; alterações futuras de preço/taxa do tipo não alteram contratos já abertos (snapshot). Arredondamento a 2 casas (AOA).
**Alternativa**: calcular no controller — rejeitada por convenção do projeto.

### D3 — Abertura de contrato (`POST /contratos`)
- Rota sob `auth:sanctum` + `role:cliente`.
- Controller `ContratoClienteController::store` faz só a validação de input; a regra vive em `ContratoClienteService::abrir(User $cliente, array $data)`:
  1. Carrega distrito e verifica se **todos** os dias escolhidos estão em `disponibilidade_distrito` do distrito; caso falte algum → `ValidationException` com mensagem em português ("O dia X não está disponível no distrito selecionado.").
  2. `frequencia_semanal = count(dias)` (input não aceita `frequencia_semanal`/valores).
  3. Preço via `ContratoPricingService`; cria `Contrato` (estado `pendente`, `cliente_id` do autenticado) e os registos `ContratoDiaSemana`.
- Input validado: `distrito_id` (exists), `tipo_residuo_id` (exists), `dias_semana` (array, min 1, max 7, inteiros 1-7 distintos), `duracao_meses` (int ≥ 1), `rua`/`ponto_referencia`/`latitude`/`longitude` opcionais.
- `store` → 201 com o contrato (incluindo `dias_semana`).

**Rationale**: transação única (contrato + dias); regra de disponibilidade perto do domínio, testável em isolamento.
**Alternativa**: aceitar `frequencia_semanal` como input — rejeitada (decisão do utilizador: derivar dos dias).

### D4 — Consulta dos próprios contratos
- `GET /contratos` e `GET /contratos/{contrato}` sob `auth:sanctum` + `role:cliente`.
- `ContratoClienteController::index` devolve os contratos do utilizador autenticado (eager-load `distrito`, `tipoResiduo`, `diasSemana`).
- `show` busca `Contrato::where('id', $id)->where('cliente_id', $authId)->firstOrFail()` → **404** para contratos de terceiros (não revela existência).

**Rationale**: 404 em vez de 403 evita enumerar contratos alheios; serviço `ContratoClienteService` (ou método do controller com query escopada) garante o isolamento por dono.

### D5 — Modelos/relações
- Adicionar `Contrato::tipoResiduo(): BelongsTo` (FK `tipo_residuo_id` já existe) e, se útil, `Contrato::diasSemana()` já existe. Modelos novos seguem o padrão `#[Fillable]` + `$table` (não há modelos novos nesta fase).

## Risks / Trade-offs

- [Valores calculados dependem do snapshot de preço/taxa → alterações de preço não afetam contratos abertos] → comportamento intencional (snapshot à data da abertura), documentado.
- [Cliente pode abrir contratos sobrepostos no mesmo distrito] → sem restrição nesta fase; a gestão/priorização fica na aprovação (Fase 5).
- [Consulta pública expõe preços/taxas] → pretendido (transparência de preços no fluxo de contratação); sem dados pessoais envolvidos.
- [Vários endpoints novos sem testes → regressão silenciosa] → testes Feature por recurso (público, cliente, RBAC, precificação).

## Migration Plan

Sem migrações nem transformação de dados. Rollback: remover as rotas/controllers/services novos (nenhum efeito persistente); deploy seguro a qualquer altura.

## Open Questions

- Limite superior de `duracao_meses` (ex.: máx. 36)? Deferível — adicionar `max` na validação mais tarde não altera specs nem arquitetura.
