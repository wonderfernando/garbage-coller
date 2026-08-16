## 1. Serviços (regras de negócio)

- [x] 1.1 Criar `ContratoPricingService` — `calculate()` com `ValorMensal = recolhasPorSemana × 4 × preçoUnitario` e `ValorTotal = taxaAdesao + (ValorMensal × duracaoMeses)`, arredondado a 2 casas decimais
- [x] 1.2 Criar `ContratoClienteService` — `abrir()`: valida dias contidos em `disponibilidade_distrito` do distrito (senão `ValidationException` em português), deriva `frequencia_semanal = count(dias)`, calcula preços via `ContratoPricingService` e cria `Contrato` (estado `pendente`) + registos `ContratoDiaSemana` numa transação

## 2. Modelo, controllers e rotas

- [x] 2.1 Adicionar relação `Contrato::tipoResiduo()` (FK `tipo_residuo_id` existente)
- [x] 2.2 Criar `ReferenciaPublicaController` — `tiposResiduos()` e `distritos()` (leitura pública com disponibilidade)
- [x] 2.3 Criar `ContratoClienteController` — `store` (validação inline, 201 com `dias_semana`), `index` (só do cliente autenticado, eager-load), `show` (query escopada por `cliente_id` → 404 para contratos alheios)
- [x] 2.4 Registrar rotas em `routes/api.php`: públicas `GET /tipos-residuos` e `GET /distritos`; com `auth:sanctum` + `role:cliente`: `POST /contratos`, `GET /contratos`, `GET /contratos/{contrato}`

## 3. Testes

- [x] 3.1 Teste Unit de `ContratoPricingService` (fórmula do valor mensal e total; arredondamento)
- [x] 3.2 Testes de consulta pública (tipos-residuos e distritos sem auth; escrita admin continua protegida por `role:admin`)
- [x] 3.3 Testes de abertura de contrato (valores calculados; frequência derivada dos dias; dia fora da disponibilidade → 422; dia inválido/duplicado → 422; não-cliente → 403; sem token → 401)
- [x] 3.4 Testes de consulta dos próprios contratos (listagem só os do cliente; detalhe próprio; detalhe de contrato alheio → 404)

## 4. Verificação

- [x] 4.1 Correr `composer test` (suite verde)
- [x] 4.2 Correr `pint` (formatação)
