## 1. Setup do Sanctum

- [x] 1.1 `composer require laravel/sanctum` e confirmar instalação
- [x] 1.2 Publicar/registar a migração do Sanctum e correr `php artisan migrate` (cria `personal_access_tokens` em MySQL dev)
- [x] 1.3 Configurar guard de API para `sanctum` em `config/auth.php` e adicionar `HasApiTokens` ao modelo `User`

## 2. Registo e criação de contas

- [x] 2.1 Implementar `app/Services/UserCreationService` (criação de cliente; criação de admin/motorista com transação que insere utilizador + `motoristas`)
- [x] 2.2 Endpoint público `POST /api/registar` (self-register) que força perfil `cliente` e valida nome, email único, palavra-passe e dados de cliente, com mensagens em português
- [x] 2.3 Endpoint `POST /api/administracao/utilizadores` (restrito a admin) para criar contas com perfil `admin` ou `motorista` (com `numero_carta` e `veiculo_matricula` quando motorista)

## 3. Autenticação e sessão

- [x] 3.1 Endpoint `POST /api/login` que valida credenciais e devolve token Bearer
- [x] 3.2 Endpoint `POST /api/logout` que revoga o token atual
- [x] 3.3 Endpoint `GET /api/me` que devolve os dados do utilizador autenticado

## 4. RBAC

- [x] 4.1 Implementar middleware de `role` (responde `401` sem autenticação e `403` com perfil não permitido)
- [x] 4.2 Registar o middleware como alias e aplicá-lo às rotas sensíveis (`administracao/utilizadores` só admin; rotas autenticadas com `auth:sanctum`)

## 5. Testes e verificação

- [x] 5.1 Testes Feature de registo (válido, email duplicado, perfil forçado) em SQLite `:memory:`
- [x] 5.2 Testes Feature de criação admin/motorista (admin permite, não-admin rejeita)
- [x] 5.3 Testes Feature de login/logout/me (credenciais válidas/inválidas, token revogado, sem token)
- [x] 5.4 Testes Feature de RBAC (rota admin com cliente → 403; rota protegida sem token → 401)
- [x] 5.5 Correr `composer test` (suite verde) e `pint` (formatação)
