## ADDED Requirements

### Requirement: Consulta pública de tipos de resíduos
O sistema SHALL disponibilizar a consulta dos tipos de resíduos sem autenticação, expondo o preço unitário de recolha e a taxa de adesão para a preparação de contratos, sem permitir escrita por utilizadores não-admin.

#### Scenario: Consultar tipos de resíduos publicamente
- **WHEN** um visitante sem sessão consulta a lista de tipos de resíduos
- **THEN** o sistema devolve os tipos de resíduos com preço unitário de recolha e taxa de adesão
- **AND** a escrita (registar, atualizar, eliminar) continua reservada a administradores
