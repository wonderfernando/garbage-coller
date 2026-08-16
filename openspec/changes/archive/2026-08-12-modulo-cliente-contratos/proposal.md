## Why

O módulo admin (Fase 3) está concluído, mas os clientes ainda não têm forma de abrir contratos de recolha nem consultar os dados de referência (preços de resíduos, distritos com recolha disponível). Sem isto não há fluxo de negócio: a abertura de contratos é a origem de todo o pipeline de aprovação, parcelas e agendamentos das Fases 5+.

## What Changes

- **Consulta pública de dados de referência**: `GET /tipos-residuos` (com `preco_unitario_recolha` e `taxa_adesao`) e `GET /distritos` (com dias de recolha disponíveis por distrito), acessíveis sem autenticação para o frontend de registo/abertura de contrato. Os endpoints de admin em `/administracao` mantêm-se inalterados.
- **Precificação de contrato** em `ContratoPricingService` (regra de negócio fora do controller):
  - `ValorMensal = RecolhasPorSemana × 4 × PrecoUnitarioResiduo`
  - `ValorTotal = TaxaAdesao + (ValorMensal × DuracaoMeses)`
  - valores arredondados a 2 casas decimais (AOA).
- **Abertura de contrato pelo cliente** (`POST /contratos`, `auth:sanctum` + role cliente): escolhe `distrito_id`, `tipo_residuo_id`, dias da semana (1-7) e `duracao_meses`, com morada/coordenadas opcionais. A `frequencia_semanal` é derivada do número de dias escolhidos. Os dias têm de estar contidos na `disponibilidade_distrito` do distrito (senão 422). Cria o contrato com estado `pendente` e os registos em `contrato_dias_semana`.
- **Consulta dos próprios contratos**: `GET /contratos` e `GET /contratos/{contrato}` (cliente autenticado, só os seus, com os dias da semana).
- **BREAKING** (semântico, não de schema): a abertura de contrato passa a exigir autenticação de cliente e calcula valores automaticamente; não há input manual de `taxa_adesao`/`valor_mensal`/`valor_total`/`frequencia_semanal`.

## Capabilities

### New Capabilities

_(nenhuma — segue a organização flat existente do projeto)_

### Modified Capabilities

- `contratos`: abertura de contrato pelo cliente autenticado com precificação automática (frequência derivada dos dias, valores calculados), validação dos dias contra a disponibilidade do distrito e consulta dos próprios contratos (listagem/detalhe) pelo cliente.
- `tipos-residuos`: consulta pública dos tipos de resíduos com preço unitário e taxa de adesão visíveis.
- `geografia`: consulta pública dos distritos com os respetivos dias de recolha disponíveis.

## Impact

- **Código**: novo `ContratoPricingService` em `app/Services/`; novo controller de contratos do cliente em `app/Http/Controllers/Api/` (ex.: `ContratoClienteController`); novos controllers (ou métodos) de leitura pública para tipos de resíduos e distritos; registo de rotas em `routes/api.php`.
- **Modelos**: reaproveitar `Contrato`, `ContratoDiaSemana`, `Distrito`, `DisponibilidadeDistrito`, `TipoResiduo` (relação `Contrato.tipoResiduo()` a confirmar/adicionar).
- **API**: rotas novas públicas (`GET /tipos-residuos`, `GET /distritos`) e autenticadas de cliente (`POST /contratos`, `GET /contratos`, `GET /contratos/{contrato}`).
- **Dependências/schema**: nenhuma migração nem dependência nova — a base está pronta (Fase 1).
- **Testes**: testes Feature do módulo cliente (precificação, validação de dias, RBAC, consulta pública vs. admin).
