## 1. Migrações — novas tabelas

- [x] 1.1 Criar migração das tabelas `provincias`, `municipios` e `distritos` (FK `municipios.provincia_id`, `distritos.municipio_id`; unicidade por nível de parentesco)
- [x] 1.2 Criar migração da tabela `contrato_dias_semana` (FK `contrato_id`, `dia_semana` 1-7, unicidade contrato+dia)
- [x] 1.3 Criar migração da tabela `veiculos` (`matricula` única, `modelo` opcional, `motorista_id` FK nullable)
- [x] 1.4 Criar migração de alteração de `utilizadores` (+`endereco_principal` nullable)
- [x] 1.5 Criar migração de alteração de `tipos_residuos` (+`taxa_adesao` decimal não negativa)

## 2. Migrações — alteração e remoção

- [x] 2.1 Criar migração de alteração de `contratos` (renome `recolhas_por_semana` → `frequencia_semanal`; +`rua`, +`ponto_referencia`; atualizar FK `distrito_id` para `distritos`)
- [x] 2.2 Criar migração de alteração de `parcelas_mensalidades` (+`registado_por_id` FK utilizadores nullable, +`numero_recibo` nullable)
- [x] 2.3 Criar migração de alteração de `motoristas` (remover `veiculo_matricula`) e `agendamentos_recolha` (FK `motorista_id` nullable para `motoristas`)
- [x] 2.4 Criar migração de backfill: copiar hierarquia de `divisoes_geograficas` para `provincias`/`municipios`/`distritos` e `motoristas.veiculo_matricula` para `veiculos`
- [x] 2.5 Criar migração de remoção de `divisoes_geograficas`
- [x] 2.6 Correr `php artisan migrate` em MySQL dev e confirmar schema final

## 3. Modelos Eloquent

- [x] 3.1 Criar modelos `Provincia`, `Municipio` e `Distrito` com relações (`provincia hasMany municipios`, `municipio belongsTo provincia`, etc.)
- [x] 3.2 Criar modelo `ContratoDiaSemana` e `Veiculo` (relação com `Motorista`)
- [x] 3.3 Atualizar `User` (+`endereco_principal`), `Motorista` (remover `veiculo_matricula`), `Contrato` (`frequencia_semanal`, `rua`, `ponto_referencia`), `ParcelaMensalidade` (`registado_por_id`, `numero_recibo`) e `AgendamentoRecolha`
- [x] 3.4 Atualizar `UserCreationService`/controllers: motorista já não exige `veiculo_matricula`; cliente aceita `endereco_principal`

## 4. Testes e verificação

- [x] 4.1 Atualizar `DatabaseSchemaTest` (novas tabelas/colunas; remover `divisoes_geograficas` e `veiculo_matricula`)
- [x] 4.2 Atualizar testes Feature afetados (registo de cliente com `endereco_principal`; criação de motorista sem matrícula)
- [x] 4.3 Testes de integridade das novas tabelas (província/município/distrito; `contrato_dias_semana`; `veiculos`)
- [x] 4.4 Correr `composer test` (suite verde) e `pint` (formatação)
