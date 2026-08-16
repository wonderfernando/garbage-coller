# AGENTS.md — Sistema ELISAL-EP

Contexto persistente para agentes de codificação (opencode). Ler antes de qualquer tarefa.
Trabalho de Fim de Curso — UnIA — Engenharia Informática. Autor: Simão Graça Lima.

## O que é o sistema

Sistema web de gestão e optimização da recolha de resíduos sólidos urbanos para a ELISAL-EP (Luanda).
Três perfis com permissões estritamente separadas:

- **ADMINISTRADOR** — configura zonas/preços, aprova contratos, liquida mensalidades, gere motoristas.
- **CLIENTE** — regista-se, abre contratos de recolha, consulta financeiro, acompanha agendamentos.
- **MOTORISTA** — consulta cronograma diário/semanal, marca recolhas como concluídas/canceladas.

Não é projeto de IA/ML — o "motor de optimização" é lógica determinística simples (ordenação por
distrito/proximidade). Não introduzir dependências de machine learning sem pedido explícito.

## Stack — plano (PRD) vs. estado real do repo

Este repositório (`/mnt/c/laragon/www/backend`) é **apenas o backend** e está **em branco (Fase 0)**.
O monorepo `elisal-sistema/` com `backend/` + `frontend/` e o `backlog_elisal.md` ainda **não existem**.

| Camada | Plano (PRD) | Estado real agora (verificado) |
|---|---|---|
| Backend | Laravel 11 | **Laravel 13.8**, PHP 8.3, `composer.json` |
| Auth | Laravel Sanctum (token) | não instalado |
| Frontend | React + Vite + Router + Axios + TailwindCSS | só Vite + TailwindCSS 4 (Blade `welcome`) |
| Mapas | Leaflet + react-leaflet (nunca Google Maps — evita custos) | — |
| Base de dados | MySQL 8.0, 3FN | **MySQL 8.4** local, base `elisal` (`127.0.0.1:3306`, via `.env`); testes em SQLite `:memory:` |
| Filas | Queue driver `database` (sem Redis) | `QUEUE_CONNECTION=database` já definido |
| PDF | `barryvdh/laravel-dompdf` | não instalado |
| Testes | Pest | **PHPUnit** (`phpunit.xml`) — `composer test` |

## Comandos

- `composer test` — corre `config:clear` + `php artisan test` (testes usam SQLite `:memory:`)
- `composer dev` — sobe em conjunto `serve`, `queue:listen --tries=1`, `pail`, `vite` (concurrently)
- `composer setup` — instala deps, cria `.env`, gera key, `migrate`, `build`
- `php artisan test --filter=NomeDoTeste` — teste isolado
- `./vendor/bin/pint` — formatação (Laravel Pint)

## Convenções de código

- **Nomes de domínio** (tabelas, campos, enums, mensagens de validação, erros de API) em **português**,
  para bater certo com o PRD e a defesa. Ex.: `estado`, `taxa_adesao`, `distrito_id`.
- **Nomes de código** (classes, métodos, variáveis internas) em **inglês**, padrão Laravel/React.
- Regras de negócio e cálculos **nunca no Controller** — vivem em `app/Services/`.
- Efeitos assíncronos (geração de parcelas, agendamentos) são `Jobs` (`ShouldQueue`), nunca lógica
  síncrona dentro do endpoint de aprovação.
- Toda rota sensível tem middleware de `role` no backend — nunca confiar no frontend para esconder UI.
- Toda rota de API com cálculo financeiro ou geração automática de dados precisa de teste antes de concluída.
- Respostas de erro da API em português, claras para o utilizador final.

## Modelo de dados (estado real — ver PRD para detalhe)

