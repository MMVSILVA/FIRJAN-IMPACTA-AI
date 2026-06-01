export type UserRole = 
  | 'Colaborador' 
  | 'Líder/Gestor' 
  | 'Administrador' 
  | 'Comissão Avaliadora' 
  | 'Super Admin'
  | 'INSTRUTOR(A) MULTIDISCIPLINAR'
  | 'INSTRUTOR(A) CAD'
  | 'INSTRUTOR(A) DE CURSOS ESPECIAIS A'
  | 'INSTRUTOR(A) DE CURSOS ESPECIAIS B'
  | 'INSTRUTOR(A) DE EDUCAÇÃO PROFISSIONAL TÉCNICA'
  | 'INSTRUTOR(A) DE FORMAÇÃO INICIAL E CONTINUADA A'
  | 'INSTRUTOR(A) DE FORMAÇÃO INICIAL E CONTINUADA B'
  | 'INSTRUTOR(A) CAM/CNC/ROBÓTICA';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  department: string;
  points: number;
  badges: string[];
  avatar: string;
  matricula?: string;
  setor?: string;
  unidade?: string;
  estado?: string;
  cidade?: string;
  mfaEnabled?: boolean;
  recoveryCode?: string;
}

export interface Comment {
  id: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface AIReview {
  summary: string;
  estimatedImpact: string;
  suggestions: string[];
  isDuplicate: boolean;
  priority: 'Baixa' | 'Média' | 'Alta';
  operationalSaving: string; // e.g. "R$ 45.000/ano"
}

export interface ApprovalStep {
  stageId: number;
  approver: string | null;
  role: string | null;
  date: string | null;
  action: 'submitted' | 'approved' | 'rejected' | 'pending' | 'revision';
  comment: string | null;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  problem: string;
  solution: string;
  impactExpected: string;
  category: string;
  authorId: string;
  authorName: string;
  authorDept: string;
  status: string; // Dynamic status strings including hierarchical flows ('Em análise', 'Aguardando Líder', 'Em Avaliação', 'Aprovado', etc.)
  likes: number;
  likedBy: string[]; // List of userIds who liked the idea
  comments: Comment[];
  pointsRewarded: number;
  aiReview?: AIReview;
  createdAt: string;
  approvalHistory?: ApprovalStep[];
  currentStage?: number;
  financialEstimate?: number;
  riskLevel?: string;
  priority?: string;
  attachments?: string[];
  intelligentScore?: number;
}

export interface OnboardingStep {
  id: string;
  title: string;
  category: 'Institucional' | 'Tecnologia' | 'Processos' | 'Segurança';
  type: 'video' | 'doc' | 'task';
  duration: string;
  isCompleted: boolean;
  contentMarkdown?: string;
}

export interface WikiArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  favoritesCount: number;
  isFavorite?: boolean;
  excerpt: string;
  createdAt: string;
}

export interface OperationalInsight {
  id: string;
  type: 'gargalo' | 'retrabalho' | 'processo lento' | 'desperdício' | 'duplicidade';
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  area: string;
  detectedAt: string;
  status: 'Pendente' | 'Analisando' | 'Resolvido';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  createdAt: string;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  ip: string;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  dyslexicFont: boolean;
  screenReaderEnabled: boolean;
  cognitiveSimplified: boolean;
}
