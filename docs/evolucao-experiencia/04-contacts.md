# Mapa de Evolução de Experiência — Contatos (`/contacts`)

| Campo | Valor |
| --- | --- |
| Área | Contatos / Gestão de Base (`/contacts`) |
| Arquétipo | Operacional / Lista-Diretório (Directory & Index) — Volume II Cap. 4 |
| Data | 2026-08-14 |
| Status | Implementado |

---

## 1. Contexto e Diagnóstico

A área de **Contatos** é a espinha dorsal de identificação do FlowHub. Antes desta evolução, a tela exibia uma tabela funcional de dados, porém com oportunidades claras de aprimoramento em:

1. **Consciência Visual de Situação**: Ausência de visão sintetizada da base (total de contatos, qualificação com e-mail/documento, volume de tags ativas e opt-out).
2. **Produtividade em Lote Limitada**: A seleção múltipla apenas permitia exclusão. Operações comuns de CRM — como etiquetar 10 contatos de uma vez ou exportar a seleção atual para CSV — exigiam trabalho manual individual.
3. **Fluência e Ritmo Visual**: Transições abruptas durante buscas e paginação, ausência de avatares contextuais para escaneamento rápido e atritos para navegar entre o perfil do contato e a caixa de entrada (Inbox).

---

## 2. Garantias Mantidas (Constituição do Produto)

- **Tenancy e Isolamento (`account_id`)**: Garantia estrita em todas as consultas e operações em lote.
- **Autorização por Papel (`useCan('send-messages')`)**: Operações de gravação, exclusão e etiquetagem em lote respeitam rigorosamente os papéis do usuário.
- **LGPD e Consentimento**: Indicadores de Opt-Out preservados e destacados.
- **i18n Nativo (`pt-BR`)**: Todos os textos e feedbacks são oriundos do sistema de internacionalização.

---

## 3. As Reconstruções Implementadas

### A. Painel de Métricas Rápidas (KPI Header)
- 4 cartões minimalistas no topo: Total da Base, Contatos Qualificados (com E-mail ou CPF/CNPJ), Tags Distribuídas e Registro de Consentimento / Opt-Out.

### B. Barra de Ações em Lote Expandida (Floating Action Bar)
- Atribuição e Remoção de Tags em Lote de forma atômica via modal dedicada.
- Exportação instantânea dos contatos selecionados para formato CSV UTF-8.
- Exclusão em lote preservada com modal de segurança.

### C. Teclado, Filtros Rápidos e Ergonomia (FH-48)
- Pílulas de filtro rápido acima da tabela (Todos, Com E-mail, Com CPF/CNPJ, Opt-Out).
- Atalhos universais: `/` ou `⌘K` foca a busca, `C` abre novo contato, `Esc` limpa seleções e filtros.
- Dicas visuais discretas de teclado na interface.

### D. Tabela Elevada e Transições Suaves (FH-46)
- Avatares com inicial e geração determinística de cor de fundo baseada no identificador do contato.
- Ações rápidas ao passar o mouse sobre a linha (Hover Quick Actions).
- Esqueleto de carregamento animado (`pulse-glow`) em substituição ao spinner genérico.

### E. Conexão Direta com a Caixa de Entrada (Inbox)
- Botão no cabeçalho do Drawer de Detalhes para saltar diretamente para a conversa do contato na Inbox (`/inbox?contactId=...`).