| Tabela | Chaves estrangeiras principais | Notas |
|---|---|---|
| `utilizadores` | — | `role`: admin, cliente, motorista; `endereco_principal` opcional |
| `provincias` / `municipios` / `distritos` | `municipios.provincia_id`, `distritos.municipio_id` | geografia em 3 tabelas (unicidade por nível de parentesco) |
| `disponibilidade_distrito` | `distrito_id` | `dia_semana` (1-7) |
| `tipos_residuos` | — | `preco_unitario_recolha`, `taxa_adesao` |
| `contratos` | `cliente_id`, `distrito_id`, `tipo_residuo_id` | `estado`: pendente, aprovado, rejeitado, cancelado; `frequencia_semanal`, `rua`, `ponto_referencia` |
| `contrato_dias_semana` | `contrato_id` | `dia_semana` (1-7), unicidade contrato+dia |
| `parcelas_mensalidades` | `contrato_id`, `registado_por_id` | `estado`: pendente, pago; `numero_recibo` |
| `motoristas` | `utilizador_id` | sem `veiculo_matricula` (matrícula em `veiculos`) |
| `veiculos` | `motorista_id` (nullable) | `matricula` única, `modelo` opcional |
| `agendamentos_recolha` | `contrato_id`, `motorista_id` (nullable) | `estado`: pendente, concluido, cancelado; `observacao` obrigatória em cancelado |

## Regras de negócio críticas

### Precificação (implementar em `ContratoPricingService`)
```
ValorMensal = RecolhasPorSemana × 4 × PrecoUnitarioResiduo
ValorTotal  = TaxaAdesao + (ValorMensal × DuracaoMeses)
```

### Aprovar contrato (`PATCH /contratos/{id}/aprovar`)
1. `Job GerarParcelasContrato` → cria N parcelas mensais (N = duração em meses), vencimento dia 1 ou 5.
2. `Job GerarAgendamentoContrato` → calcula todas as datas de recolha pelos dias da semana escolhidos e
   insere em `agendamentos_recolha`.

### Validação de abertura de contrato
Os dias da semana escolhidos têm de estar contidos em `disponibilidade_distrito` do distrito seleccionado.

### Atribuição de motorista
Feita pelo Administrador, por zona/distrito, sobre agendamentos já gerados (não na abertura do contrato).

## Estado actual do projecto

> Actualizar conforme as fases do backlog forem concluídas.

- [x] Fase 0 — Fundação: skeleton Laravel em branco, sem código próprio, rota única `/`, sem migrações custom
- [x] Fase 1 — Base de dados e modelos: schema MySQL reestruturado (geografia 3 tabelas, `contrato_dias_semana`, `veiculos`, `endereco_principal`, `taxa_adesao`, rastreio de pagamentos) + migrações com backfill; modelos Eloquent (`Provincia`, `Municipio`, `Distrito`, `Contrato`, `ParcelaMensalidade`, `AgendamentoRecolha`, `ContratoDiaSemana`, `Veiculo`, `Motorista`, `User`)
- [x] Fase 2 — Autenticação e RBAC: Sanctum (tokens), `AuthController` (registo/login/logout/me), `AdminUserController`, `UserCreationService`, middleware de `role`, testes de registo/sessão/RBAC
- [ ] Fase 3 — Módulo admin (dados de referência)
- [ ] Fase 4 — Módulo cliente (contratos)
- [ ] Fase 5 — Aprovação, parcelas e agendamento automático
- [ ] Fase 6 — Faturação e liquidação
- [ ] Fase 7 — Módulo motorista
- [ ] Fase 8 — Mapa e acompanhamento
- [ ] Fase 9 — Polimento e entrega da tese

Ver `backlog_elisal.md` para a lista completa de tarefas por fase (ficheiro ainda não existe no repo).

## A confirmar com o humano antes de assumir

- Estrutura exacta de `configuracoes` (taxa de adesão base): tabela chave-valor ou campo fixo?
- Regras de arredondamento monetário (2 casas decimais, moeda AOA).
- Se o "Route Optimization Engine" deve considerar distância real (coordenadas) ou só ordenação por distrito.
