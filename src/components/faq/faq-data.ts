export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  steps?: string[];
  routeLink?: {
    label: string;
    href: string;
  };
  tags?: string[];
}

export interface FaqCategory {
  id: string;
  title: string;
  description: string;
  iconName: string;
  items: FaqItem[];
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "onboarding",
    title: "Início Rápido & Guia",
    description: "Passos essenciais para colocar sua operação no WhatsApp em funcionamento",
    iconName: "Zap",
    items: [
      {
        id: "start-steps",
        question: "Acabei de acessar o sistema pela primeira vez. Por onde devo começar?",
        answer: "Para estruturar seu atendimento oficial no WhatsApp de forma rápida e segura, siga este roteiro de 3 etapas:",
        steps: [
          "Conecte sua conta do WhatsApp Meta: Em Configurações > WhatsApp, insira suas credenciais ou utilize a verificação de 1 clique.",
          "Organize sua equipe: Em Configurações > Membros da equipe, convide os atendentes e defina os papéis de acesso.",
          "Importe seus contatos: Na tela de Contatos, faça o upload de sua base via planilha CSV ou cadastre clientes individualmente."
        ],
        routeLink: {
          label: "Ir para Configurações do WhatsApp",
          href: "/settings?tab=whatsapp"
        },
        tags: ["início", "primeiros passos", "setup", "começar", "configuração inicial"]
      },
      {
        id: "guided-tour",
        question: "Como funciona o Tour Guiado contextual?",
        answer: "O Tour Guiado é projetado para orientar você exatamente na tela onde estiver trabalhando. Em qualquer momento:",
        steps: [
          "Navegue até a funcionalidade desejada (ex: Caixa de Entrada, Pipelines, Transmissões ou Automações).",
          "No canto superior direito da tela, clique no botão de Tour Guiado (ícone de bússola/mapa).",
          "Um assistente visual conduzirá você pelos botões, relatórios e recursos específicos daquela página."
        ],
        tags: ["tour", "ajuda", "tutorial", "passo a passo", "contextual", "orientação"]
      }
    ]
  },
  {
    id: "dashboard",
    title: "Dashboard Operacional",
    description: "Visão em tempo real da Fila de Atenção, métricas de resposta e ritmo comercial",
    iconName: "LayoutDashboard",
    items: [
      {
        id: "dash-overview",
        question: "Como o Dashboard ajuda a priorizar o trabalho diário da equipe?",
        answer: "O Dashboard reúne os indicadores operacionais mais críticos para que gestores e atendentes saibam exatamente onde agir primeiro:",
        steps: [
          "Fila de Atenção: Alertas prioritários sobre conversas pendentes de resposta humana, oportunidades comerciais estagnadas e falhas pontuais de comunicação.",
          "Ações Rápidas: Atalhos diretos para iniciar conversas, cadastrar oportunidades e criar envios.",
          "Volume de Interações: Comparativo em gráfico do fluxo diário de mensagens enviadas e recebidas.",
          "Tempo Médio de Resposta: Indicador do tempo de atendimento distribuído ao longo da semana para acompanhamento de SLA."
        ],
        routeLink: {
          label: "Ver Dashboard",
          href: "/dashboard"
        },
        tags: ["dashboard", "fila de atenção", "métricas", "tempo de resposta", "sla", "indicadores"]
      },
      {
        id: "dash-filters",
        question: "Como ajustar o período de análise dos gráficos?",
        answer: "Utilize os seletores de período (7 dias, 30 dias ou 90 dias) posicionados no cabeçalho do gráfico principal para alternar a visão temporal das métricas.",
        routeLink: {
          label: "Ir para o Dashboard",
          href: "/dashboard"
        },
        tags: ["filtro", "período", "gráficos", "histórico"]
      }
    ]
  },
  {
    id: "inbox",
    title: "Caixa de Entrada & Multiatendimento",
    description: "Atendimento simultâneo no WhatsApp com histórico unificado e notas internas",
    iconName: "MessageSquare",
    items: [
      {
        id: "inbox-multiagent",
        question: "Como funciona o atendimento simultâneo por múltiplos operadores?",
        answer: "Toda a equipe opera a partir de um número oficial único de WhatsApp. Os atendentes visualizam as conversas da fila, assumem chats, transferem atendimento e registram notas internas sem sobreposição de mensagens.",
        routeLink: {
          label: "Abrir Caixa de Entrada",
          href: "/inbox"
        },
        tags: ["chat", "atendimento", "multiatendente", "whatsapp", "fila de trabalho"]
      },
      {
        id: "inbox-features",
        question: "Como enviar arquivos, áudios e anotações privadas durante o atendimento?",
        answer: "Na barra de composição do chat, você pode anexar documentos e imagens, gravar mensagens de áudio diretamente do navegador e alternar para o modo 'Nota Interna' — que salva anotações visíveis apenas para a sua equipe.",
        routeLink: {
          label: "Ir para a Caixa de Entrada",
          href: "/inbox"
        },
        tags: ["áudio", "mídia", "notas internas", "anexos", "documentos"]
      },
      {
        id: "inbox-statuses-explained",
        question: "O que representam os status Aberto, Pendente e Fechado?",
        answer: "Os status organizam o ciclo de vida do atendimento e influenciam na contagem de SLA e métricas de desempenho:",
        steps: [
          "Aberto (open): Conversa ativa aguardando tratativa da equipe ou da inteligência artificial. Contabiliza no tempo de resposta da fila.",
          "Pendente (pending): Atendimento pausado temporariamente enquanto a equipe aguarda retorno de cliente ou ação externa.",
          "Fechado (closed): Atendimento concluído. Se o cliente enviar uma nova mensagem no WhatsApp, a conversa é reaberta automaticamente na fila ativa."
        ],
        routeLink: {
          label: "Ver Caixa de Entrada",
          href: "/inbox"
        },
        tags: ["status", "aberto", "pendente", "fechado", "sla", "ciclo de vida"]
      }
    ]
  },
  {
    id: "crm_routing",
    title: "Direcionamento CRM & Atribuição",
    description: "Roteamento inteligente de conversas para o responsável pelo lead ou equipe certa",
    iconName: "UserCheck",
    items: [
      {
        id: "crm-routing-how",
        question: "Como funciona o direcionamento automático para o responsável pelo cliente?",
        answer: "Quando um cliente entra em contato pelo WhatsApp, o sistema identifica se ele já possui um responsável de conta (Owner) ou uma oportunidade ativa no funil comercial. O atendimento é automaticamente atribuído ao profissional correspondente na Caixa de Entrada.",
        routeLink: {
          label: "Ver Caixa de Entrada",
          href: "/inbox"
        },
        tags: ["direcionamento", "atribuição", "carteira", "responsável", "crm", "roteamento"]
      },
      {
        id: "crm-routing-manual",
        question: "É possível reatribuir manualmente um atendimento na Caixa de Entrada?",
        answer: "Sim. No cabeçalho da conversa na Caixa de Entrada, selecione a opção de responsável e escolha qualquer membro da equipe ou departamento para transferir o atendimento instantaneamente.",
        routeLink: {
          label: "Ir para a Caixa de Entrada",
          href: "/inbox"
        },
        tags: ["reatribuir", "transferir", "responsável", "membro"]
      }
    ]
  },
  {
    id: "boards",
    title: "Boards & Gestão Visual",
    description: "Organização estilo Kanban para acompanhar conversas e estágios de relacionamento",
    iconName: "LayoutGrid",
    items: [
      {
        id: "boards-difference",
        question: "Qual a diferença entre a visão de Boards e a tela de Pipelines?",
        answer: "O Boards organiza os contatos e conversas por estágio de atendimento e relacionamento (ex: Prioridades, Em Atendimento, Retorno Agendado). O Pipelines é voltado para a gestão comercial de vendas, com valores financeiros e negociações (Deals).",
        routeLink: {
          label: "Visualizar Boards",
          href: "/boards"
        },
        tags: ["boards", "kanban", "estágios", "organização visual"]
      },
      {
        id: "boards-move",
        question: "Como movimentar cartões entre as colunas do Board?",
        answer: "Basta clicar sobre o cartão do contato, arrastá-lo até a coluna desejada e soltar. O status do atendimento será atualizado imediatamente.",
        routeLink: {
          label: "Ir para Boards",
          href: "/boards"
        },
        tags: ["arrastar", "drag and drop", "mover", "colunas"]
      }
    ]
  },
  {
    id: "contacts",
    title: "Contatos & Base de Clientes",
    description: "Centralização da base de contatos, importação em massa e etiquetagem",
    iconName: "Users",
    items: [
      {
        id: "contacts-import",
        question: "Como importar uma lista de contatos via planilha CSV?",
        answer: "Para cadastrar múltiplos contatos de forma automatizada:",
        steps: [
          "Acesse a tela de Contatos no menu principal.",
          "Clique em 'Importar' no topo da página.",
          "Faça o envio do arquivo CSV contendo ao menos o Nome e Telefone (com DDD).",
          "Mapeie as colunas com os campos do sistema e confirme o carregamento."
        ],
        routeLink: {
          label: "Ir para Contatos",
          href: "/contacts"
        },
        tags: ["importar", "csv", "contatos", "lista", "base"]
      },
      {
        id: "custom-fields",
        question: "O que são Campos Personalizados e Tags?",
        answer: "Campos Personalizados armazenam dados específicos do seu negócio (como CPF/CNPJ, Razão Social ou Segmento). As Tags ajudam a categorizar rapidamente os contatos para filtros e transmissões.",
        routeLink: {
          label: "Gerenciar Campos e Tags",
          href: "/settings?tab=fields"
        },
        tags: ["campos", "personalizados", "atributos", "tags", "etiquetas"]
      }
    ]
  },
  {
    id: "pipelines",
    title: "Pipelines & Oportunidades",
    description: "Gestão do funil de vendas, negociações comerciais e acompanhamento de receita",
    iconName: "GitBranch",
    items: [
      {
        id: "pipelines-concept",
        question: "Como funcionam os Pipelines de Vendas?",
        answer: "Os Pipelines representam as etapas do seu processo comercial. Cada oportunidade (Deal) exibe o valor monetário estimado, contato vinculado, responsável e previsão de fechamento.",
        routeLink: {
          label: "Abrir Pipelines",
          href: "/pipelines"
        },
        tags: ["pipelines", "vendas", "deals", "funil commercial", "oportunidades"]
      },
      {
        id: "pipelines-edit-stages",
        question: "Como personalizar as etapas do funil de vendas?",
        answer: "Na tela de Pipelines, acesse as opções de gerenciamento para criar novos estágios, reordenar etapas do processo e atribuir cores visuais de identificação.",
        routeLink: {
          label: "Ir para Pipelines",
          href: "/pipelines"
        },
        tags: ["etapas", "estágios", "personalização", "gerenciar funil"]
      }
    ]
  },
  {
    id: "broadcasts",
    title: "Transmissões em Massa & Aprovações",
    description: "Envios oficiais agendados com suporte à aprovação prévia de administradores",
    iconName: "Radio",
    items: [
      {
        id: "broadcast-how",
        question: "Como funcionam os disparos de mensagens em massa oficiais?",
        answer: "As Transmissões utilizam modelos de mensagem (HSM) pré-aprovados pela Meta. É possível filtrar a lista de destinatários por tags ou atributos e agendar a entrega no melhor horário.",
        routeLink: {
          label: "Ver Transmissões",
          href: "/broadcasts"
        },
        tags: ["disparos", "transmissões", "massa", "meta", "modelos", "hsm"]
      },
      {
        id: "broadcast-approval",
        question: "Como funciona o fluxo de aprovação prévia de envios?",
        answer: "Para garantir total governança sobre comunicações em larga escala, o sistema permite exigir que transmissões criadas por atendentes passem por revisão e autorização expressa de um Administrador antes do disparo.",
        routeLink: {
          label: "Gerenciar Transmissões",
          href: "/broadcasts"
        },
        tags: ["aprovação", "governança", "revisão", "autorização", "segurança"]
      }
    ]
  },
  {
    id: "document_delivery",
    title: "Transmissões Documentais & Processos",
    description: "Envio seguro de demonstrativos, relatórios e arquivos com código de validação",
    iconName: "FileText",
    items: [
      {
        id: "doc-delivery-concept",
        question: "O que são Transmissões Documentais e qual a sua aplicação?",
        answer: "A funcionalidade de Transmissões Documentais automatiza o envio individualizado de arquivos e demonstrativos importantes (como informes de rendimentos, faturas e relatórios). Cada envio gera um código único de rastreabilidade para auditoria de entrega.",
        routeLink: {
          label: "Acessar Transmissões Documentais",
          href: "/processes/document-delivery"
        },
        tags: ["documentos", "demonstrativos", "relatórios", "envio seguro", "validação", "código único"]
      },
      {
        id: "doc-delivery-tracking",
        question: "Como acompanhar a confirmação e entrega de documentos?",
        answer: "No painel de Transmissões Documentais, você acompanha em tempo real o status de cada envio (Enviado, Entregue, Lido), podendo reenviar ou baixar o comprovante de transmissão.",
        routeLink: {
          label: "Ver Processos Documentais",
          href: "/processes/document-delivery"
        },
        tags: ["rastreabilidade", "entrega", "status", "confirmação", "auditoria"]
      }
    ]
  },
  {
    id: "automations",
    title: "Automações & Regras",
    description: "Workflows automáticos para direcionar conversas, aplicar tags e enviar avisos",
    iconName: "Zap",
    items: [
      {
        id: "automations-intro",
        question: "Como funcionam as regras de automação?",
        answer: "As Automações executam ações programadas de acordo com gatilhos definidos (ex: recebimento de mensagem fora do horário comercial, inclusão de novo contato ou alteração de etapa no funil).",
        routeLink: {
          label: "Ver Automações",
          href: "/automations"
        },
        tags: ["automação", "gatilhos", "triggers", "regras", "respostas automáticas"]
      }
    ]
  },
  {
    id: "flows",
    title: "Chatbot Visual & Fluxos",
    description: "Construtor de menus interativos, triagem de atendimento e pesquisas",
    iconName: "Workflow",
    items: [
      {
        id: "flows-builder",
        question: "Como funciona o construtor visual de chatbot (Flow Builder)?",
        answer: "O Flow Builder permite desenhar árvores de atendimento intuitivas com botões interativos, perguntas sequenciais e coleta de dados do cliente antes da transferência para a equipe humana.",
        routeLink: {
          label: "Acessar Fluxos",
          href: "/flows"
        },
        tags: ["flow builder", "bot", "chatbot", "menu interativo", "triagem"]
      }
    ]
  },
  {
    id: "ai_assistant",
    title: "Atendimento IA & Copilot",
    description: "Assistente virtual que sugere respostas e agiliza o suporte diário",
    iconName: "Sparkles",
    items: [
      {
        id: "ai-copilot",
        question: "Como a Inteligência Artificial auxilia no atendimento?",
        answer: "O assistente de IA lê as dúvidas recebidas e sugere rascunhos de resposta diretamente na Caixa de Entrada. O operador pode revisar, editar e aprovar o texto com um clique antes do envio.",
        routeLink: {
          label: "Configurar Atendimento IA",
          href: "/ai-assistant"
        },
        tags: ["ia", "copilot", "inteligência artificial", "sugestões de resposta", "produtividade"]
      }
    ]
  },
  {
    id: "whatsapp",
    title: "Conexão WhatsApp Meta",
    description: "Integração direta com a Cloud API oficial da Meta",
    iconName: "Shield",
    items: [
      {
        id: "wa-connect",
        question: "Como conectar o WhatsApp Business API oficial da Meta?",
        answer: "Em Configurações > WhatsApp, você pode realizar a conexão rápida via Cadastro Incorporado (Embedded Signup) ou inserir seu Token de Acesso Permanente e IDs da conta da Meta.",
        routeLink: {
          label: "Configurar WhatsApp",
          href: "/settings?tab=whatsapp"
        },
        tags: ["whatsapp", "meta", "cloud api", "token", "waba"]
      },
      {
        id: "wa-24h-window",
        question: "Como funciona a Janela de Atendimento de 24 horas?",
        answer: "Quando o cliente envia uma mensagem, abre-se uma janela de 24h em que a equipe pode responder com qualquer conteúdo. Na Caixa de Entrada, um cronômetro regressivo exibe o tempo restante da janela.",
        routeLink: {
          label: "Ir para a Caixa de Entrada",
          href: "/inbox"
        },
        tags: ["24 horas", "janela de atendimento", "sessão", "regras meta"]
      }
    ]
  },
  {
    id: "team",
    title: "Equipe & Permissões",
    description: "Controle de papéis, convites de membros e níveis de acesso",
    iconName: "UsersRound",
    items: [
      {
        id: "team-roles",
        question: "Quais os níveis de permissão disponíveis para os membros da equipe?",
        answer: "O sistema disponibiliza 4 papéis com atribuições bem definidas:",
        steps: [
          "Proprietário (Owner): Gestão total do workspace, permissões administrativas e assinatura.",
          "Administrador (Admin): Configuração de equipe, integrações, regras de automação e modelos.",
          "Atendente (Agent): Operação da Caixa de Entrada, atendimento a clientes e gestão de contatos atribuídos.",
          "Visualizador (Viewer): Acesso para leitura de estatísticas e acompanhamento de relatórios sem poder de edição."
        ],
        routeLink: {
          label: "Gerenciar Equipe",
          href: "/settings?tab=members"
        },
        tags: ["permissões", "roles", "admin", "agent", "owner", "acesso"]
      }
    ]
  },
  {
    id: "plans",
    title: "Planos & Faturamento",
    description: "Gestão de limites de uso, faturamento e assinatura do workspace",
    iconName: "CreditCard",
    items: [
      {
        id: "plans-usage",
        question: "Como acompanhar os limites de consumo da conta?",
        answer: "Acesse as Configurações do sistema para verificar o número de contatos cadastrados, volume de mensagens enviadas no mês e total de atendentes ativos.",
        routeLink: {
          label: "Ver Configurações",
          href: "/settings"
        },
        tags: ["plano", "faturamento", "consumo", "assinatura", "limites"]
      }
    ]
  }
];
