## ADDED Requirements

### Requirement: Consulta pública de distritos com disponibilidade
O sistema SHALL disponibilizar a consulta dos distritos sem autenticação, indicando os dias da semana em que cada distrito tem recolha disponível, para o cliente escolher os dias do contrato.

#### Scenario: Consultar distritos com disponibilidade
- **WHEN** um visitante sem sessão consulta a lista de distritos
- **THEN** o sistema devolve cada distrito com os respetivos dias de recolha disponíveis
- **AND** a gestão da disponibilidade continua reservada a administradores
