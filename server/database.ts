import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { Idea, UserProfile, OnboardingStep, WikiArticle, OperationalInsight, SystemAuditLog, Comment } from '../src/types';
import fs from 'fs';
import path from 'path';

// Firebase Error Handling interfaces & enums according to instructions
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, rawPath: string | null, userId?: string) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: userId || null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path: rawPath
  };
  console.error('[DATABASE FIRESTORE ERROR] ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Safely load the Firebase configuration file from the root
let firebaseConfig: any;
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  const rawConfig = fs.readFileSync(configPath, 'utf8');
  firebaseConfig = JSON.parse(rawConfig);
} catch (err) {
  console.error('[DATABASE FAILED TO LOAD FIREBASE CONFIG] Falling back:', err);
  firebaseConfig = {};
}

// Initialize firebase-admin (Completely disabled as requested to use only local file storage / local_database.json)
let app: admin.app.App | null = null;
let firestoreDb: any = null;
let isDefaultFirebaseFailed = true;

console.log('[LOCAL DATABASE] Configurado para rodar exclusivamente em modo offline local (JSON). Sem conexões ao Firestore.');

export { firestoreDb };

// Helper function to prevent Firebase/Firestore gRPC connections from hanging forever due to blocked network/authentication issues
export async function runWithTimeout(promise: Promise<any>, timeoutMs: number = 10000, label: string = 'Firestore Op'): Promise<any> {
  // Override low timeouts to at least 10000ms to allow slow cloud starts
  const finalTimeout = Math.max(timeoutMs, 10000);
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`[FIREBASE TIMEOUT] ${label} excedeu tempo limite de ${finalTimeout}ms`));
    }, finalTimeout);
  });
  try {
    const res = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// Verify connection on startup
async function testConnectionOnServer() {
  if (isDefaultFirebaseFailed || !firestoreDb) {
    console.warn('[FIREBASE] Connection tested bypassed. Running in safe local in-memory fallback state.');
    return;
  }
  try {
    await runWithTimeout(firestoreDb.collection('users').limit(1).get(), 2000, 'Test Connection');
    console.log('[FIREBASE] Connection tested successfully on server startup.');
  } catch (error) {
    console.warn("[FIREBASE] Connection warning. Note: This is expected if local network offline. Error details:", error);
  }
}
testConnectionOnServer();

// Initial database lists preserved as static assets for bootstrapping empty instances
export const initialUsers: UserProfile[] = [
  {
    id: 'user_marcos',
    name: 'Marcos de Souza Silva',
    email: 'marcos.silva@firjan.com.br',
    password: 'firjan123',
    role: 'Colaborador',
    department: 'Suporte Operacional e Produção',
    points: 380,
    badges: ['Inovador Iniciante', 'Onboarding Completo', 'Colaborador Ativo'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    matricula: '9827361',
    setor: 'SENAI',
    unidade: 'SENAI Maracanã',
    estado: 'RJ',
    cidade: 'Rio de Janeiro'
  },
  {
    id: 'user_camila',
    name: 'Camila Santos de Oliveira',
    email: 'camila.santos@firjan.com.br',
    password: 'firjan123',
    role: 'Líder/Gestor',
    department: 'Inovação, TI e Transformação Digital',
    points: 750,
    badges: ['Mentora de Ideias', 'Líder Ágil', 'Campeã de Economia'],
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    matricula: '7218452',
    setor: 'SESI',
    unidade: 'SESI Duque de Caxias',
    estado: 'RJ',
    cidade: 'Duque de Caxias'
  },
  {
    id: 'user_roberto',
    name: 'Roberto Azevedo Menezes',
    email: 'roberto.azevedo@firjan.com.br',
    password: 'firjan123',
    role: 'Comissão Avaliadora',
    department: 'Planejamento Estratégico',
    points: 520,
    badges: ['Avaliador de Impacto', 'Foco em Eficiência'],
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    matricula: '4839174',
    setor: 'IEL',
    unidade: 'Sede Firjan Botafogo',
    estado: 'RJ',
    cidade: 'Rio de Janeiro'
  },
  {
    id: 'user_jessica',
    name: 'Jéssica Lima da Silva',
    email: 'jessica.lima@firjan.com.br',
    password: 'firjan123',
    role: 'Administrador',
    department: 'Recursos Humanos & Desenvolvimento',
    points: 440,
    badges: ['Guardiã da Cultura', 'Integradora Oficial'],
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    matricula: '5928173',
    setor: 'Corporativo',
    unidade: 'Sede Firjan Botafogo',
    estado: 'RJ',
    cidade: 'Rio de Janeiro'
  },
  {
    id: 'user_admin',
    name: 'Super Admin Firjan',
    email: 'admin@firjan.com.br',
    password: 'firjan123',
    role: 'Super Admin',
    department: 'Presidência e TI Central',
    points: 1200,
    badges: ['Arquiteto do Ecossistema', 'Luz da Firjan'],
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
    matricula: '0000001',
    setor: 'Corporativo',
    unidade: 'Sede Firjan Botafogo',
    estado: 'RJ',
    cidade: 'Rio de Janeiro'
  }
];

export const onboardingSteps: OnboardingStep[] = [
  {
    id: 'step_1',
    title: 'C.I.O AI • Introdução ao Ecossistema FIRJAN',
    category: 'Institucional',
    type: 'video',
    duration: '15 min',
    isCompleted: true,
    contentMarkdown: `# Bem-vindo à FIRJAN & C.I.O AI! \n\nAssista ao vídeo institucional de integração para compreender nossa missão de impulsionar a competitividade industrial do Rio de Janeiro. \n\n## O que é o C.I.O AI?\nO **Corporate Intelligence & Onboarding AI** é uma plataforma inteligente voltada à centralização, organização e disseminação do conhecimento institucional, utilizando inteligência artificial para facilitar o acesso rápido e inteligente às informações corporativas.\n\n## Conexão Digital Unificada:\n* **Pessoas:** Conecte-se com especialistas e responsáveis de cada setor.\n* **Processos & Fluxos:** Siga fluxogramas interativos e estruturados de trabalho.\n* **Documentos & Normas:** Pesquise manuais, políticas e resoluções com busca semântica.\n* **Boas práticas & Conhecimento operacional:** Acesse e colabore na nossa Wiki corporativa viva.`
  },
  {
    id: 'step_2',
    title: 'Políticas de LGPD, Conformidade e Segurança da Informação',
    category: 'Segurança',
    type: 'doc',
    duration: '20 min',
    isCompleted: true,
    contentMarkdown: `# Segurança e LGPD na FIRJAN\n\nTodos os colaboradores devem zelar pela confidencialidade dos dados das indústrias parceiras, do SESI e alunos do SENAI.\n\n### Diretrizes Principais de Segurança:\n1. **Troca de Credenciais:** Nunca compartilhe suas senhas corporativas ou códigos de acesso.\n2. **E-mail Corporativo:** Utilize exclusivamente o domínio @firjan.com.br para comunicações de trabalho.\n3. **Proteção de PII:** Dados pessoais coletados de alunos ou empresas estão protegidos em conformidade com as diretrizes da LGPD.\n4. **Estação de Trabalho:** Bloqueie seu computador sempre que se afastar da mesa (fácil atalho Windows + L).`
  },
  {
    id: 'step_3',
    title: 'Procedimentos Básicos de TI & Acessos à Rede',
    category: 'Tecnologia',
    type: 'task',
    duration: '25 min',
    isCompleted: false,
    contentMarkdown: `# Configurando seu Ambiente Tecnológico\n\nSiga os seguintes passos corporativos para estabilização da sua rotina:\n1. **Portal MinhaFirjan:** Efetue o seu primeiro acesso para visualização de contracheques e informes.\n2. **Rede VPN Segura:** Ative a VPN corporativa via FortiClient para trabalhos remotos ou híbridos.\n3. **Assinatura de Marcas:** Configure sua assinatura de e-mail personalizada com as marcas oficiais Firjan, SESI, SENAI ou IEL seguindo o manual visual.`
  },
  {
    id: 'step_4',
    title: 'Guia de Pitching, Ideias e Inovação (FIRJAN IMPACTA AI)',
    category: 'Processos',
    type: 'doc',
    duration: '15 min',
    isCompleted: false,
    contentMarkdown: `# FIRJAN IMPACTA AI • Programa de Inovação Interna\n\nO subprograma FIRJAN Impacta incentiva o pensamento crítico e a colaboração para gerar inovação operacional.\n\n### Estrutura Base para Sugestões:\n* **Identificação de Gargalos:** Detalhe o problema específico com dados reais de tempo ou custo.\n* **Solução Prática:** Proposta pragmática, viável, reduzindo etapas desnecessárias.\n* **Impacto Operacional:** Demonstre o ganho de eficiência, produtividade ou economia financeira esperada.\n\nAproveite a inteligência artificial da plataforma para analisar e aperfeiçoar sua sugestão antes de submeter à avaliação setorial!`
  },
  {
    id: 'step_5',
    title: 'Treinamento de Integração com a Cultura Organizacional',
    category: 'Institucional',
    type: 'video',
    duration: '30 min',
    isCompleted: false,
    contentMarkdown: `# Integração com a Cultura Organizacional da Firjan\n\nA cultura do ecossistema Firjan une o desenvolvimento econômico do Rio de Janeiro com a qualidade de vida do trabalhador corporativo.\n\n### Valores Centrais:\n* **Compromisso com o Futuro:** Auxiliar as indústrias fluminenses na transição tecnológica.\n* **Érica & Transparência:** Atuar em total conformidade com regras estaduais e federais.\n* **Valorização das Pessoas:** Fomentar a educação profissional continuada e o bem-estar por meio do SESI Saúde.`
  }
];

export const wikiArticles: WikiArticle[] = [
  {
    id: 'wiki_1',
    title: 'Manual de Identidade Visual Corporativa (Firjan, SESI, SENAI)',
    content: 'Este manual detalha a aplicação correta dos logotipos e fontes institucionais nas unidades do SENAI e SESI por todo o Estado do Rio de Janeiro. Recomenda o uso das cores heráldicas azuis e as regras de convivência de marca. Links para download de templates estão anexados na Intranet Firjan.',
    category: 'Institucional',
    tags: ['Design', 'Branding', 'Manual'],
    favoritesCount: 14,
    excerpt: 'Manual oficial de uso das marcas Firjan, SESI e SENAI para comunicados e vestimentas.',
    createdAt: '2026-02-12T14:00:00Z'
  },
  {
    id: 'wiki_2',
    title: 'Política de Viagens e Reembolsos Corporativos',
    content: 'Regras para ressarcimento de deslocamentos, diárias, passagens aéreas e quilometragem ao prestar serviços móveis SENAI ou visitar unidades regionais. Os relatórios devem ser submetidos no sistema SAP corporativo até o dia 25 de cada mês, acompanhados de notas fiscais válidas com o CNPJ adequado da regional.',
    category: 'Processos',
    tags: ['Reembolso', 'Financeiro', 'Viagem'],
    favoritesCount: 28,
    excerpt: 'Diretrizes de conformidade financeira para visitas corporativas e despesas operacionais.',
    createdAt: '2026-03-01T09:30:00Z'
  },
  {
    id: 'wiki_3',
    title: 'Processo Seletivo do SENAI para Cursos Gratuitos',
    content: 'Instruções operacionais para o credenciamento de bolsas de estudos no SENAI. Descreve como as secretarias acadêmicas organizam a triagem socioeconômica de candidatos das turmas do SENAI Firjan de todo o Rio de Janeiro de acordo com a regulamentação do Conselho Nacional.',
    category: 'Educação',
    tags: ['SENAI', 'Aulas', 'Bolsas'],
    favoritesCount: 35,
    excerpt: 'Fluxograma operacional de ingresso social para turmas profissionalizantes.',
    createdAt: '2026-04-10T11:15:00Z'
  },
  {
    id: 'wiki_4',
    title: 'Procedimento para Submissão de Patentes Industriais',
    content: 'Fluxo para inventores no âmbito de pesquisas do SENAI CETIQT ou do Instituto SENAI de Tecnologia. Compreende a realização de pesquisas de anterioridade com auxílio de IA, elaboração de relatórios descritivos, preenchimento de formulários do INPI e suporte de consultoria jurídica especializada da Firjan.',
    category: 'Tecnologia',
    tags: ['Patente', 'Inovação', 'SENAI CETIQT'],
    favoritesCount: 19,
    excerpt: 'Passo a passo legal e técnico para proteção de propriedade intelectual industrial.',
    createdAt: '2026-05-02T16:45:00Z'
  }
];

export const initialIdeas: Idea[] = [
  {
    id: 'idea_1',
    title: 'Roteirização Inteligente de Equipes de Saúde SESI RJ',
    description: 'Roteirizar com auxílio de inteligência computacional os ônibus de atendimento médico do SESI Rio que viajam por municípios fluminenses prestando exames preventivos de saúde ocupacional.',
    problem: 'Os custos de combustível das unidades de saúde móvel do SESI estão flutuando com sobreposição de rotas. Equipes de manutenção às vezes cruzam as mesmas cidades no mesmo dia sem consolidação logística.',
    solution: 'Implementar um resolvedor matemático de rotas de frota (Vehicle Routing Problem) que integra o calendário de exames preventivos corporativos com a geografia de deslocamento das equipes médicas fluminenses.',
    impactExpected: 'Economia direta de combustível, maior agilidade no atendimento e redução de 20% no desgaste dos veículos de saúde.',
    category: 'Eficiência Operacional',
    authorId: 'user_marcos',
    authorName: 'Marcos de Souza Silva',
    authorDept: 'Suporte Operacional e Produção',
    status: 'Em implementação',
    likes: 18,
    likedBy: ['user_camila', 'user_roberto'],
    comments: [
      {
        id: 'c1',
        authorName: 'Camila Santos de Oliveira',
        text: 'Excelente iniciativa, Marcos! Já temos conexões de telemetria que podem acelerar a alimentação dos dados.',
        createdAt: '2026-05-20T10:00:05Z'
      }
    ],
    pointsRewarded: 100,
    aiReview: {
      summary: 'Esta ideia foca na otimização logística das frotas de saúde móvel do SESI através de roteirização georreferenciada.',
      estimatedImpact: 'Alto potencial de eficiência logística, consolidando rotas geográficas intermunicipais.',
      suggestions: [
        'Integrar com as agendas regionais da Firjan para alinhar visitas na mesma microrregião.',
        'Considerar o tempo de deslocamento com margem para tráfego nas rodovias estaduais fluminenses.',
        'Desenvolver um piloto visual com 3 unidades móveis antes de expandir para toda a frota do Rio.'
      ],
      isDuplicate: false,
      priority: 'Alta',
      operationalSaving: 'R$ 140.000/ano'
    },
    createdAt: '2026-05-19T08:30:00Z',
    approvalHistory: [
      { stageId: 0, approver: 'Marcos de Souza Silva', role: 'Colaborador', date: '19/05/2026', action: 'submitted', comment: 'Roteirização integrada georreferenciada de frotas médicas.' },
      { stageId: 1, approver: 'Camila Santos de Oliveira', role: 'Líder/Gestor', date: '20/05/2026', action: 'approved', comment: 'Excelente viabilidade operacional. Alinhado com as frotas regionais.' },
      { stageId: 2, approver: 'Roberto Azevedo Menezes', role: 'Comissão Avaliadora', date: '21/05/2026', action: 'approved', comment: 'Viabilidade técnica e financeira confirmada. ROI robusto em médio prazo.' },
      { stageId: 3, approver: 'Super Admin Firjan', role: 'Super Admin', date: '23/05/2026', action: 'approved', comment: 'Aprovado para início em execução imediata pela presidência.' }
    ],
    currentStage: 4
  },
  {
    id: 'idea_2',
    title: 'Desburocratização de Matrícula no SENAI via Processo de Assinatura Digital',
    description: 'Substituir a entrega e assinatura manual de termos acadêmicos físicos por links SMS/E-mail com criptografia e validador biométrico nacional.',
    problem: 'As secretarias das escolas SENAI enfrentam imensas filas no início do semestre letivo. O consumo de papel e energia é alto e os termos físicos são suscetíveis a perdas.',
    solution: 'Digitalização completa com formulários mobile-friendly. O aluno recebe o contrato via celular e assina digitalmente através de identificação biométrica facial integrada à base governamental.',
    impactExpected: 'Eliminação completa de papel de admissão, redução de 80% no tempo médio das secretarias acadêmicas fluminenses.',
    category: 'Eficiência Operacional',
    authorId: 'user_jessica',
    authorName: 'Jéssica Lima da Silva',
    authorDept: 'Recursos Humanos & Desenvolvimento',
    status: 'Aprovado',
    likes: 24,
    likedBy: ['user_marcos', 'user_roberto', 'user_camila'],
    comments: [],
    pointsRewarded: 150,
    aiReview: {
      summary: 'Migração ágil de matrículas físicas presenciais do SENAI para modelo de assinatura digital criptografado.',
      estimatedImpact: 'Redução astronômica de filas e de custos de insumos administrativos (papel/impressão).',
      suggestions: [
        'Iniciar o projeto no campus SENAI Maracanã por contar com maior volume operacional de suporte letivo.',
        'Assegurar conformidade jurídica rígida de acordo com a lei federal de assinaturas eletrônicas.',
        'Oferecer quiosque de autoatendimento digital nas regionais para alunos que não dispõem de smartphone.'
      ],
      isDuplicate: false,
      priority: 'Alta',
      operationalSaving: 'R$ 380.000/ano'
    },
    createdAt: '2026-05-21T11:45:00Z',
    approvalHistory: [
      { stageId: 0, approver: 'Jéssica Lima da Silva', role: 'Colaborador', date: '21/05/2026', action: 'submitted', comment: 'Desburocratização de matrículas via assinatura biométrica.' },
      { stageId: 1, approver: 'Camila Santos de Oliveira', role: 'Líder/Gestor', date: '22/05/2026', action: 'approved', comment: 'Aprovado. Eliminará filas intensas das secretarias.' },
      { stageId: 2, approver: 'Roberto Azevedo Menezes', role: 'Comissão Avaliadora', date: '22/05/2026', action: 'approved', comment: 'Perfeita conformidade com regras regulatórias e LGPD.' },
      { stageId: 3, approver: 'Super Admin Firjan', role: 'Super Admin', date: '23/05/2026', action: 'approved', comment: 'Sancionado com orçamento administrativo.' }
    ],
    currentStage: 4
  },
  {
    id: 'idea_3',
    title: 'Gamificação Ecológica nas Cantinas Compartilhadas SESI',
    description: 'Campanha integrada por aplicativo para premiar alunos e colaboradores Firjan que evitam o descarte desnecessário de copos descartáveis e bandejas de refeitório.',
    problem: 'O desperdício nas cantinas ainda é expressivo, e o descarte de materiais recicláveis misturados reduz o indicador de sustentabilidade da FIRJAN.',
    solution: 'Inserir QR Codes colecionáveis para alunos que trazem suas próprias canecas. Cada verificação reverte em moedas digitais corporativas trocáveis por descontos em cursos SENAI ou brindes SESI.',
    impactExpected: 'Engajamento comunitário jovem, redução de resíduos plásticos em 45% nas unidades selecionadas.',
    category: 'Sustentabilidade',
    authorId: 'user_marcos',
    authorName: 'Marcos de Souza Silva',
    authorDept: 'Suporte Operacional e Produção',
    status: 'Em análise',
    likes: 7,
    likedBy: [],
    comments: [],
    pointsRewarded: 0,
    createdAt: '2026-05-22T15:20:00Z',
    approvalHistory: [
      { stageId: 0, approver: 'Marcos de Souza Silva', role: 'Colaborador', date: '22/05/2026', action: 'submitted', comment: 'Moedas virtuais ecológicas para alunos da regional.' },
      { stageId: 1, approver: null, role: 'Líder/Gestor', date: null, action: 'pending', comment: null },
      { stageId: 2, approver: null, role: 'Comissão Avaliadora', date: null, action: 'pending', comment: null },
      { stageId: 3, approver: null, role: 'Administrador', date: null, action: 'pending', comment: null }
    ],
    currentStage: 1
  }
];

export const initialInsights: OperationalInsight[] = [
  {
    id: 'insight_1',
    type: 'retrabalho',
    title: 'Duplicidade de Relacionamento de CRM Regional',
    description: 'Identificamos que consultores regionais SESI e promotores do SENAI estão visitando as mesmas indústrias fluminenses de médio porte em intervalos menores de 48 horas, sem compartilhamento prévio da agenda comercial de propostas.',
    impact: 'Sobrecarga de e-mails para o empresário parceiro e fadiga comercial, reduzindo a taxa de conversão final de matrículas corporativas em 12%.',
    recommendation: 'Sincronizar feeds de prospecção do SESI e do SENAI no mesmo funil unificado regionalizado.',
    area: 'Relações Industriais & Mercado',
    detectedAt: '2026-05-21T18:00:00Z',
    status: 'Pendente'
  },
  {
    id: 'insight_2',
    type: 'processo lento',
    title: 'Prazos Extensos em Homologação de Fornecedores SENAI rj',
    description: 'A validação fiscal de fornecedores de laboratórios técnicos do SENAI está levando em média 22 dias corridos devido ao acréscimo de aprovações desnecessárias por dependências hierárquicas.',
    impact: 'Atrasos em entregas de peças de torno mecânico CNC, impactando cronogramas de turmas operacionais SENAI Firjan.',
    recommendation: 'IA de triagem rápida para checar certidões negativas automaticamente, delegando a assinatura física manual apenas a casos de alerta tributário.',
    area: 'Finanças e Suprimentos',
    detectedAt: '2026-05-22T09:00:00Z',
    status: 'Analisando'
  },
  {
    id: 'insight_3',
    type: 'gargalo',
    title: 'Triagem de Dúvidas na Ouvidoria SESI e SENAI',
    description: 'Cerca de 42% das mensagens dos canais de suporte tratam de perguntas de curtíssimo teor como calendário escolar e links de boletos que poderiam ser resolvidos em autoatendimento.',
    impact: 'Estagnação de demandas cruciais de denúncias ou propostas comerciais.',
    recommendation: 'Fortalecer a busca Firjan Connect IA e fixar links rápidos na área de canais de alunos.',
    area: 'Atendimento do Aluno e Secretaria',
    detectedAt: '2026-05-23T10:30:00Z',
    status: 'Analisando'
  }
];

export const initialAuditLogs: SystemAuditLog[] = [
  {
    id: 'log_1',
    timestamp: '2026-05-23T22:30:00Z',
    userId: 'user_marcos',
    userName: 'Marcos de Souza Silva',
    action: 'Criação de Ideia',
    details: 'Visualizou e registrou rascunho de nova ideia sustentável para cantina.',
    ip: '10.150.2.14'
  },
  {
    id: 'log_2',
    timestamp: '2026-05-23T22:45:00Z',
    userId: 'user_camila',
    userName: 'Camila Santos de Oliveira',
    action: 'Avaliação de Ideia',
    details: 'Aprovou a Roteirização de Equipe SESI para fase de implementação.',
    ip: '10.150.8.210'
  },
  {
    id: 'log_3',
    timestamp: '2026-05-23T22:50:00Z',
    userId: 'user_admin',
    userName: 'Super Admin Firjan',
    action: 'Configurações do Sistema',
    details: 'Atualizou chaves de permissão do comitê de comissão avaliadora.',
    ip: '10.15.5.99'
  }
];

// DatabaseStore with actual Cloud Administrative Service SDK (firebase-admin)
class DatabaseStore {
  private localUsers: UserProfile[] = [...initialUsers];
  private localOnboarding: OnboardingStep[] = [...onboardingSteps];
  private localWiki: WikiArticle[] = [...wikiArticles];
  private localIdeas: Idea[] = [...initialIdeas];
  private localInsights: OperationalInsight[] = [...initialInsights];
  private localLogs: SystemAuditLog[] = [...initialAuditLogs];
  public isFallbackMode = true;

  constructor() {
    this.isFallbackMode = true;
    this.load();
  }

  // Helper to get path which is writable even in read-only environments (like Vercel)
  private getDbPath(): string {
    if (process.env.VERCEL) {
      const tempPath = path.join('/tmp', 'local_database.json');
      // If the writeable /tmp file doesn't exist, try initializing it from the read-only workspace template
      if (!fs.existsSync(tempPath)) {
        try {
          const rootPath = path.join(process.cwd(), 'local_database.json');
          if (fs.existsSync(rootPath)) {
            fs.copyFileSync(rootPath, tempPath);
            console.log('[LOCAL STORE] Banco inicial copiado para o diretório temporário /tmp.');
          }
        } catch (copyErr) {
          console.error('[LOCAL STORE] Falha ao copiar base inicial para /tmp:', copyErr);
        }
      }
      return tempPath;
    }
    return path.join(process.cwd(), 'local_database.json');
  }

  // Save all local data to local_database.json for persistent offline storage
  private persist() {
    try {
      const dbPath = this.getDbPath();
      const data = {
        users: this.localUsers,
        onboarding: this.localOnboarding,
        wiki: this.localWiki,
        ideas: this.localIdeas,
        insights: this.localInsights,
        logs: this.localLogs
      };
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.error('[LOCAL STORE WRITE FAIL]', err);
    }
  }

  // Load all local data from local_database.json if exists
  private load() {
    try {
      const dbPath = this.getDbPath();
      if (fs.existsSync(dbPath)) {
        const raw = fs.readFileSync(dbPath, 'utf8');
        const data = JSON.parse(raw);
        if (data.users) this.localUsers = data.users;
        if (data.onboarding) this.localOnboarding = data.onboarding;
        if (data.wiki) this.localWiki = data.wiki;
        if (data.ideas) this.localIdeas = data.ideas;
        if (data.insights) this.localInsights = data.insights;
        if (data.logs) this.localLogs = data.logs;
        console.log('[LOCAL STORE] Dados do banco offline carregados com sucesso de:', dbPath);
      } else {
        this.persist();
        console.log('[LOCAL STORE] Banco de dados offline criado e semeado inicialmente em:', dbPath);
      }
    } catch (err) {
      console.error('[LOCAL STORE LOAD FAIL]', err);
    }
  }

  // Bootstrap Firestore database if empty on start
  async bootstrap() {
    this.isFallbackMode = true;
    this.load();
    console.log('[LOCAL DATABASE] Inicialização realizada com sucesso utilizando persistência em arquivo JSON local.');
  }

  // Clear/Reset entire database to the initial seed state
  async resetDatabase() {
    console.log('[LOCAL STORE] Resetando banco de dados para o estado inicial padrão...');
    this.localUsers = JSON.parse(JSON.stringify(initialUsers));
    this.localOnboarding = JSON.parse(JSON.stringify(onboardingSteps));
    this.localWiki = JSON.parse(JSON.stringify(wikiArticles));
    this.localIdeas = JSON.parse(JSON.stringify(initialIdeas));
    this.localInsights = JSON.parse(JSON.stringify(initialInsights));
    this.localLogs = JSON.parse(JSON.stringify(initialAuditLogs));
    this.persist();
  }

  // Users Collection
  async getUsers(): Promise<UserProfile[]> {
    try {
      if (this.isFallbackMode) return this.localUsers;
      const snap = await runWithTimeout(firestoreDb.collection('users').get(), 2000, 'getUsers');
      const list = snap.docs.map(d => d.data() as UserProfile);
      this.localUsers = list;
      return list;
    } catch (err) {
      console.warn('[FIREBASE FETCH FAIL] Falling back to in-memory users. Error:', err);
      this.isFallbackMode = true;
      return this.localUsers;
    }
  }

  async getUserById(id: string): Promise<UserProfile | null> {
    try {
      if (this.isFallbackMode) return this.localUsers.find(u => u.id === id) || null;
      const snap = await runWithTimeout(firestoreDb.collection('users').doc(id).get(), 2000, 'getUserById');
      if (!snap.exists) return null;
      return snap.data() as UserProfile;
    } catch (err) {
      console.warn('[FIREBASE FETCH FAIL] Falling back to in-memory user by ID. Error:', err);
      this.isFallbackMode = true;
      return this.localUsers.find(u => u.id === id) || null;
    }
  }

  async getUserByEmail(email: string): Promise<UserProfile | null> {
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (this.isFallbackMode) return this.localUsers.find(u => u.email.trim().toLowerCase() === cleanEmail) || null;
      const q = firestoreDb.collection('users').where('email', '==', cleanEmail);
      const snap = await runWithTimeout(q.get(), 2000, 'getUserByEmail');
      if (!snap.empty) {
        return snap.docs[0].data() as UserProfile;
      }
      return null;
    } catch (err) {
      console.warn('[FIREBASE FETCH FAIL] Falling back to in-memory user by email. Error:', err);
      this.isFallbackMode = true;
      const cleanEmail = email.trim().toLowerCase();
      return this.localUsers.find(u => u.email.trim().toLowerCase() === cleanEmail) || null;
    }
  }

  async createUser(user: UserProfile): Promise<void> {
    const idx = this.localUsers.findIndex(u => u.id === user.id);
    if (idx !== -1) this.localUsers[idx] = user;
    else this.localUsers.push(user);

    try {
      if (this.isFallbackMode) {
        this.persist();
        await this.addLog(user.id, user.name, 'Autoregistro OAuth', `Novo usuário cadastrado automaticamente com domínio @firjan.com.br (fallback local)`);
        return;
      }
      await runWithTimeout(firestoreDb.collection('users').doc(user.id).set(user), 2000, 'createUser');
      await this.addLog(user.id, user.name, 'Autoregistro OAuth', `Novo usuário cadastrado automaticamente com domínio @firjan.com.br`);
    } catch (err) {
      console.warn('[FIREBASE WRITE FAIL] Falling back to in-memory createUser. Error:', err);
      this.isFallbackMode = true;
      this.persist();
      await this.addLog(user.id, user.name, 'Autoregistro OAuth', `Novo usuário cadastrado automaticamente com domínio @firjan.com.br (fallback local)`);
    }
  }

  async updateUser(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const idx = this.localUsers.findIndex(u => u.id === userId);
    let updatedUser: UserProfile | null = null;
    if (idx !== -1) {
      this.localUsers[idx] = { ...this.localUsers[idx], ...updates };
      updatedUser = this.localUsers[idx];
    }

    try {
      if (this.isFallbackMode) {
        this.persist();
        return updatedUser;
      }
      const userRef = firestoreDb.collection('users').doc(userId);
      const snap = await runWithTimeout(userRef.get(), 2000, 'updateUser_get');
      if (!snap.exists) return null;
      const existingUser = snap.data() as UserProfile;
      const cloudUpdated = { ...existingUser, ...updates };
      await runWithTimeout(userRef.set(cloudUpdated), 2000, 'updateUser_set');
      return cloudUpdated;
    } catch (err) {
      console.warn('[FIREBASE WRITE FAIL] Falling back to in-memory updateUser. Error:', err);
      this.isFallbackMode = true;
      this.persist();
      return updatedUser;
    }
  }

  async redeemPoints(userId: string, itemPrice: number): Promise<number | null> {
    const idx = this.localUsers.findIndex(u => u.id === userId);
    if (idx !== -1) {
      const user = this.localUsers[idx];
      if (user.points >= itemPrice) {
        user.points -= itemPrice;
      }
    }

    try {
      if (this.isFallbackMode) {
        this.persist();
        const u = this.localUsers.find(usr => usr.id === userId);
        return u ? u.points : null;
      }
      const userRef = firestoreDb.collection('users').doc(userId);
      const snap = await runWithTimeout(userRef.get(), 2000, 'redeemPoints_get');
      if (!snap.exists) return null;
      const user = snap.data() as UserProfile;
      if (user.points < itemPrice) throw new Error('Saldo insuficiente.');
      const updatedPoints = user.points - itemPrice;
      await runWithTimeout(userRef.update({ points: updatedPoints }), 2000, 'redeemPoints_update');
      return updatedPoints;
    } catch (err) {
      console.warn('[FIREBASE WRITE FAIL] Falling back to in-memory redeemPoints. Error:', err);
      this.isFallbackMode = true;
      this.persist();
      const u = this.localUsers.find(usr => usr.id === userId);
      return u ? u.points : null;
    }
  }

  // Ideas Collection
  async getIdeas(): Promise<Idea[]> {
    try {
      if (this.isFallbackMode) return [...this.localIdeas].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const snap = await runWithTimeout(firestoreDb.collection('ideas').get(), 2000, 'getIdeas');
      const list = snap.docs.map(d => d.data() as Idea);
      this.localIdeas = list;
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.warn('[FIREBASE FETCH FAIL] Falling back to in-memory getIdeas. Error:', err);
      this.isFallbackMode = true;
      return [...this.localIdeas].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }

  async addIdea(idea: Idea): Promise<void> {
    if (!idea.approvalHistory) {
      idea.approvalHistory = [
        { stageId: 0, approver: idea.authorName, role: 'Colaborador', date: new Date().toLocaleDateString('pt-BR'), action: 'submitted', comment: 'Sugestão submetida via Plataforma Impacta AI.' },
        { stageId: 1, approver: null, role: 'Líder/Gestor', date: null, action: 'pending', comment: null },
        { stageId: 2, approver: null, role: 'Comissão Avaliadora', date: null, action: 'pending', comment: null },
        { stageId: 3, approver: null, role: 'Administrador', date: null, action: 'pending', comment: null }
      ];
      idea.currentStage = 1;
    }
    const idx = this.localIdeas.findIndex(i => i.id === idea.id);
    if (idx !== -1) this.localIdeas[idx] = idea;
    else this.localIdeas.push(idea);

    try {
      if (this.isFallbackMode) {
        this.persist();
        await this.addLog(idea.authorId, idea.authorName, 'Criação de Ideia', `Cadastrou a ideia (local): "${idea.title}"`);
        return;
      }
      await runWithTimeout(firestoreDb.collection('ideas').doc(idea.id).set(idea), 2000, 'addIdea');
      await this.addLog(idea.authorId, idea.authorName, 'Criação de Ideia', `Cadastrou a ideia: "${idea.title}"`);
    } catch (err) {
      console.warn('[FIREBASE WRITE FAIL] Falling back to in-memory addIdea. Error:', err);
      this.isFallbackMode = true;
      this.persist();
      await this.addLog(idea.authorId, idea.authorName, 'Criação de Ideia', `Cadastrou a ideia (local): "${idea.title}"`);
    }
  }

  async likeIdea(ideaId: string, userId: string, userName: string) {
    const runLocalLike = () => {
      const idea = this.localIdeas.find(i => i.id === ideaId);
      if (!idea) return null;
      if (!idea.likedBy) idea.likedBy = [];
      const index = idea.likedBy.indexOf(userId);
      let status = 'liked';
      if (index === -1) {
        idea.likedBy.push(userId);
        idea.likes += 1;
        status = 'liked';
        const author = this.localUsers.find(u => u.id === idea.authorId);
        if (author) author.points += 10;
      } else {
        idea.likedBy.splice(index, 1);
        idea.likes -= 1;
        status = 'unliked';
        const author = this.localUsers.find(u => u.id === idea.authorId);
        if (author && author.points >= 10) author.points -= 10;
      }
      return { status, likes: idea.likes };
    };

    const localResult = runLocalLike();

    try {
      if (this.isFallbackMode) {
        this.persist();
        if (localResult) {
          await this.addLog(userId, userName, localResult.status === 'liked' ? 'Curtida em Ideia' : 'Remoção de Curtida', `${localResult.status === 'liked' ? 'Curtiu' : 'Descurtiu'} a ideia "${ideaId}" (local)`);
        }
        return localResult;
      }
      const ideaRef = firestoreDb.collection('ideas').doc(ideaId);
      const snap = await ideaRef.get();
      if (!snap.exists) return null;
      const idea = snap.data() as Idea;
      if (!idea.likedBy) idea.likedBy = [];
      const index = idea.likedBy.indexOf(userId);
      let status = 'liked';

      if (index === -1) {
        idea.likedBy.push(userId);
        idea.likes += 1;
        status = 'liked';
        const authorRef = firestoreDb.collection('users').doc(idea.authorId);
        const authorSnap = await authorRef.get();
        if (authorSnap.exists) {
          const author = authorSnap.data() as UserProfile;
          await authorRef.update({ points: author.points + 10 });
        }
      } else {
        idea.likedBy.splice(index, 1);
        idea.likes -= 1;
        status = 'unliked';
        const authorRef = firestoreDb.collection('users').doc(idea.authorId);
        const authorSnap = await authorRef.get();
        if (authorSnap.exists) {
          const author = authorSnap.data() as UserProfile;
          if (author.points >= 10) {
            await authorRef.update({ points: author.points - 10 });
          }
        }
      }

      await ideaRef.set(idea);
      await this.addLog(userId, userName, status === 'liked' ? 'Curtida em Ideia' : 'Remoção de Curtida', `${status === 'liked' ? 'Curtiu' : 'Descurtiu'} a ideia "${idea.title}"`);
      return { status, likes: idea.likes };
    } catch (err) {
      console.warn('[FIREBASE WRITE FAIL] Falling back to in-memory likeIdea. Error:', err);
      this.isFallbackMode = true;
      this.persist();
      if (localResult) {
        await this.addLog(userId, userName, localResult.status === 'liked' ? 'Curtida em Ideia' : 'Remoção de Curtida', `${localResult.status === 'liked' ? 'Curtiu' : 'Descurtiu'} a ideia "${ideaId}" (local)`);
      }
      return localResult;
    }
  }

  async addComment(ideaId: string, comment: Comment, userId: string, userName: string) {
    const runLocalComment = () => {
      const idea = this.localIdeas.find(i => i.id === ideaId);
      if (!idea) return null;
      if (!idea.comments) idea.comments = [];
      idea.comments.push(comment);
      const commenter = this.localUsers.find(u => u.id === userId);
      if (commenter) commenter.points += 15;
      return idea;
    };

    const localResult = runLocalComment();

    try {
      if (this.isFallbackMode) {
        this.persist();
        if (localResult) {
          await this.addLog(userId, userName, 'Comentário em Ideia', `Comentou na ideia "${localResult.title}" (local)`);
        }
        return localResult;
      }
      const ideaRef = firestoreDb.collection('ideas').doc(ideaId);
      const snap = await ideaRef.get();
      if (!snap.exists) return null;
      const idea = snap.data() as Idea;
      if (!idea.comments) idea.comments = [];
      idea.comments.push(comment);
      
      await ideaRef.set(idea);

      const commenterRef = firestoreDb.collection('users').doc(userId);
      const commenterSnap = await commenterRef.get();
      if (commenterSnap.exists) {
        const commenter = commenterSnap.data() as UserProfile;
        await commenterRef.update({ points: commenter.points + 15 });
      }

      await this.addLog(userId, userName, 'Comentário em Ideia', `Comentou na ideia "${idea.title}"`);
      return idea;
    } catch (err) {
      console.warn('[FIREBASE WRITE FAIL] Falling back to in-memory addComment. Error:', err);
      this.isFallbackMode = true;
      if (localResult) {
        await this.addLog(userId, userName, 'Comentário em Ideia', `Comentou na ideia "${localResult.title}" (local)`);
      }
      return localResult;
    }
  }

  async updateIdeaStatus(ideaId: string, status: Idea['status'], userId: string, userName: string, pointsRewarded = 0, stageComments?: string) {
    const runLocalUpdate = () => {
      const idea = this.localIdeas.find(i => i.id === ideaId);
      if (!idea) return null;
      idea.status = status;
      if (pointsRewarded > 0) {
        idea.pointsRewarded = (idea.pointsRewarded || 0) + pointsRewarded;
        const author = this.localUsers.find(u => u.id === idea.authorId);
        if (author) author.points += pointsRewarded;
      }
      if (!idea.approvalHistory) {
        idea.approvalHistory = [
          { stageId: 0, approver: idea.authorName, role: 'Colaborador', date: idea.createdAt || new Date().toLocaleDateString('pt-BR'), action: 'submitted', comment: 'Sugestão inicial.' },
          { stageId: 1, approver: null, role: 'Líder/Gestor', date: null, action: 'pending', comment: null },
          { stageId: 2, approver: null, role: 'Comissão Avaliadora', date: null, action: 'pending', comment: null },
          { stageId: 3, approver: null, role: 'Administrador', date: null, action: 'pending', comment: null }
        ];
        idea.currentStage = 1;
      }
      const reviewer = this.localUsers.find(u => u.id === userId);
      if (reviewer) {
        const userRole = reviewer.role;
        let matchedStage = -1;
        if (userRole === 'Líder/Gestor') matchedStage = 1;
        else if (userRole === 'Comissão Avaliadora') matchedStage = 2;
        else if (userRole === 'Administrador' || userRole === 'Super Admin') matchedStage = 3;

        if (matchedStage !== -1) {
          const stepIndex = idea.approvalHistory.findIndex(h => h.stageId === matchedStage);
          if (stepIndex !== -1) {
            const currentStep = idea.approvalHistory[stepIndex];
            currentStep.approver = userName;
            currentStep.date = new Date().toLocaleDateString('pt-BR');
            if (status === 'Reprovado') {
              currentStep.action = 'rejected';
            } else if (status === 'Solicitar Ajuste') {
              currentStep.action = 'revision';
            } else {
              currentStep.action = 'approved';
              idea.currentStage = matchedStage + 1;
            }
            if (stageComments) {
              currentStep.comment = stageComments;
            }
          }
        }
      }
      return idea;
    };

    const localResult = runLocalUpdate();

    try {
      if (this.isFallbackMode) {
        this.persist();
        if (localResult) {
          await this.addLog(userId, userName, 'Alteração de Status', `Atualizou o status da ideia "${localResult.title}" para "${status}" (local)`);
        }
        return localResult;
      }
      const ideaRef = firestoreDb.collection('ideas').doc(ideaId);
      const snap = await ideaRef.get();
      if (!snap.exists) return null;
      const idea = snap.data() as Idea;

      idea.status = status;
      if (pointsRewarded > 0) {
        idea.pointsRewarded = (idea.pointsRewarded || 0) + pointsRewarded;
        const authorRef = firestoreDb.collection('users').doc(idea.authorId);
        const authorSnap = await authorRef.get();
        if (authorSnap.exists) {
          const author = authorSnap.data() as UserProfile;
          await authorRef.update({ points: author.points + pointsRewarded });
        }
      }

      if (!idea.approvalHistory) {
        idea.approvalHistory = [
          { stageId: 0, approver: idea.authorName, role: 'Colaborador', date: idea.createdAt || new Date().toLocaleDateString('pt-BR'), action: 'submitted', comment: 'Sugestão inicial.' },
          { stageId: 1, approver: null, role: 'Líder/Gestor', date: null, action: 'pending', comment: null },
          { stageId: 2, approver: null, role: 'Comissão Avaliadora', date: null, action: 'pending', comment: null },
          { stageId: 3, approver: null, role: 'Administrador', date: null, action: 'pending', comment: null }
        ];
        idea.currentStage = 1;
      }

      const reviewerRef = firestoreDb.collection('users').doc(userId);
      const reviewerSnap = await reviewerRef.get();
      if (reviewerSnap.exists) {
        const reviewer = reviewerSnap.data() as UserProfile;
        const userRole = reviewer.role;
        let matchedStage = -1;
        if (userRole === 'Líder/Gestor') matchedStage = 1;
        else if (userRole === 'Comissão Avaliadora') matchedStage = 2;
        else if (userRole === 'Administrador' || userRole === 'Super Admin') matchedStage = 3;

        if (matchedStage !== -1) {
          const stepIndex = idea.approvalHistory.findIndex(h => h.stageId === matchedStage);
          if (stepIndex !== -1) {
            const currentStep = idea.approvalHistory[stepIndex];
            currentStep.approver = userName;
            currentStep.date = new Date().toLocaleDateString('pt-BR');
            
            if (status === 'Reprovado') {
              currentStep.action = 'rejected';
            } else if (status === 'Solicitar Ajuste') {
              currentStep.action = 'revision';
            } else {
              currentStep.action = 'approved';
              idea.currentStage = matchedStage + 1;
            }
            if (stageComments) {
              currentStep.comment = stageComments;
            }
          }
        }
      }

      await ideaRef.set(idea);
      await this.addLog(userId, userName, 'Alteração de Status', `Atualizou o status da ideia "${idea.title}" para "${status}"`);
      return idea;
    } catch (err) {
      console.warn('[FIREBASE WRITE FAIL] Falling back to in-memory updateIdeaStatus. Error:', err);
      this.isFallbackMode = true;
      this.persist();
      if (localResult) {
        await this.addLog(userId, userName, 'Alteração de Status', `Atualizou o status da ideia "${localResult.title}" para "${status}" (local)`);
      }
      return localResult;
    }
  }

  // Wiki Collection
  async getWikiArticles(): Promise<WikiArticle[]> {
    try {
      if (this.isFallbackMode) return this.localWiki;
      const snap = await runWithTimeout(firestoreDb.collection('wiki').get(), 2000, 'getWikiArticles');
      const list = snap.docs.map(d => d.data() as WikiArticle);
      this.localWiki = list;
      return list;
    } catch (err) {
      console.warn('[FIREBASE FETCH FAIL] Falling back to in-memory getWikiArticles. Error:', err);
      this.isFallbackMode = true;
      return this.localWiki;
    }
  }

  async addWikiArticle(article: WikiArticle, userId: string, userName: string) {
    const idx = this.localWiki.findIndex(w => w.id === article.id);
    if (idx !== -1) this.localWiki[idx] = article;
    else this.localWiki.push(article);
    const user = this.localUsers.find(u => u.id === userId);
    if (user) user.points += 40;

    try {
      if (this.isFallbackMode) {
        this.persist();
        await this.addLog(userId, userName, 'Criação de Artigo Wiki', `Registrou o artigo wiki "${article.title}" (local)`);
        return;
      }
      await runWithTimeout(firestoreDb.collection('wiki').doc(article.id).set(article), 2000, 'addWikiArticle');
      await this.addLog(userId, userName, 'Criação de Artigo Wiki', `Registrou o artigo wiki "${article.title}"`);
      
      const userRef = firestoreDb.collection('users').doc(userId);
      const userSnap = await runWithTimeout(userRef.get(), 2000, 'addWikiArticle_getUser');
      if (userSnap.exists) {
        const u = userSnap.data() as UserProfile;
        await runWithTimeout(userRef.update({ points: u.points + 40 }), 2000, 'addWikiArticle_updateUserPoints');
      }
    } catch (err) {
      console.warn('[FIREBASE WRITE FAIL] Falling back to in-memory addWikiArticle. Error:', err);
      this.isFallbackMode = true;
      this.persist();
      await this.addLog(userId, userName, 'Criação de Artigo Wiki', `Registrou o artigo wiki "${article.title}" (local)`);
    }
  }

  async toggleFavoriteWiki(articleId: string, userId: string, userName: string) {
    const runLocalFav = () => {
      const article = this.localWiki.find(w => w.id === articleId);
      if (!article) return null;
      article.isFavorite = !article.isFavorite;
      article.favoritesCount += article.isFavorite ? 1 : -1;
      return article;
    };

    const localResult = runLocalFav();

    try {
      if (this.isFallbackMode) {
        this.persist();
        if (localResult) {
          await this.addLog(userId, userName, 'Favorito Wiki', `${localResult.isFavorite ? 'Favoritou' : 'Desfavoritou'} o artigo "${localResult.title}" (local)`);
        }
        return localResult;
      }
      const articleRef = firestoreDb.collection('wiki').doc(articleId);
      const snap = await runWithTimeout(articleRef.get(), 2000, 'toggleFavoriteWiki_get');
      if (!snap.exists) return null;
      const article = snap.data() as WikiArticle;
      article.isFavorite = !article.isFavorite;
      article.favoritesCount += article.isFavorite ? 1 : -1;
      
      await runWithTimeout(articleRef.set(article), 2000, 'toggleFavoriteWiki_set');
      await this.addLog(userId, userName, 'Favorito Wiki', `${article.isFavorite ? 'Favoritou' : 'Desfavoritou'} o artigo "${article.title}"`);
      return article;
    } catch (err) {
      console.warn('[FIREBASE WRITE FAIL] Falling back to in-memory toggleFavoriteWiki. Error:', err);
      this.isFallbackMode = true;
      this.persist();
      if (localResult) {
        await this.addLog(userId, userName, 'Favorito Wiki', `${localResult.isFavorite ? 'Favoritou' : 'Desfavoritou'} o artigo "${localResult.title}" (local)`);
      }
      return localResult;
    }
  }

  // Insights Collection
  async getInsights(): Promise<OperationalInsight[]> {
    try {
      if (this.isFallbackMode) return this.localInsights;
      const snap = await runWithTimeout(firestoreDb.collection('insights').get(), 2000, 'getInsights');
      const list = snap.docs.map(d => d.data() as OperationalInsight);
      this.localInsights = list;
      return list;
    } catch (err) {
      console.warn('[FIREBASE FETCH FAIL] Falling back to in-memory getInsights. Error:', err);
      this.isFallbackMode = true;
      return this.localInsights;
    }
  }

  async addOperationalInsight(insight: OperationalInsight, userId: string, userName: string) {
    const idx = this.localInsights.findIndex(i => i.id === insight.id);
    if (idx !== -1) this.localInsights[idx] = insight;
    else this.localInsights.push(insight);

    try {
      if (this.isFallbackMode) {
        this.persist();
        await this.addLog(userId, userName, 'Detecção de Gargalo', `IA/Analista registrou alerta operacional: "${insight.title}" (local)`);
        return;
      }
      await runWithTimeout(firestoreDb.collection('insights').doc(insight.id).set(insight), 2000, 'addOperationalInsight');
      await this.addLog(userId, userName, 'Detecção de Gargalo', `IA/Analista registrou alerta operacional: "${insight.title}"`);
    } catch (err) {
      console.warn('[FIREBASE WRITE FAIL] Falling back to in-memory addOperationalInsight. Error:', err);
      this.isFallbackMode = true;
      this.persist();
      await this.addLog(userId, userName, 'Detecção de Gargalo', `IA/Analista registrou alerta operacional: "${insight.title}" (local)`);
    }
  }

  async resolveOperationalInsight(insightId: string, status: OperationalInsight['status'], userId: string, userName: string) {
    const runLocalResolve = () => {
      const insight = this.localInsights.find(i => i.id === insightId);
      if (!insight) return null;
      insight.status = status;
      return insight;
    };

    const localResult = runLocalResolve();

    try {
      if (this.isFallbackMode) {
        this.persist();
        if (localResult) {
          await this.addLog(userId, userName, 'Atualização de Gargalo', `Retificou status do alerta "${localResult.title}" para "${status}" (local)`);
        }
        return localResult;
      }
      const ref = firestoreDb.collection('insights').doc(insightId);
      const snap = await runWithTimeout(ref.get(), 2000, 'resolveOperationalInsight_get');
      if (!snap.exists) return null;
      const insight = snap.data() as OperationalInsight;
      insight.status = status;
      await runWithTimeout(ref.set(insight), 2000, 'resolveOperationalInsight_set');
      await this.addLog(userId, userName, 'Atualização de Gargalo', `Retificou status do alerta "${insight.title}" para "${status}"`);
      return insight;
    } catch (err) {
      console.warn('[FIREBASE WRITE FAIL] Falling back to in-memory resolveOperationalInsight. Error:', err);
      this.isFallbackMode = true;
      this.persist();
      if (localResult) {
        await this.addLog(userId, userName, 'Atualização de Gargalo', `Retificou status do alerta "${localResult.title}" para "${status}" (local)`);
      }
      return localResult;
    }
  }

  // Logs Collection
  async getAuditLogs(): Promise<SystemAuditLog[]> {
    try {
      if (this.isFallbackMode) return [...this.localLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const snap = await runWithTimeout(firestoreDb.collection('logs').get(), 2000, 'getAuditLogs');
      const list = snap.docs.map(d => d.data() as SystemAuditLog);
      this.localLogs = list;
      return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (err) {
      console.warn('[FIREBASE FETCH FAIL] Falling back to in-memory getAuditLogs. Error:', err);
      this.isFallbackMode = true;
      return [...this.localLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
  }

  async addLog(userId: string, userName: string, action: string, details: string) {
    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newLog: SystemAuditLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      userId,
      userName,
      action,
      details,
      ip: `10.150.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}`
    };
    this.localLogs.push(newLog);
    this.persist();

    try {
      if (this.isFallbackMode) return;
      await runWithTimeout(firestoreDb.collection('logs').doc(logId).set(newLog), 2000, 'addLog');
    } catch (err) {
      console.warn('[FIREBASE WRITE FAIL] Failed to write audit log to Firestore. Using local state. Error:', err);
      this.isFallbackMode = true;
      this.persist();
    }
  }
}

export const db = new DatabaseStore();
