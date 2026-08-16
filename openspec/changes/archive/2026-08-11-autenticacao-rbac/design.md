## Context

Backend Laravel 13.8 em dev sobre MySQL (`elisal`). O modelo `User` já existe (`utilizadores`), com `role` (enum `admin|cliente|motorista`, default `cliente`), `tipo_cliente` (`particular|empresa`), `nif` opcional, `telefone`, email único e `password` com cast `hashed`. Existe a tabela `motoristas` (FK única para `utilizadores`, `numero_carta`, `veiculo_matricula`). `routes/api.php` está vazio; não há auth instalada. Motivação e escopo em proposal.md; requisitos em specs/autenticacao/spec.md.

## Goals / Non-Goals

**Goals:**
- Autenticação por token Bearer (Sanctum) para o frontend React separado.
- Self-register de clientes; criação de admin/motorista só por admin.
- Middleware de `role` para proteger rotas sensíveis.
- Erros de API em português, claros para o utilizador final.
- Testes de registo/login/logout/me/RBAC.

**Non-Goals:**
- Frontend (fora de âmbito nesta fase).
- Reset/recuperação de palavra-passe (backlog).
- SPA-mode/cookies de sessão para a API (frontend é SPA separado, usa Bearer).
- Password expirable/two-factor (futuro, se necessário).

## Decisions

- **D1: Laravel Sanctum em modo token (Bearer).** `composer require laravel/sanctum`, `HasApiTokens` no `User`, guard de API → `sanctum`. *Alternativa:* Laravel Passport (OAuth2) — sobre-engenharia para este âmbito; JWT manual — rejeitado por reinventar o que o Sanctum já faz.
- **D2: Controllers finos + serviço para criação de contas.** Rotas/controllers fazem validação e HTTP; a criação de motorista (utilizador + registo `motoristas` numa transação) vive num serviço (`app/Services/UserCreationService`), cumprindo a convenção do projeto (regras de negócio fora do controller).
- **D3: Middleware de `role` próprio.** Middleware novo que verifica `auth` + perfil permitido; respostas: `401` sem autenticação, `403` com perfil não permitido. Registado como alias `role` no `bootstrap/app.php`. *Alternativa:* pacote Spatie — não necessário; a lógica é simples e o projeto mantém dependências mínimas.
- **D4: Registo público força perfil `cliente`.** O campo `role` não é aceite no self-register (ou é ignorado/forçado a `cliente`); a criação de `admin`/`motorista` é exclusiva do endpoint de admin.
- **D5: Token por login; logout revoga o token atual.** Cada login emite um novo token (`createToken`); o logout usa `currentAccessToken()->delete()`, invalidando apenas o token em uso (multi-dispositivo preservado).
- **D6: Validação em português.** Mensagens de validação/erro em português (nome do campo em PT), coerente com o PRD; validação dos enums `role`/`tipo_cliente` contra os valores permitidos.
- **D7: Migração do Sanctum (`personal_access_tokens`) integrada nas migrações** e corre em MySQL dev e SQLite de teste. *Nota:* tabela com nome em inglês — é convenção do framework, fora da convenção PT do domínio.

## Risks / Trade-offs

- [Sanctum em modo token não protege contra roubo do token] → aceite; transporte obrigatório via HTTPS em produção; documentado para a defesa.
- [Enum de `role`/`tipo_cliente` muda no futuro] → validação centralizada nas regras; a migração `enum` no MySQL é mais rígida que SQLite — alterações futuras exigem migração dedicada.
- [Criação de motorista exige consistência utilizador+motorista] → transação DB no serviço; teste a garantir rollback em falha.
- [Dependência nova (Sanctum) no composer] → versão estável, padrão Laravel, sem impacto no resto; testes confirmam a suite.
- [Frontend ainda não existe — contratos de API definidos sem cliente] → endpoints mínimos e estáveis (register, login, logout, me, users admin); ajustes pequenos quando o frontend chegar.

## Migration Plan

1. `composer require laravel/sanctum`.
2. Publicar e registar a migração do Sanctum; `php artisan migrate` (cria `personal_access_tokens` em MySQL dev).
3. Configurar `config/auth.php` (API guard) e `HasApiTokens` no `User`.
4. Implementar controllers, serviço, middleware `role`, rotas em `routes/api.php`.
5. Testes (SQLite `:memory:`); `composer test` verde.
6. **Rollback:** remover rotas/controllers/middleware, reverter guard e `HasApiTokens`; `migrate:rollback` para a tabela do Sanctum (ou manter, inofensiva).
