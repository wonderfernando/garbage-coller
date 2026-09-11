## 1. Backend — serviços e modelo

- [ ] 1.1 Adicionar relação `User::motorista()` (HasOne, FK `motoristas.utilizador_id`) em `app/Models/User.php`
- [ ] 1.2 Criar `MotoristaCronogramaService` — `consultar(Motorista $m, ?string $inicio, ?string $fim)`: range [inicio, fim] em `data_recolha` (default hoje), eager-load `contrato.cliente`, `contrato.distrito.municipio.provincia`, `contrato.tipoResiduo`, `motorista.utilizador`, ordenado por `data_recolha`
- [ ] 1.3 Criar `ConcluirRecolhaService` — valida dono (404) e `estado = pendente` (422), grava `concluido`
- [ ] 1.4 Criar `CancelarRecolhaService` — valida dono (404), `estado = pendente` (422) e `observacao` não vazia (422), grava `cancelado` + `observacao`

## 2. Backend — controller e rotas

- [ ] 2.1 Criar `MotoristaController` — `cronograma()`, `concluir()` e `cancelar()` (route-model binding `{agendamento}`; validação de formato de `inicio`/`fim` e obrigatoriedade de `observacao`; delegação aos serviços)
- [ ] 2.2 Registrar rotas em `routes/api.php` com middleware `['auth:sanctum', 'role:motorista']`: `GET /motorista/cronograma`, `PATCH /motorista/agendamentos/{agendamento}/concluir`, `PATCH /motorista/agendamentos/{agendamento}/cancelar`

## 3. Testes (backend)

- [ ] 3.1 Testes de consulta do cronograma (só recolhas do próprio motorista; default hoje; intervalo inicio/fim; ordenação; recolha de outro motorista ausente)
- [ ] 3.2 Testes de concluir (própria pendente → `concluido`; não pendente → 422; de outro motorista → 404; sem token → 401; como cliente/admin → 403)
- [ ] 3.3 Testes de cancelar (própria pendente com observação → `cancelado`; sem observação → 422; não pendente → 422; de outro motorista → 404)
- [ ] 3.4 Correr `composer test` (suíte completa verde)

## 4. Frontend

- [ ] 4.1 Criar `src/api/motorista.ts` — `cronograma(inicio?, fim?)`, `concluir(id)`, `cancelar(id, observacao)`
- [ ] 4.2 Criar `MotoristaLayout` (padrão do `ClientLayout`, identidade ELISAL-EP) com nav: Visão geral (`/motorista`) e Cronograma (`/motorista/cronograma`)
- [ ] 4.3 Criar `DashboardPage` (`/motorista`) — contagens do dia e lista das recolhas de hoje
- [ ] 4.4 Criar `CronogramaPage` (`/motorista/cronograma`) — toggle Dia/Semana, navegação de datas, lista com cliente/distrito/rua/hora/estado, ações Concluir (confirmação) e Cancelar (diálogo com observação obrigatória); recarrega lista após ação
- [ ] 4.5 Registar rotas `/motorista` e `/motorista/cronograma` em `App.tsx` sob `RequireAuth` + `RequireRole role="motorista"`

## 5. Verificação

- [ ] 5.1 Correr `pint` (formatação) nos ficheiros backend alterados
- [ ] 5.2 Correr `npm run build` no `frontend/`