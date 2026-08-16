## Why

A Fase 2 exige que os utilizadores se autentiquem e que os perfis (ADMINISTRADOR, CLIENTE, MOTORISTA) tenham permissões estritamente separadas. Sem autenticação por token e RBAC no backend, não há como proteger as rotas de contratos, motoristas e administração previstas nas fases seguintes.

## What Changes

- Instalar e configurar **Laravel Sanctum** (autenticação por token Bearer, sem sessões de API).
- **Registo de cliente**: endpoint público de self-register que cria utilizadores com perfil `cliente` (campos de contacto/identificação do spec `utilizadores`).
- **Criação de contas admin/motorista**: endpoint restrito a `admin` para criar utilizadores com perfil `admin` ou `motorista`.
- **Login/logout**: emissão de token Bearer no login e revogação no logout.
- **Utilizador atual**: endpoint `me` autenticado.
- **RBAC**: middleware de `role` no backend para proteger rotas sensíveis por perfil; rotas de API autenticadas rejeitam pedidos sem token válido.
- **BREAKING**: a partir desta fase, as rotas protegidas deixam de aceitar pedidos não autenticados.
- Reset de palavra-passe fica **fora de âmbito** (backlog).

## Capabilities

### New Capabilities
- `autenticacao`: registo de contas, autenticação por token Bearer (login/logout/me) e autorização por perfil (RBAC) no backend.

### Modified Capabilities
<!-- Nenhuma — a capacidade utilizadores já cobre o armazenamento; esta fase adiciona o comportamento de autenticação/autorização. -->

## Impact

- Dependência: `laravel/sanctum` (composer).
- `config/auth.php` (guard de API) e ficheiro de configuração do Sanctum, se aplicável.
- Migração do Sanctum (`personal_access_tokens`).
- Novos controllers/rotas de API: registo, criação por admin, login, logout, me.
- Middleware de `role` novo no backend.
- Testes (SQLite `:memory:`) para registo, login, logout, me e RBAC — cada rota protegida precisa de teste.
- Modelo `User` (`utilizadores`): `HasApiTokens` + cast de `role`/`tipo_cliente` se necessário.
- Frontend ainda fora de âmbito (só backend).
