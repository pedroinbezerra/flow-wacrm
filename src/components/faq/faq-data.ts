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
    title: "Início Rápido",
    description: "Primeiros passos para configurar sua empresa no Flow Hub",
    iconName: "Zap",
    items: [
      {
        id: "start-steps",
        question: "Acabei de entrar no Flow Hub pela primeira vez. Por onde devo começar?",
        answer: "Para colocar seu sistema para rodar rapidamente e atender seus clientes via WhatsApp oficial, recomendamos seguir estes 3 passos iniciais:",
        steps: [
          "Conecte seu WhatsApp Meta: Acesse Configurações > WhatsApp e insira o Token permanente, Phone Number ID e WABA ID.",
          "Traga sua equipe: Vá em Configurações > Membros da equipe e convide os atendentes e administradores.",
          "Adicione seus contatos: Acesse a tela de Contatos para importar sua base via CSV ou cadastrar manualmente."
        ],
        routeLink: {
          label: "Ir para Configurações do WhatsApp",
          href: "/settings?tab=whatsapp"
        },
        tags: ["início", "primeiros passos", "setup", "começar"]
      },
      {
        id: "guided-tour",
        question: "Como posso fazer o tour guiado pelo sistema a qualquer momento?",
        answer: "O Tour Guiado é contextual e independente para cada funcionalidade do sistema. Para uma experiência mais assertiva e detalhada:",
        steps: [
          "Navegue até a tela da funcionalidade que você deseja entender melhor (ex: Caixa de Entrada, Pipelines, Transmissões, etc.).",
          "No cabeçalho superior direito, clique no botão de Tour Guiado (ícone de bússola/mapa).",
          "O tour iniciado será específico sobre os recursos e elementos daquela tela em que você está navegando."
        ],
        tags: ["tour", "ajuda", "tutorial", "passo a passo", "funcionalidade", "contextual"]
      }
    ]
  },
  {
    id: "dashboard",
    title: "Dashboard & Métricas",
    description: "Acompanhe o ritmo de atendimento e negociações em tempo real",
    iconName: "LayoutDashboard",
    items: [
      {
        id: "dash-overview",
        question: "O que é o Dashboard e o que representam as métricas no topo?",
        answer: "O Dashboard é o painel de controle em tempo real do Flow Hub. Ele reúne dados chave do seu workspace sem precisar trocar de tela:",
        steps: [
          "Conversas Ativas: Quantidade de chats em andamento no momento.",
          "Novos Contatos Hoje: Total de novos clientes adicionados na sua base hoje.",
          "Valor de Deals Abertos: Soma financeira de todas as negociações ativas no seu Pipelines.",
          "Mensagens Enviadas Hoje: Volume total de mensagens disparadas pela sua equipe no dia."
        ],
        routeLink: {
          label: "Ver meu Dashboard",
          href: "/dashboard"
        },
        tags: ["dashboard", "métricas", "desempenho", "relatório"]
      },
      {
        id: "dash-filters",
        question: "Como posso filtrar os gráficos do Dashboard por período?",
        answer: "No gráfico principal de interações ao longo do tempo, utilize os seletores de 7 dias, 30 dias ou 90 dias localizados no topo do gráfico para ajustar o intervalo de análise.",
        routeLink: {
          label: "Ir para o Dashboard",
          href: "/dashboard"
        },
        tags: ["filtro", "período", "gráficos"]
      }
    ]
  },
  {
    id: "inbox",
    title: "Caixa de Entrada & Chat",
    description: "Atendimento multiagente em tempo real via WhatsApp",
    iconName: "MessageSquare",
    items: [
      {
        id: "inbox-multiagent",
        question: "Como funciona o atendimento multiagente na Caixa de Entrada?",
        answer: "A Caixa de Entrada centraliza todas as conversas do seu WhatsApp oficial. Vários atendentes podem trabalhar simultaneamente na mesma conta, podendo assumir chats, atribuir conversas a outros membros e utilizar modelos de mensagens.",
        routeLink: {
          label: "Abrir Caixa de Entrada",
          href: "/inbox"
        },
        tags: ["chat", "atendimento", "multiatendente", "whatsapp"]
      },
      {
        id: "inbox-features",
        question: "Como envio mídias, áudios e notas internas durante o atendimento?",
        answer: "Na barra inferior do chat aberto, você encontrará opções para enviar anexos (imagens, documentos), gravar áudios em tempo real e alternar para a aba 'Nota Interna' — que permite registrar anotações privadas visíveis apenas para a sua equipe.",
        routeLink: {
          label: "Ir para a Caixa de Entrada",
          href: "/inbox"
        },
        tags: ["áudio", "mídia", "notas internas", "anexos"]
      },
      {
        id: "inbox-resolve",
        question: "Como encerrar ou reabrir um atendimento?",
        answer: "No painel lateral do chat aberto, clique no botão 'Concluir' para arquivar ou encerrar o atendimento. Caso o cliente volte a enviar mensagem, a conversa será automaticamente reaberta ou movida para a aba correspondente.",
        routeLink: {
          label: "Ir para a Caixa de Entrada",
          href: "/inbox"
        },
        tags: ["concluir", "fechar", "reabrir", "status"]
      }
    ]
  },
  {
    id: "boards",
    title: "Boards (Kanban)",
    description: "Organização visual de conversas por status e relacionamento",
    iconName: "LayoutGrid",
    items: [
      {
        id: "boards-difference",
        question: "O que é a tela de Boards e qual a diferença para o Pipelines?",
        answer: "O Boards organiza visualmente seus contatos ativos de acordo com o status de atendimento (ex: Prioridades, Parceiros, Conversas Diretas). O Pipelines, por outro lado, foca na gestão comercial de Oportunidades/Deals com valores financeiros.",
        routeLink: {
          label: "Visualizar Boards",
          href: "/boards"
        },
        tags: ["boards", "kanban", "status", "organização"]
      },
      {
        id: "boards-move",
        question: "Como mover um contato de coluna na tela de Boards?",
        answer: "Basta clicar sobre o card do contato com o mouse (ou toque na tela), segurar e arrastá-lo para a coluna de status desejada.",
        routeLink: {
          label: "Ir para Boards",
          href: "/boards"
        },
        tags: ["arrastar", "drag and drop", "mover"]
      }
    ]
  },
  {
    id: "contacts",
    title: "Contatos & CSV",
    description: "Gestão da base de clientes, importação em massa e etiquetas",
    iconName: "Users",
    items: [
      {
        id: "contacts-import",
        question: "Como posso importar uma lista de contatos via CSV?",
        answer: "Para importar sua base de clientes em segundos, siga o passo a passo:",
        steps: [
          "Acesse a tela de Contatos no menu lateral.",
          "Clique no botão 'Importar' no canto superior direito.",
          "Faça o upload de um arquivo .CSV contendo obrigatoriamente colunas de Nome e Telefone (com DDD).",
          "Mapeie os campos e confirme a importação."
        ],
        routeLink: {
          label: "Ir para Contatos",
          href: "/contacts"
        },
        tags: ["importar", "csv", "contatos", "lista"]
      },
      {
        id: "custom-fields",
        question: "O que são os Campos Personalizados e como criá-los?",
        answer: "Campos Personalizados permitem armazenar dados específicos dos seus clientes (como CPF, CNPJ, CEP ou Origem do Lead). Você pode criá-los na tela de Contatos (clicando em 'Campos personalizados') ou em Configurações > Campos e Tags.",
        routeLink: {
          label: "Gerenciar Campos e Tags",
          href: "/settings?tab=fields"
        },
        tags: ["campos", "personalizados", "atributos", "tags"]
      }
    ]
  },
  {
    id: "pipelines",
    title: "Pipelines & Vendas",
    description: "Gestão de funil de vendas, negociações e deals monetários",
    iconName: "GitBranch",
    items: [
      {
        id: "pipelines-concept",
        question: "O que são Pipelines e Deals no Flow Hub?",
        answer: "Pipelines são quadros visuais do seu funil de vendas. Cada card representa um 'Deal' (negociação), com valor monetário associado, responsável e estágio no processo de vendas.",
        routeLink: {
          label: "Abrir Pipelines",
          href: "/pipelines"
        },
        tags: ["pipelines", "vendas", "deals", "funil"]
      },
      {
        id: "pipelines-edit-stages",
        question: "Como posso personalizar as etapas e cores do meu Pipeline?",
        answer: "Na tela de Pipelines, clique no botão 'Operação' e selecione 'Gerenciar pipelines'. Lá você poderá criar novos estágios, reordenar etapas e atribuir cores personalizadas.",
        routeLink: {
          label: "Ir para Pipelines",
          href: "/pipelines"
        },
        tags: ["etapas", "estágios", "cores", "gerenciar"]
      },
      {
        id: "pipelines-currency",
        question: "Como alterar a moeda padrão das minhas negociações?",
        answer: "Acesse Configurações > Deals e Moeda para definir a moeda utilizada no seu workspace (ex: BRL - R$, USD - $, EUR - €).",
        routeLink: {
          label: "Configurar Moeda",
          href: "/settings?tab=currency"
        },
        tags: ["moeda", "moedas", "currency", "valores"]
      }
    ]
  },
  {
    id: "broadcasts",
    title: "Transmissões em Massa",
    description: "Disparos oficiais de mensagens com modelos homologados pela Meta",
    iconName: "Radio",
    items: [
      {
        id: "broadcast-how",
        question: "O que são Transmissões e como funcionam os disparos oficiais?",
        answer: "Transmissões são envios de mensagens para múltiplos contatos ao mesmo tempo. No WhatsApp API Oficial da Meta, esses disparos utilizam modelos (HSM) pré-aprovados para garantir conformidade e entrega segura.",
        routeLink: {
          label: "Criar Transmissão",
          href: "/broadcasts"
        },
        tags: ["disparos", "transmissões", "massa", "meta", "hsm"]
      },
      {
        id: "broadcast-schedule",
        question: "Como criar e agendar um disparo de transmissão?",
        answer: "Vá em Transmissões > Nova transmissão. Escolha o modelo aprovado, filtre os destinatários por tags ou campos, personalize as variáveis de texto e escolha disparar imediatamente ou agendar para uma data e hora futuras.",
        routeLink: {
          label: "Ir para Transmissões",
          href: "/broadcasts"
        },
        tags: ["agendar", "disparar", "filtro", "modelo"]
      }
    ]
  },
  {
    id: "automations",
    title: "Automações & Gatilhos",
    description: "Workflows automáticos para otimizar a rotina operacional",
    iconName: "Zap",
    items: [
      {
        id: "automations-intro",
        question: "O que são Automações no Flow Hub?",
        answer: "Automações são regras que executam ações de forma automática quando determinados eventos ocorrem (ex: mensagem recebida fora do horário, novo contato adicionado ou tag aplicada).",
        routeLink: {
          label: "Ver Automações",
          href: "/automations"
        },
        tags: ["automação", "triggers", "gatilhos", "regras"]
      },
      {
        id: "automations-actions",
        question: "Quais ações automáticas posso disparar?",
        answer: "Você pode disparar respostas automáticas, atribuir a conversa a um atendente específico, adicionar ou remover tags de contatos e até enviar webhooks para sistemas externos.",
        routeLink: {
          label: "Ir para Automações",
          href: "/automations"
        },
        tags: ["ações", "webhook", "atribuir", "tags"]
      }
    ]
  },
  {
    id: "flows",
    title: "Fluxos & Chatbot Visual",
    description: "Construção de árvores de conversação e menus de atendimento",
    iconName: "Workflow",
    items: [
      {
        id: "flows-builder",
        question: "O que é o Flow Builder e para que ele serve?",
        answer: "O Flow Builder é o construtor visual drag & drop do Flow Hub. Com ele você cria bots de atendimento com botões interativos, menus de opção, perguntas sequenciais e triagem automática antes de transferir para um humano.",
        routeLink: {
          label: "Acessar Fluxos",
          href: "/flows"
        },
        tags: ["flow builder", "bot", "chatbot", "árvore", "menu"]
      }
    ]
  },
  {
    id: "ai_assistant",
    title: "Atendimento IA & Copilot",
    description: "Assistente de inteligência artificial treinado para sua empresa",
    iconName: "Sparkles",
    items: [
      {
        id: "ai-copilot",
        question: "Como funciona o Atendimento de IA no Flow Hub?",
        answer: "O assistente de IA pode responder dúvidas frequentes dos clientes automaticamente ou sugerir respostas rápidas para os atendentes na Caixa de Entrada, utilizando o contexto e diretrizes da sua empresa.",
        routeLink: {
          label: "Configurar Atendimento IA",
          href: "/ai-assistant"
        },
        tags: ["ia", "ai", "copilot", "inteligência artificial", "resposta automática"]
      }
    ]
  },
  {
    id: "whatsapp",
    title: "Conexão WhatsApp Meta",
    description: "Integração oficial via WhatsApp Cloud API",
    iconName: "Shield",
    items: [
      {
        id: "wa-connect",
        question: "Como conectar o WhatsApp Business API oficial da Meta?",
        answer: "Para integrar sua conta da Meta Cloud API com o Flow Hub, siga estes passos:",
        steps: [
          "Acesse Configurações > WhatsApp.",
          "Insira o Token de Acesso Permanente da Meta.",
          "Insira o ID da Conta do WhatsApp Business (WABA ID) e o ID do Número de Telefone (Phone Number ID).",
          "Clique em 'Salvar e Validar Conexão'."
        ],
        routeLink: {
          label: "Ir para Configurações de WhatsApp",
          href: "/settings?tab=whatsapp"
        },
        tags: ["whatsapp", "meta", "cloud api", "token", "waba"]
      }
    ]
  },
  {
    id: "team",
    title: "Equipe & Permissões",
    description: "Gestão de usuários, funções e controle de acesso",
    iconName: "UsersRound",
    items: [
      {
        id: "team-invite",
        question: "Como convidar novos membros para a equipe?",
        answer: "Acesse Configurações > Membros da equipe e clique em 'Convidar membro'. Digite o e-mail do colaborador e defina a função dele no sistema.",
        routeLink: {
          label: "Gerenciar Equipe",
          href: "/settings?tab=members"
        },
        tags: ["equipe", "convite", "membros", "usuários"]
      },
      {
        id: "team-roles",
        question: "Quais são os níveis de permissão (Roles) no Flow Hub?",
        answer: "O sistema disponibiliza 4 papéis principais:",
        steps: [
          "Owner: Proprietário do workspace, com acesso irrestrito e controle financeiro.",
          "Admin: Administrador total de configurações, membros, modelos e pipelines.",
          "Agent: Atendente focado em responder clientes na Caixa de Entrada e gerenciar seus contatos.",
          "Viewer: Usuário de visualização apenas (leitura de relatórios sem edição)."
        ],
        routeLink: {
          label: "Ver Membros da Equipe",
          href: "/settings?tab=members"
        },
        tags: ["permissões", "roles", "admin", "agent", "owner"]
      }
    ]
  },
  {
    id: "plans",
    title: "Planos & Consumo",
    description: "Limites de uso, faturamento e assinatura",
    iconName: "CreditCard",
    items: [
      {
        id: "plans-usage",
        question: "Como verificar meu consumo ou fazer upgrade de plano?",
        answer: "Acesse a área de Configurações para conferir o uso atual do seu workspace (limite de contatos, mensagens e membros) e gerenciar os detalhes da sua assinatura.",
        routeLink: {
          label: "Ver Configurações",
          href: "/settings"
        },
        tags: ["plano", "faturamento", "consumo", "upgrade", "assinatura"]
      }
    ]
  }
];
