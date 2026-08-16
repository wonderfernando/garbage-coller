## Context

Autenticação (Sanctum) e RBAC (`RoleMiddleware`, alias `role`) estão implementados; o grupo de rotas admin usa `auth:sanctum` + `role:admin` sob `/administracao` (ver `routes/api.php`). Os controllers existentes usam validação inline via `$request->validate()` e os modelos seguem o padrão `#[Fillable]` + `protected $table`. Não há alterações de schema — as tabelas (`tipos_residuos`, `provincias/municipios/distritos`, `disponibilidade_distrito`, `veiculos`, `motoristas`) já existem.

## Goals / Non-Goals

**Goals:**
- API REST completa de dados de referência gerida apenas por administradores, com mensagens de erro em português.
- Regras de negócio (validação de negativos, unicidade, bloqueio de eliminação) fora dos controllers, em `app/Services/`.
- Cobertura de testes Feature por recurso (CRUD + RBAC + integridade).

**Non-Goals:**
- Endpoints de escrita de geografia (províncias/municípios/distritos) — decisão do utilizador: só consulta nesta fase.
- Gestão de contratos/frota por não-admins (Fase 4+).
- Alterações de schema, seeders ou novas dependências.

## Decisions

### D1 — Forma da API (REST sob `/administracao`, com binding de modelo)
- `GET|POST /administracao/tipos-residuos` e `GET|PATCH|DELETE /administracao/tipos-residuos/{tipoResiduo}`
- `GET /administracao/geografia` — hierarquia completa (provincias → municipios → distritos)
- `GET /administracao/distritos` — distritos com disponibilidade atual (para a UI saber onde adicionar/remover dias)
- `POST /administracao/distritos/{distrito}/disponibilidade` (`{dia_semana: 1-7}`) e `DELETE /administracao/distritos/{distrito}/disponibilidade/{dia}`
- `GET|POST /administracao/veiculos` e `GET|PATCH|DELETE /administracao/veiculos/{veiculo}`
- `GET /administracao/motoristas` — lista de motoristas para alocação de veículos

**Rationale**: recursos aninhados (`disponibilidade`) só onde é realmente hierárquico; o resto fica plano, como `AdminUserController`. Binding de modelo `{tipoResiduo}`/`{veiculo}`/`{distrito}` devolve 404 automático.
**Alternativa**: `apiResource` para todos — rejeitada porque `geografia`/`motoristas` são só leitura e `disponibilidade` é uma sub-recurso.

### D2 — Serviços por domínio (regras fora do controller)
- `TipoResiduoService`: `store`/`update` (unicidade de nome, valores ≥ 0) e `delete` com verificação prévia de referências em `contratos`; se em uso → erro de conflito.
- `VeiculoService`: `store`/`update` (matrícula única, `motorista_id` opcional) e `delete` que recusa veículos com `motorista_id` não nulo.
- `DisponibilidadeDistritoService`: `addDay` (valida 1-7 e duplicado) e `removeDay` (404 se não existe).

**Rationale**: segue AGENTS.md — regras de negócio nunca no controller.
**Alternativa**: lógica nos controllers — rejeitada por convenção do projeto e testabilidade.

### D3 — Erros de eliminação bloqueada → HTTP 409
Quando um tipo está referenciado em contratos, ou um veículo tem motorista, o serviço devolve um resultado de conflito e o controller responde `409` com mensagem em português (ex.: "Não é possível eliminar: o tipo de resíduo está associado a contratos."). O CHECK/restrição da BD (`restrictOnDelete`) fica como backstop; se o `QueryException` acontecer mesmo assim, converte-se em 409.

**Rationale**: 409 é o código semântico para estado conflitante; mensagem em português alinhada com a convenção de erros da API.
**Alternativa**: devolver 422 — rejeitado (422 é para falha de validação de input, não de estado).

### D4 — Modelos novos `TipoResiduo` e `DisponibilidadeDistrito`
Seguem o padrão existente: `#[Fillable]` + `protected $table` (`tipos_residuos` / `disponibilidade_distrito`), com relações (`DisponibilidadeDistrito.distrito`, `Contrato.tipoResiduo` se necessário).

### D5 — Validação inline (padrão existente)
`$request->validate()` nos controllers, como `AdminUserController`. Em `update`, a unicidade ignora o próprio registo (`Rule::unique(...)->ignore($model->id)`).

### D6 — Respostas de escrita e listagens
- `store` → 201 com o recurso criado.
- `PATCH` → 200 com o recurso atualizado.
- `DELETE` → 204 (ou 200 com mensagem).
- Listagens → 200, eager-loading (`with('municipios.distritos')`, `with('disponibilidades')`, `with('motorista')`) para evitar N+1.

## Risks / Trade-offs

- [Unicidade de `nome`/`matricula` depender do MySQL para o caso "em uso" durante o update] → validação com `Rule::unique` no input; em caso de corrida, `QueryException` é capturado e devolvido como 422/409.
- [Eliminação protegida pode "travar" dados que já não deviam estar em uso] → verificações apenas por referências reais (contratos/veículos); sem regras extra de histórico.
- [Vários endpoints novos sem testes → regressão silenciosa] → cada recurso tem teste Feature dedicado incluindo RBAC (admin vs. não-admin).

## Migration Plan

Sem migrações nem dados a transformar (apenas código + rotas). Rollback: remover as rotas/controllers/serviços (nenhum efeito persistente); deploy seguro a qualquer altura.

## Open Questions

- Formato exato de `DELETE` de disponibilidade que não existe (404 com mensagem vs. idempotente 200). Resolvido por defeito: **404** com mensagem em português — pode ser alterado sem impacto estrutural.
