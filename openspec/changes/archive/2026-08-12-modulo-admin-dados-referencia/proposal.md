## Why

A autenticação e o RBAC (Fases 1-2) existem, mas o Administrador ainda não tem meios de gerir os dados de referência do sistema (tipos de resíduos, geografia, disponibilidade de recolha e frota de veículos). Sem isto, não é possível configurar preços/zonas nem abrir contratos (Fase 4).

## What Changes

- **Tipos de resíduos — CRUD completo** para o admin (`nome`, `descricao`, `preco_unitario_recolha`, `taxa_adesao`): registar, listar, atualizar e eliminar. Nome único; preço unitário e taxa de adesão não negativos; eliminação bloqueada quando o tipo está referenciado em contratos.
- **Geografia — consulta apenas**: o admin lista províncias com os respetivos municípios e distritos (hierarquia). Sem endpoints de escrita (dados provêm do backfill das antigas `divisoes_geograficas`).
- **Disponibilidade de recolha por distrito — adição/remoção individual**: o admin adiciona (`POST`) ou remove (`DELETE`) um dia da semana (1-7) a um distrito. Validação de intervalo 1-7 e de duplicados.
- **Veículos da frota — CRUD completo**: registar, listar, atualizar e eliminar veículos (`matricula` única, `modelo` opcional, alocação opcional a um motorista). Eliminação bloqueada quando o veículo está associado a um motorista.
- **Motoristas — listagem**: endpoint de consulta da lista de motoristas, necessário para a alocação de veículos.

## Capabilities

### New Capabilities
<!-- nenhuma — todas as áreas já têm spec existente -->

### Modified Capabilities
- `tipos-residuos`: adiciona gestão administrativa completa (CRUD) e regra de eliminação protegida quando referenciado em contratos.
- `geografia`: adiciona consulta hierárquica (províncias → municípios → distritos) e gestão individual de disponibilidade de recolha (adicionar/remover dia).
- `veiculos`: adiciona CRUD administrativo completo e regra de eliminação bloqueada enquanto o veículo estiver alocado a um motorista.
- `utilizadores`: adiciona listagem de motoristas.

## Impact

- **Novos modelos**: `TipoResiduo`, `DisponibilidadeDistrito` (os restantes já existem).
- **Novos controllers** em `app/Http/Controllers/Api/`: `AdminTipoResiduoController`, `GeografiaController`, `DisponibilidadeDistritoController`, `AdminVeiculoController`, `AdminMotoristaController`.
- **Novos services** em `app/Services/`: `TipoResiduoService`, `VeiculoService`, `DisponibilidadeDistritoService` (regras de negócio fora dos controllers).
- **Rotas**: grupo `/administracao` com middleware `auth:sanctum` + `role:admin`.
- **Testes Feature** novos por recurso (CRUD + RBAC + validação + integridade).
- Sem alterações de schema (tabelas já existem); sem novas dependências.
