## Purpose

Define a autenticação por token Bearer e a autorização por perfil (RBAC) do sistema ELISAL-EP: registo de contas, login/logout e proteção de rotas de API por perfil de acesso.

## Requirements

### Requirement: Registo de cliente
O sistema SHALL permitir o registo público de utilizadores com perfil de acesso `cliente`, guardando a palavra-passe de forma segura e os dados de contacto e identificação definidos para o cliente.

#### Scenario: Registo de cliente válido
- **WHEN** um utilizador regista-se com nome, email, palavra-passe e dados de cliente válidos
- **THEN** a conta é criada com perfil `cliente`
- **AND** a palavra-passe fica guardada de forma segura (hash)
- **AND** o utilizador consegue autenticar-se com as credenciais registadas

#### Scenario: Registo com email duplicado
- **WHEN** um utilizador regista-se com um email já existente
- **THEN** o sistema rejeita o registo com mensagem de erro clara

#### Scenario: Registo com perfil não permitido
- **WHEN** um pedido público de registo tenta criar uma conta com perfil diferente de `cliente`
- **THEN** o sistema rejeita o registo

### Requirement: Criação de contas admin e motorista
O sistema SHALL permitir apenas ao utilizador com perfil `admin` criar contas com perfil `admin` ou `motorista`, guardando os dados do motorista (número da carta e matrícula) quando aplicável.

#### Scenario: Admin cria conta de motorista
- **WHEN** um utilizador com perfil `admin` cria uma conta com perfil `motorista` e dados de motorista
- **THEN** a conta é criada com perfil `motorista`
- **AND** o registo de motorista fica guardado referenciando o utilizador criado

#### Scenario: Admin cria conta de admin
- **WHEN** um utilizador com perfil `admin` cria uma conta com perfil `admin`
- **THEN** a conta é criada com perfil `admin`

#### Scenario: Não-admin tenta criar conta de motorista ou admin
- **WHEN** um utilizador com perfil diferente de `admin` tenta criar uma conta com perfil `admin` ou `motorista`
- **THEN** o sistema rejeita o pedido

### Requirement: Autenticação por token
O sistema SHALL autenticar utilizadores com credenciais válidas (email e palavra-passe), emitindo um token de acesso para uso em pedidos posteriores.

#### Scenario: Login com credenciais válidas
- **WHEN** um utilizador autentica-se com email e palavra-passe corretos
- **THEN** o sistema devolve um token de acesso
- **AND** o utilizador consegue aceder a rotas autenticadas enviando esse token

#### Scenario: Login com credenciais inválidas
- **WHEN** um utilizador autentica-se com email ou palavra-passe incorretos
- **THEN** o sistema rejeita o login sem devolver token

### Requirement: Logout
O sistema SHALL permitir ao utilizador terminar a sessão, invalidando o token de acesso em uso.

#### Scenario: Terminar sessão
- **WHEN** um utilizador autenticado pede logout com o seu token
- **THEN** o token deixa de ser válido para pedidos seguintes

### Requirement: Utilizador atual
O sistema SHALL disponibilizar ao utilizador autenticado os dados da sua própria conta.

#### Scenario: Obter dados do utilizador atual
- **WHEN** um utilizador autenticado pede os dados da sua conta
- **THEN** o sistema devolve os dados do utilizador autenticado

#### Scenario: Pedido sem token
- **WHEN** um pedido não autenticado tenta aceder aos dados do utilizador atual
- **THEN** o sistema rejeita o pedido

### Requirement: Proteção de rotas por perfil
O sistema SHALL proteger as rotas de API de forma que cada rota sensível só possa ser acedida por utilizadores autenticados com o perfil permitido.

#### Scenario: Acesso a rota com perfil permitido
- **WHEN** um utilizador autenticado com o perfil permitido acede a uma rota protegida
- **THEN** o pedido é processado com sucesso

#### Scenario: Acesso a rota com perfil não permitido
- **WHEN** um utilizador autenticado com perfil diferente do permitido acede a uma rota protegida
- **THEN** o sistema rejeita o pedido por falta de permissão

#### Scenario: Acesso a rota protegida sem autenticação
- **WHEN** um pedido não autenticado tenta aceder a uma rota protegida
- **THEN** o sistema rejeita o pedido por falta de autenticação
