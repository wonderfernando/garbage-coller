## 1. Modelos

- [x] 1.1 Criar modelo `TipoResiduo` (tabela `tipos_residuos`, padrão `#[Fillable]` + `$table`)
- [x] 1.2 Criar modelo `DisponibilidadeDistrito` (tabela `disponibilidade_distrito`, relação `distrito()`)

## 2. Serviços (regras de negócio)

- [x] 2.1 Criar `TipoResiduoService` — `store`/`update` (nome único, preço e taxa ≥ 0) e `delete` com bloqueio se referenciado em `contratos`
- [x] 2.2 Criar `VeiculoService` — `store`/`update` (matrícula única, `motorista_id` opcional) e `delete` com bloqueio se `motorista_id` não nulo
- [x] 2.3 Criar `DisponibilidadeDistritoService` — `addDay` (valida 1-7 e duplicado) e `removeDay` (404 se não existe)

## 3. Controllers e rotas

- [x] 3.1 Criar `AdminTipoResiduoController` (index/store/show/update/destroy, validação inline, 409 em eliminação bloqueada)
- [x] 3.2 Criar `GeografiaController` — `GET /administracao/geografia` (provincias → municipios → distritos) e listagem de distritos com disponibilidade
- [x] 3.3 Criar `DisponibilidadeDistritoController` — `POST` e `DELETE` de dia individual num distrito
- [x] 3.4 Criar `AdminVeiculoController` (index/store/show/update/destroy, validação inline, 409 em eliminação bloqueada)
- [x] 3.5 Criar `AdminMotoristaController` (index com lista de motoristas)
- [x] 3.6 Registrar rotas em `routes/api.php` no grupo `auth:sanctum` + `role:admin` sob `/administracao`

## 4. Testes Feature

- [x] 4.1 Testes de tipos de resíduos (CRUD; designação duplicada; preço/taxa negativos; eliminação bloqueada quando em contrato; RBAC)
- [x] 4.2 Testes de geografia (consulta hierárquica de provincias/municipios/distritos; RBAC)
- [x] 4.3 Testes de disponibilidade de distrito (adicionar dia; duplicado rejeitado; dia inválido; remover dia; RBAC)
- [x] 4.4 Testes de veículos (CRUD; matrícula duplicada; eliminação bloqueada com motorista; desalocar; RBAC)
- [x] 4.5 Testes de motoristas (listagem; RBAC)

## 5. Verificação

- [x] 5.1 Correr `composer test` (suite verde)
- [x] 5.2 Correr `pint` (formatação)
