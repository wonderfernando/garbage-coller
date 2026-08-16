## Why

A modelagem inicial (Fase 1) era uma aproximação simplificada: a geografia usava uma tabela hierárquica genérica (`divisoes_geograficas`), a matrícula do veículo vivia dentro de `motoristas`, e não existiam dias de recolha por contrato, taxa de adesão por tipo de resíduo, veículos da frota nem rastreio de pagamentos. O PRD e as regras RF-CLI-01, RF-ADM-03/04, RF-ADM-07 e RF-MOT-02 exigem um modelo mais fiel ao domínio antes das fases de contratos e faturação.

## What Changes

- **BREAKING** — Geografia: substituir `divisoes_geograficas` por três tabelas dedicadas `provincias`, `municipios` e `distritos`, com relações de parentesco explícitas (`municipios.provincia_id`, `distritos.municipio_id`); `disponibilidade_distrito.distrito_id` passa a referenciar `distritos`.
- **`utilizadores`**: adicionar `endereco_principal` (opcional) para o cliente (RF-CLI-01).
- **`tipos_residuos`**: adicionar `taxa_adesao` — taxa de adesão base por tipo de resíduo (RF-ADM-04); o contrato guarda snapshot da taxa no momento da criação.
- **`contratos`**: renomear `recolhas_por_semana` para `frequencia_semanal`; adicionar `rua` e `ponto_referencia` (opcionais).
- Nova tabela **`contrato_dias_semana`**: dias da semana (1-7) escolhidos pelo cliente para o contrato, contidos em `disponibilidade_distrito` do distrito.
- **`parcelas_mensalidades`**: adicionar `registado_por_id` (quem registou o pagamento) e `numero_recibo`.
- **BREAKING** — **`motoristas`**: remover `veiculo_matricula`; a matrícula passa a viver na nova tabela **`veiculos`** (matrícula, modelo opcional, `motorista_id` opcional) — RF-ADM-07 (veículo/camião separado do motorista).
- **`agendamentos_recolha`**: `motorista_id` passa a ser opcional; observação obrigatória na aplicação quando estado = `cancelado` (RF-MOT-02).
- Enums existentes (`role`, `estado` de contratos/parcelas/agendamentos) mantêm-se inalterados.

## Capabilities

### New Capabilities
- `veiculos`: frota de veículos/camiões, com matrícula e modelo opcional, e alocação opcional a um motorista (RF-ADM-07).

### Modified Capabilities
- `geografia`: hierarquia de províncias/municípios/distritos em tabelas dedicadas com relações explícitas, em vez de tabela única genérica.
- `tipos-residuos`: adição da taxa de adesão base por tipo de resíduo.
- `utilizadores`: endereço principal opcional do cliente; motorista deixa de guardar matrícula (move-se para `veiculos`).
- `contratos`: frequência semanal, rua/ponto de referência, dias da semana por contrato, rastreio de pagamentos e observação obrigatória em agendamentos cancelados.

## Impact

- Migrações novas em `database/migrations/` (criação de `provincias`, `municipios`, `distritos`, `contrato_dias_semana`, `veiculos`; alterações em `utilizadores`, `tipos_residuos`, `contratos`, `parcelas_mensalidades`, `motoristas`, `agendamentos_recolha`; remoção de `divisoes_geograficas`).
- Migração de dados da hierarquia existente (`divisoes_geograficas` → `provincias`/`municipios`/`distritos`) e da matrícula (`motoristas.veiculo_matricula` → `veiculos`).
- Modelos Eloquent: novos `Provincia`, `Municipio`, `Distrito`, `ContratoDiaSemana`, `Veiculo`; atualização de `User` (`endereco_principal`), `Motorista` (remover `veiculo_matricula`), `Contrato` (`frequencia_semanal`, `rua`, `ponto_referencia`), `ParcelaMensalidade` (`registado_por_id`, `numero_recibo`), `AgendamentoRecolha`.
- `DatabaseSchemaTest` atualizado (novas colunas/tabelas; remoção de `divisoes_geograficas`).
- `UserCreationService`/controllers: criação de motorista passa a não exigir matrícula; registo de cliente aceita `endereco_principal`.
- Sem novas dependências de pacotes.
