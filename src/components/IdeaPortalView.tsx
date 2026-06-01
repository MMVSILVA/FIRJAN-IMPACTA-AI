import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { 
  Lightbulb, 
  MessageSquare, 
  ThumbsUp, 
  Plus, 
  Search, 
  AlertCircle,
  HelpCircle,
  User,
  Calendar,
  Share2,
  Paperclip,
  CheckCircle,
  Sparkles,
  Award,
  BadgeAlert,
  Gift,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  ShieldAlert,
  ChevronRight,
  Sparkle,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { Idea, UserProfile } from '../types';
import ApprovedIdeasUnitChart from './ApprovedIdeasUnitChart';

const FLOW = [
  { id: 0, key: 'submitted',     label: 'Enviado',            sub: 'Colaborador',          role: 'Colaborador',          color: '#3B82F6', emoji: '📝' },
  { id: 1, key: 'lider',         label: 'Análise do Líder',   sub: 'Gestor direto',         role: 'Líder/Gestor',         color: '#A78BFA', emoji: '👔' },
  { id: 2, key: 'comissao',      label: 'Comissão',           sub: 'Avaliação técnica',     role: 'Comissão Avaliadora',  color: '#34D399', emoji: '🔬' },
  { id: 3, key: 'admin',         label: 'Aprovação Admin',    sub: 'Executivo',             role: 'Administrador',        color: '#F59E0B', emoji: '🏛️' },
  { id: 4, key: 'implementacao', label: 'Implementação',      sub: 'Em execução',           role: null,                  color: '#34D399', emoji: '🚀' },
];

interface IdeaPortalViewProps {
  ideas: Idea[];
  currentUser: UserProfile;
  users: UserProfile[];
  onSubmitIdea: (ideaData: any) => Promise<void>;
  onLikeIdea: (ideaId: string) => Promise<void>;
  onCommentIdea: (ideaId: string, commentText: string) => Promise<void>;
  onUpdateIdeaStatus: (ideaId: string, status: string, pointsRewarded: number, stageComments?: string) => Promise<void>;
  onRedeemReward: (itemId: string, itemPrice: number, itemName: string) => Promise<{ success: boolean; voucher?: string; error?: string }>;
}

export default function IdeaPortalView({ 
  ideas, 
  currentUser, 
  users,
  onSubmitIdea, 
  onLikeIdea, 
  onCommentIdea,
  onUpdateIdeaStatus,
  onRedeemReward
}: IdeaPortalViewProps) {
  // Navigation tabs inside FIRJAN IMPACTA AI
  const [internalTab, setInternalTab] = useState<'ideias' | 'analytics' | 'recompensas'>('ideias');
  
  // Submit Form panel states
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedIdeaForComment, setSelectedIdeaForComment] = useState<string | null>(null);
  const [commentTextState, setCommentTextState] = useState('');
  
  // Submit Form Fields State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Eficiência Operacional');
  const [description, setDescription] = useState('');
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [impactExpected, setImpactExpected] = useState('');
  const [financialEstimate, setFinancialEstimate] = useState('45000');
  const [riskLevel, setRiskLevel] = useState('Baixo');
  const [priority, setPriority] = useState('Média');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState('');

  // Leader Action panel state variables mapped per Idea ID to avoid state blending
  const [leaderStatuses, setLeaderStatuses] = useState<{ [key: string]: string }>({});
  const [leaderPoints, setLeaderPoints] = useState<{ [key: string]: number }>({});
  const [leaderFeedback, setLeaderFeedback] = useState<{ [key: string]: string }>({});
  const [approvalSubmittingId, setApprovalSubmittingId] = useState<string | null>(null);

  // Rewards states
  const [activeVoucher, setActiveVoucher] = useState<{ code: string; name: string } | null>(null);
  const [redeemErrorMessage, setRedeemErrorMessage] = useState<string>('');
  const [isRedeeming, setIsRedeeming] = useState<boolean>(false);
  const [redeemHistory, setRedeemHistory] = useState<{ id: string, name: string, points: number, date: string, voucher: string }[]>([]);

  // Categories definition
  const categories = [
    'Todas',
    'Eficiência Operacional',
    'Processos e TI',
    'Educação e SENAI',
    'Saúde e SESI',
    'Sustentabilidade',
    'Gestão Administrativa'
  ];

  const formCategories = categories.filter(v => v !== 'Todas');

  // Analytical metrics for managers
  const totalIdeas = ideas.length;
  const approvedIdeas = ideas.filter(i => i.status === 'Aprovado' || i.status === 'Em implementação' || i.status === 'Finalizado').length;
  
  // Total economic gains calculation
  const totalSavings = ideas
    .filter(i => i.status === 'Aprovado' || i.status === 'Em implementação' || i.status === 'Finalizado')
    .reduce((acc, curr) => {
      if (curr.aiReview?.operationalSaving) {
        const val = parseInt(curr.aiReview.operationalSaving.replace(/[^0-9]/g, ''), 10);
        return acc + (isNaN(val) ? 0 : val);
      }
      return acc + 40000; 
    }, 0);

  // Segment representations
  const segmentCount: { [key: string]: number } = {
    'SESI RJ': 0,
    'SENAI RJ': 0,
    'IEL RJ': 0,
    'Suporte e TI': 0,
    'Gestão Administrativa': 0
  };

  ideas.forEach(i => {
    const dept = i.authorDept || '';
    if (dept.toLowerCase().includes('sesi')) segmentCount['SESI RJ']++;
    else if (dept.toLowerCase().includes('senai')) segmentCount['SENAI RJ']++;
    else if (dept.toLowerCase().includes('iel')) segmentCount['IEL RJ']++;
    else if (dept.toLowerCase().includes('suporte') || dept.toLowerCase().includes('ti')) segmentCount['Suporte e TI']++;
    else segmentCount['Gestão Administrativa']++;
  });

  // Ranking of collaborators
  const topCollaborators = [...users].sort((a, b) => b.points - a.points);

  // Excel export function
  const handleExportToExcel = () => {
    const dataToExport = ideas.map((idea, index) => ({
      'ID da Ideia': idea.id,
      'Número': index + 1,
      'Título': idea.title,
      'Setor/Categoria': idea.category,
      'Descrição': idea.description,
      'Problema Identificado': idea.problem,
      'Solução Proposta': idea.solution,
      'Impacto Esperado': idea.impactExpected,
      'Autor(a)': idea.authorName,
      'Departamento do Autor': idea.authorDept,
      'Status Atual': idea.status,
      'Likes': idea.likes || 0,
      'Qtd Comentários': idea.comments?.length || 0,
      'Prioridade IA': idea.aiReview?.priority || 'Baixa',
      'Economia Estimada IA': idea.aiReview?.operationalSaving || 'R$ 40.000/ano',
      'Resumo IA': idea.aiReview?.summary || '',
      'Pontos do Autor': idea.pointsRewarded || 0,
      'Data de Cadastro': idea.createdAt ? new Date(idea.createdAt).toLocaleDateString('pt-BR') : '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ideias Cadastradas');
    XLSX.writeFile(workbook, `Firjan_Impacta_Ideias_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Rewards catalog definition
  const REWARDS = [
    { id: 'prize_temp_cup', name: 'Caneca Térmica Inox Firjan Impacta', points: 150, category: 'Brindes', desc: 'Caneca térmica com isolamento duplo a vácuo, cor preta fosca e gravação a laser.', icon: '☕' },
    { id: 'prize_temp_notebook', name: 'Caderno de Anotações Ecocraft', points: 100, category: 'Brindes', desc: 'Capa dura de bambu sustentável com caneta ecológica inclusa.', icon: '📔' },
    { id: 'prize_temp_backpack', name: 'Mochila Antifurto Premium Pro', points: 500, category: 'Acessórios', desc: 'Compartimento acolchoado para notebook, cadeado de senha e saídas USB.', icon: '🎒' },
    { id: 'prize_temp_course', name: 'Especialização Avançada em IA SENAI rj', points: 300, category: 'Educação', desc: 'Curso VIP completo de Engenharia de Prompt e Modelos Multimodais.', icon: '🎓' },
    { id: 'prize_temp_jacket', name: 'Jaqueta Corta-Vento Oficial Firjan', points: 400, category: 'Moda', desc: 'Jaqueta esportiva oficial resistente à água, cor grafite escovado.', icon: '🧥' },
    { id: 'prize_temp_hotel', name: 'Fim de Semana SESI Convenções Hotel Recreio', points: 1000, category: 'Lazer', desc: 'Hospedagem com pensão completa para dois adultos na colônia SESI.', icon: '🏨' }
  ];

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFileName(e.dataTransfer.files[0].name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFileName(e.target.files[0].name);
    }
  };

  // Submit new proposals handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccessMsg('');
    if (!title || !description || !problem || !solution) {
      setSubmitError('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitIdea({
        title,
        category,
        description,
        problem,
        solution,
        impactExpected,
        financialEstimate: Number(financialEstimate) || 0,
        riskLevel,
        priority,
        attachments: uploadedFileName ? [uploadedFileName] : [],
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorDept: currentUser.department || currentUser.setor || 'Geral'
      });
      
      setSubmitSuccessMsg('Excelente! Ideia registrada. A IA calculou o impacto estimado e seu saldo aumentou em +50 pts!');
      
      // Clear fields
      setTitle('');
      setDescription('');
      setProblem('');
      setSolution('');
      setImpactExpected('');
      setFinancialEstimate('45000');
      setRiskLevel('Baixo');
      setPriority('Média');
      setUploadedFileName(null);
      setTimeout(() => {
        setShowSubmitForm(false);
        setSubmitSuccessMsg('');
      }, 3000);
    } catch (err: any) {
      setSubmitError(err.message || 'Erro ao processar ideia. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Comments handler
  const handleCommentSubmit = async (ideaId: string) => {
    if (!commentTextState.trim()) return;
    await onCommentIdea(ideaId, commentTextState);
    setCommentTextState('');
    setSelectedIdeaForComment(null);
  };

  // Leader Status Modulating Approval Action
  const handleLeaderApprovalSubmit = async (ideaId: string) => {
    const selectedStatus = leaderStatuses[ideaId] || 'Aprovado';
    const pointsToReward = leaderPoints[ideaId] || 100;
    const feedbackText = leaderFeedback[ideaId] || '';

    if (!feedbackText.trim()) {
      alert('Por favor, insira um parecer construtivo para fundamentar a avaliação técnica.');
      return;
    }

    setApprovalSubmittingId(ideaId);
    try {
      // 1. Update idea status and reward calculated points in backend with feedback comments
      await onUpdateIdeaStatus(ideaId, selectedStatus, pointsToReward, feedbackText);

      // 2. Submit leader validation comment
      const formattedComment = `[Parecer Técnico: ${currentUser.name}] Decisão: ${selectedStatus === 'Aprovado' ? 'Aprovação e Avanço' : selectedStatus}. Pontos outorgados: +${pointsToReward} pts. Feedback: ${feedbackText}`;
      await onCommentIdea(ideaId, formattedComment);

      // Clear local states
      setLeaderStatuses(prev => ({ ...prev, [ideaId]: 'Aprovado' }));
      setLeaderPoints(prev => ({ ...prev, [ideaId]: 100 }));
      setLeaderFeedback(prev => ({ ...prev, [ideaId]: '' }));
    } catch (err) {
      console.error(err);
      alert('Ocorreu uma instabilidade ao enviar o parecer técnico.');
    } finally {
      setApprovalSubmittingId(null);
    }
  };

  // Rewards redemption handler
  const handleRedeemItemClick = async (itemId: string, itemPrice: number, itemName: string) => {
    setRedeemErrorMessage('');
    setIsRedeeming(true);
    try {
      const result = await onRedeemReward(itemId, itemPrice, itemName);
      if (result.success && result.voucher) {
        setActiveVoucher({ code: result.voucher, name: itemName });
        setRedeemHistory(prev => [
          {
            id: `v_${Date.now()}`,
            name: itemName,
            points: itemPrice,
            date: new Date().toLocaleDateString('pt-BR'),
            voucher: result.voucher!
          },
          ...prev
        ]);
      } else {
        setRedeemErrorMessage(result.error || 'Erro inesperado ao resgatar brinde.');
      }
    } catch (err) {
      setRedeemErrorMessage('Falha temporária ao comunicar com o servidor.');
    } finally {
      setIsRedeeming(false);
    }
  };

  // Filter ideas
  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          idea.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || idea.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6" id="firjan_impacta_ai_portal">
      {/* Title Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-4">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-purple-500/10 text-purple-300 font-mono font-bold uppercase tracking-widest border border-purple-500/20 px-2.5 py-0.5 rounded-full inline-block">
              FIRJAN IMPACTA AI
            </span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold font-display text-white mt-1">Plataforma Inteligente de Ideias</h1>
          <p className="text-xs text-zinc-400">Canal institucional de fomento, análise por IA, gamificação e homologação contínua de melhorias.</p>
        </div>

        {/* Action Form trigger directly inside view */}
        {internalTab === 'ideias' && !showSubmitForm && (
          <button
            id="btn_new_idea_portal_trigger"
            onClick={() => setShowSubmitForm(true)}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" /> Propor Novidade (+50 pts)
          </button>
        )}
      </div>

      {/* Internal Navigation Sub-tabs */}
      <div className="flex border-b border-zinc-900 bg-zinc-950 p-1 rounded-xl gap-1 border">
        <button
          onClick={() => { setInternalTab('ideias'); setShowSubmitForm(false); }}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold uppercase font-display tracking-widest flex items-center justify-center gap-2 transition-all ${
            internalTab === 'ideias' 
              ? 'bg-purple-600/15 text-purple-300 border border-purple-500/20' 
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40 border border-transparent'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" /> Ideias & Aprovação
        </button>

        <button
          onClick={() => setInternalTab('analytics')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold uppercase font-display tracking-widest flex items-center justify-center gap-2 transition-all ${
            internalTab === 'analytics' 
              ? 'bg-purple-600/15 text-purple-300 border border-purple-500/20' 
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40 border border-transparent'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> Dashboard & Economia
        </button>

        <button
          onClick={() => setInternalTab('recompensas')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold uppercase font-display tracking-widest flex items-center justify-center gap-2 transition-all ${
            internalTab === 'recompensas' 
              ? 'bg-purple-600/15 text-purple-300 border border-purple-500/20' 
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40 border border-transparent'
          }`}
        >
          <Gift className="w-3.5 h-3.5 text-yellow-500" /> Gamificação & Loja
        </button>
      </div>

      {/* ========================================================== */}
      {/* INTERNAL TAB 1: IDEAS DISPOSITION & APPROVAL FLOATING CONTROL */}
      {/* ========================================================== */}
      {internalTab === 'ideias' && (
        <div className="space-y-6">
          
          {/* Submit Idea Form */}
          {showSubmitForm && (
            <div id="section_idea_form" className="glass-panel p-5 rounded-2xl border-purple-500/30 space-y-4 animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="text-left">
                  <span className="text-[9px] text-green-400 font-mono uppercase font-semibold">Gemini AI Audit Tool</span>
                  <h3 className="text-sm font-semibold text-white uppercase font-display">Cadastrar Proposta de Inovação</h3>
                </div>
                <button
                  onClick={() => {
                    setShowSubmitForm(false);
                    setSubmitError('');
                  }}
                  className="text-xs text-zinc-400 hover:text-white border border-zinc-950 px-2 py-1 rounded bg-zinc-900"
                >
                  Fechar
                </button>
              </div>

              {submitError && (
                <div className="p-3 bg-red-950/20 text-red-400 border border-red-500/20 rounded-lg flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {submitSuccessMsg && (
                <div className="p-3 bg-green-950/20 text-green-300 border border-green-500/20 rounded-lg flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{submitSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-semibold text-zinc-400 block">Título da Ideia ou Automação *</label>
                    <input
                      type="text"
                      placeholder="Ex: Assinatura biométrica de contratos SENAI"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-650 focus:border-purple-500 focus:outline-none"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-semibold text-zinc-400 block">Categoria Geral *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:border-purple-500 focus:outline-none"
                    >
                      {formCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-zinc-400 block">Resumo descritivo geral *</label>
                  <textarea
                    placeholder="Explique resumidamente qual é a visão geral para simplificar a triagem..."
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Problem & Solution */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-semibold text-zinc-400 block">Problema detectado nos Setores Firjan *</label>
                    <textarea
                      placeholder="Descreva o gargalo com clareza. Ex: demora de 20 minutos no processo..."
                      rows={3}
                      value={problem}
                      onChange={(e) => setProblem(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:border-purple-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-semibold text-zinc-400 block">Solução e Aplicação de Melhoria *</label>
                    <textarea
                      placeholder="Explique a solução de modo prático, técnico e viável..."
                      rows={3}
                      value={solution}
                      onChange={(e) => setSolution(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:border-purple-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Impact Expected */}
                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-zinc-400 block">Ganhos Estipulados (Sustentabilidade, Reutilização ou Tempo de Espera)</label>
                  <input
                    type="text"
                    placeholder="Ex: Eliminar filas nas matrículas no SENAI e poupar 40 mil reais em folhas de contratos"
                    value={impactExpected}
                    onChange={(e) => setImpactExpected(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                {/* --- SEÇÃO MULTI-CAMPO REQUISITADA: ESTIMATIVA FINANCEIRA, RISCO, PRIORIDADE E PONTUAÇÃO INTELIGENTE --- */}
                <div className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-900 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-display flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-purple-400" /> Parâmetros de Viabilidade & Impacto
                    </span>
                    <span className="text-[10px] bg-purple-950 text-purple-300 font-mono border border-purple-500/20 px-2 py-0.5 rounded-full font-bold">Inteligência Coletiva</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Financial Estimate */}
                    <div className="space-y-1 text-left">
                      <label className="text-[11px] font-semibold text-zinc-400 block">Poupança Anual Estimada (R$) *</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Ex: 50000"
                        value={financialEstimate}
                        onChange={(e) => setFinancialEstimate(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:border-purple-500 focus:outline-none font-mono"
                      />
                    </div>

                    {/* Risk Level */}
                    <div className="space-y-1 text-left">
                      <label className="text-[11px] font-semibold text-zinc-400 block">Classificação de Risco *</label>
                      <select
                        value={riskLevel}
                        onChange={(e) => setRiskLevel(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:border-purple-500 focus:outline-none"
                      >
                        <option value="Baixo">Baixo (Mínima fricção)</option>
                        <option value="Médio">Médio (Requer adequação)</option>
                        <option value="Alto">Alto (Estrutural complexo)</option>
                      </select>
                    </div>

                    {/* Priority */}
                    <div className="space-y-1 text-left">
                      <label className="text-[11px] font-semibold text-zinc-400 block">Prioridade Proposta *</label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:border-purple-500 focus:outline-none"
                      >
                        <option value="Baixa">Baixa (Pequena urgência)</option>
                        <option value="Média">Média (Aprimoramento contínuo)</option>
                        <option value="Alta">Alta (Gargalo produtivo/Sustentável)</option>
                      </select>
                    </div>
                  </div>

                  {/* Reactive Score Breakdown Widget */}
                  {(() => {
                    const fVal = Number(financialEstimate) || 0;
                    const fScore = fVal >= 100000 ? 20 : fVal >= 50000 ? 15 : fVal >= 10000 ? 10 : 5;
                    const rScore = riskLevel === 'Baixo' ? 20 : riskLevel === 'Médio' ? 14 : 6;
                    const pScore = priority === 'Alta' ? 20 : priority === 'Média' ? 14 : 6;
                    const liveIntelligentScore = Math.min(100, Math.max(25, 40 + fScore + rScore + pScore - 15));
                    
                    return (
                      <div className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-850 space-y-2 text-left">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-450 font-medium">Previsão de Score Firjan Connect:</span>
                          <strong className="text-sm font-mono font-bold text-green-400">{liveIntelligentScore} / 100 pts</strong>
                        </div>
                        <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-850">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-green-400 transition-all duration-300" 
                            style={{ width: `${liveIntelligentScore}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                          <span>💰 Impacto Econômico: +{fScore}</span>
                          <span>🛡️ Tolerância de Risco: +{rScore}</span>
                          <span>⚡ Urgência: +{pScore}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* File Attachment Drag and Drop */}
                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-zinc-400 block">Anexo de Apoio Técnicos (PDF, XLSX, DOCX)</label>
                  <div 
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-zinc-800 hover:border-purple-500/50 bg-zinc-950/40 rounded-xl p-3 text-center cursor-pointer transition-all"
                  >
                    <input 
                      type="file" 
                      id="file_upload_ideas_inside" 
                      className="hidden" 
                      onChange={handleFileChange}
                    />
                    <label htmlFor="file_upload_ideas_inside" className="cursor-pointer space-y-1 block">
                      <Paperclip className="w-5 h-5 mx-auto text-zinc-500" />
                      <p className="text-xs text-zinc-300">Arraste e solte o arquivo ou <span className="text-purple-400 underline">navegue localmente</span></p>
                      <p className="text-[10px] text-zinc-600">Limite 10MB por documento</p>
                    </label>
                    {uploadedFileName && (
                      <p className="mt-2 text-xs text-green-400 font-mono">📎 Arquivo: {uploadedFileName}</p>
                    )}
                  </div>
                </div>

                {/* Submit Actions Button */}
                <div className="flex items-center justify-between pt-2">
                  <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> 
                    Análise em tempo real habilitada via Gemini AI
                  </p>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-green-500 hover:bg-green-400 text-black px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Gerando inteligência...' : 'Cadastrar e Rodar IA'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filtering panels */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar por título, tag ou autor da Firjan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Export excel button */}
            <button
              onClick={handleExportToExcel}
              id="btn_export_xlsx"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0 select-none hover:scale-[1.01]"
              title="Exportar todas as ideias para um arquivo Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" /> Exportar Planilha (.xlsx)
            </button>

            {/* Category tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-xs font-medium shrink-0 transition-all border rounded-lg ${selectedCategory === cat ? 'bg-purple-500/25 text-purple-300 border-purple-500/55' : 'bg-zinc-950 text-zinc-400 border-zinc-900 hover:border-zinc-800'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Feed of ideas */}
          <div className="space-y-5">
            {filteredIdeas.length === 0 ? (
              <div className="glass-panel p-10 rounded-xl border-zinc-800 text-center text-zinc-400 space-y-2">
                <Lightbulb className="w-10 h-10 text-zinc-750 mx-auto" />
                <h4 className="text-xs font-semibold text-white">Nenhuma proposta de inovação corresponde para este segmento</h4>
                <p className="text-[11px] text-zinc-550">Seja o pioneiro a cadastrar soluções para este setor!</p>
              </div>
            ) : (
              filteredIdeas.map((idea) => {
                const hasLiked = idea.likedBy?.includes(currentUser.id);
                const isPendingLeaderReview = idea.status === 'Em análise';
                
                // Mapeia perfil de liderança para verificar admissão ao painel de moderação
                const canModerate = currentUser.role === 'Líder/Gestor' || 
                                    currentUser.role === 'Comissão Avaliadora' ||
                                    currentUser.role === 'Administrador' || 
                                    currentUser.role === 'Super Admin';

                return (
                  <div 
                    key={idea.id} 
                    className="glass-panel p-5 rounded-xl border-zinc-850 space-y-4 hover:border-zinc-700/60 transition-all text-left"
                  >
                    {/* Upper Line Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2 border-b border-zinc-900 pb-3">
                      <div>
                        <span className="text-[9px] bg-purple-900/10 text-purple-300 px-2 py-0.5 rounded border border-purple-500/10 font-mono font-bold uppercase">
                          {idea.category}
                        </span>
                        <h3 className="text-base font-bold text-white mt-1 leading-snug font-display">
                          {idea.title}
                        </h3>
                        {/* Author credentials */}
                        <span className="text-[10px] text-zinc-500 block mt-0.5">
                          Inovador: <strong className="text-zinc-350">{idea.authorName}</strong> ({idea.authorDept}) em {new Date(idea.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-wider uppercase border ${
                          idea.status === 'Finalizado' ? 'bg-green-500/10 text-green-400 border-green-500/25' :
                          idea.status === 'Em implementação' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25' :
                          idea.status === 'Aprovado' ? 'bg-purple-500/10 text-purple-400 border-purple-500/25' :
                          idea.status === 'Reprovado' ? 'bg-red-500/10 text-red-400 border-red-500/25' :
                          'bg-yellow-500/10 text-yellow-500 border-yellow-500/25' // Em análise
                        }`}>
                          ● {idea.status === 'Em análise' ? 'Análise Pendente' : idea.status}
                        </span>
                        {idea.pointsRewarded > 0 && (
                          <span className="text-[9px] text-green-400 mt-1 font-mono font-semibold flex items-center gap-0.5">
                            🏆 +{idea.pointsRewarded} pts outorgados
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Parameters Ribbon for Budgets, Risk and Intelligent Scores */}
                    <div className="flex flex-wrap gap-2 text-[10px] font-mono pt-1 text-left pb-1">
                      {idea.intelligentScore !== undefined && (
                        <div className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                          idea.intelligentScore >= 80 
                            ? 'bg-green-500/10 text-green-400 border-green-500/25 shadow-sm shadow-green-500/10 animate-pulse' 
                            : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                        }`}>
                          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                          <span>AI SCORE:</span>
                          <span className="font-extrabold">{idea.intelligentScore} / 100</span>
                        </div>
                      )}

                      {idea.financialEstimate !== undefined && (
                        <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <span>💰 Economia Anual Est.:</span>
                          <strong>R$ {idea.financialEstimate.toLocaleString('pt-BR')}</strong>
                        </div>
                      )}

                      {idea.riskLevel && (
                        <div className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                          idea.riskLevel === 'Alto' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          idea.riskLevel === 'Médio' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                          'bg-zinc-900 text-zinc-400 border-zinc-800'
                        }`}>
                          <span>🛡️ Risco Est.:</span>
                          <strong>{idea.riskLevel}</strong>
                        </div>
                      )}

                      {idea.priority && (
                        <div className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                          idea.priority === 'Alta' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' :
                          'bg-zinc-900 text-zinc-400 border-zinc-800'
                        }`}>
                          <span>📌 Prioridade:</span>
                          <strong>{idea.priority}</strong>
                        </div>
                      )}

                      {idea.attachments && idea.attachments.length > 0 && (
                        <div className="px-2.5 py-1 rounded-lg bg-zinc-950/60 text-zinc-300 border border-zinc-850 flex items-center gap-1">
                          <Paperclip className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Anexos:</span>
                          <span className="underline cursor-pointer hover:text-white select-all font-sans">{idea.attachments[0]}</span>
                        </div>
                      )}
                    </div>

                    {/* Problem and solution descriptors */}
                    <div className="space-y-3 text-xs">
                      <div>
                        <strong className="text-white">Visão Geral:</strong>
                        <p className="mt-0.5 text-zinc-300 text-[11px] leading-relaxed">{idea.description}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-zinc-950/60 p-3 rounded-lg border border-zinc-900">
                        <div>
                          <strong className="text-red-400 block uppercase text-[8.5px] font-bold font-mono">⚠️ O Problema nos Setores:</strong>
                          <p className="text-zinc-400 leading-relaxed text-[11px] mt-0.5">{idea.problem}</p>
                        </div>
                        <div>
                          <strong className="text-green-400 block uppercase text-[8.5px] font-bold font-mono">💡 Solução e Impacto:</strong>
                          <p className="text-zinc-400 leading-relaxed text-[11px] mt-0.5">{idea.solution}</p>
                        </div>
                      </div>

                      {idea.impactExpected && (
                        <div className="text-[11px] bg-purple-950/10 p-2.5 rounded border border-purple-500/10 leading-snug">
                          <span className="text-purple-300 font-mono font-bold font-semibold">Ganhos de Qualidade estipulados pelo Autor:</span> {idea.impactExpected}
                        </div>
                      )}
                    </div>

                    {/* Gemini AI Core Audit Section */}
                    {idea.aiReview && (
                      <div className="bg-gradient-to-r from-purple-950/10 to-emerald-950/10 border border-purple-500/20 rounded-xl p-4.5 space-y-3 relative overflow-hidden text-left">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
                        
                        <div className="flex items-center justify-between border-b border-purple-950/60 pb-2">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                            <span className="text-[10px] font-bold text-white uppercase font-display tracking-widest">
                              REVISÃO INTELIGENTE DE IMPACTO - GEMINI AI
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 font-mono text-[9px]">
                            <span className={`px-2 py-0.5 font-bold rounded ${idea.aiReview.priority === 'Alta' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'}`}>
                              Prioridade: {idea.aiReview.priority}
                            </span>
                            {idea.aiReview.isDuplicate && (
                              <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3 text-yellow-500" /> Duplicidade Alerta
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          {/* Left analysis */}
                          <div className="space-y-1.5 md:col-span-2">
                            <span className="text-[9px] text-zinc-500 font-mono font-bold uppercase block">Análise Preliminar de Viabilidade</span>
                            <p className="text-zinc-300 leading-relaxed text-[11.5px]">{idea.aiReview.summary}</p>
                            <p className="text-zinc-400 leading-normal text-[11px] pt-1">💡 <strong className="text-zinc-300">Viabilidade Técnica e Financeira:</strong> {idea.aiReview.estimatedImpact}</p>
                          </div>

                          {/* Ganhos econometria card */}
                          <div className="bg-black/40 p-3 rounded-lg border border-zinc-900 space-y-1 flex flex-col justify-center">
                            <span className="text-[9px] text-zinc-500 font-mono uppercase block font-semibold">Ganhos Anuais Calculados</span>
                            <div>
                              <span className="text-xl font-bold font-mono text-green-400 block leading-tight">
                                {idea.aiReview.operationalSaving || 'R$ 40.000/ano'}
                              </span>
                              <span className="text-[9px] text-zinc-550 leading-none block">Desperdício Mitigado</span>
                            </div>
                          </div>
                        </div>

                        {/* Suggestions list from IA */}
                        {idea.aiReview.suggestions && idea.aiReview.suggestions.length > 0 && (
                          <div className="space-y-1 pt-2 border-t border-purple-950/40">
                            <span className="text-[9px] text-purple-400 font-mono font-bold uppercase block">Diretrizes Práticas para Execução</span>
                            <ul className="list-disc list-inside space-y-1 text-[11px] text-zinc-400 pl-1 leading-normal">
                              {idea.aiReview.suggestions.map((s, idx) => (
                                <li key={idx}>
                                  <span className="text-zinc-300">{s}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ========================================================== */}
                    {/* HISTÓRICO HIERÁRQUICO DE APROVAÇÃO (REQUISITO DA SOLUÇÃO) */}
                    {/* ========================================================== */}
                    <div className="border-t border-zinc-900/50 pt-4 mt-2 font-sans">
                      <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase block mb-3">Fluxo de Aprovação Hierárquico</span>
                      
                      {/* Interactive Visual Timeline Flowchart */}
                      <div className="flex flex-wrap items-start justify-between gap-y-4 md:grid md:grid-cols-5 gap-2 pb-4 bg-zinc-950/20 p-3.5 rounded-lg border border-zinc-900">
                        {FLOW.map((stage, idx) => {
                          const hist = idea.approvalHistory ? idea.approvalHistory.find(h => h.stageId === stage.id) : null;
                          const currentStage = idea.currentStage !== undefined ? idea.currentStage : (idea.status === 'Em análise' ? 1 : 4);
                          
                          const isCurrent = currentStage === stage.id && idea.status !== 'Reprovado';
                          const isDone = (idea.status === 'Aprovado' || idea.status === 'Em implementação' || idea.status === 'Finalizado') ? (stage.id <= 3) : (stage.id < currentStage);
                          const isRej = idea.status === 'Reprovado' && currentStage === stage.id;
                          
                          let nodeColor = 'border-zinc-800 text-zinc-600 bg-zinc-950/45';
                          if (isDone) nodeColor = 'border-green-500/50 text-green-400 bg-green-500/10 shadow-[0_0_10px_rgba(34,197,94,0.1)]';
                          else if (isCurrent) nodeColor = 'border-yellow-500/55 text-yellow-400 bg-yellow-500/10 animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.15)]';
                          else if (isRej) nodeColor = 'border-red-500/50 text-red-550 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.15)]';

                          return (
                            <div key={stage.id} className="flex-1 flex flex-col items-center relative text-center min-w-[100px] md:min-w-0">
                              {idx < 4 && (
                                <div className="hidden md:block absolute top-5 left-[50%] right-[-50%] h-[2px] bg-zinc-900" style={{ zIndex: 0 }}>
                                  <div className={`h-full transition-all duration-300 ${isDone ? 'bg-green-500/40' : 'bg-transparent'}`} />
                                </div>
                              )}
                              
                              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-semibold select-none relative ${nodeColor}`} style={{ zIndex: 1 }}>
                                {isDone ? (
                                  <span className="text-[14px]">✓</span>
                                ) : isRej ? (
                                  <span className="text-[13px]">✕</span>
                                ) : (
                                  <span className="text-[13px]">{stage.emoji}</span>
                                )}
                              </div>
                              
                              <div className="mt-2.5">
                                <span className={`text-[10.5px] font-bold block ${isCurrent ? 'text-yellow-400' : isDone ? 'text-green-400' : isRej ? 'text-red-400' : 'text-zinc-550'}`}>
                                  {stage.label}
                                </span>
                                <span className="text-[9px] text-zinc-650 block leading-none mt-0.5">{stage.sub}</span>
                                
                                {hist && hist.approver && (
                                  <span className="text-[8.5px] text-zinc-450 block mt-1.5 leading-none">
                                    👤 {hist.approver.split(' ')[0]}
                                    <span className="text-zinc-600 block text-[7.5px] mt-0.5">{hist.date}</span>
                                  </span>
                                )}
                                
                                {isCurrent && (
                                  <span className="inline-block mt-1.5 text-[7.5px] bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-1 py-0.5 rounded uppercase font-bold tracking-wider">
                                    Aguardando
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Display historic process comment notes */}
                      {idea.approvalHistory && idea.approvalHistory.filter(h => h.comment && h.action !== 'pending' && h.stageId > 0).length > 0 && (
                        <div className="mt-3.5 bg-zinc-950/30 border border-zinc-900 p-3.5 rounded-lg space-y-2 text-left">
                          <span className="text-[8.5px] text-zinc-550 font-mono font-bold uppercase block tracking-wider">Histórico de Pareceres e Instruções</span>
                          {idea.approvalHistory.filter(h => h.comment && h.action !== 'pending' && h.stageId > 0).map((h, i) => {
                            const stageInfo = FLOW.find(f => f.id === h.stageId);
                            const actionLabels = { approved: 'Aprovador', rejected: 'Reprovado', revision: 'Solicitou Ajuste', submitted: 'Enviado', pending: 'Pendente' };
                            const badgeColors = h.action === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                h.action === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
                            return (
                              <div key={i} className="text-[11.5px] text-zinc-300 leading-relaxed border-b border-zinc-900/50 pb-2 last:border-b-0 last:pb-0 flex items-start gap-2 pt-1">
                                <span className="text-xs mt-0.5">{stageInfo?.emoji}</span>
                                <div className="flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <strong className="text-zinc-200">{h.approver}</strong>
                                    <span className="text-[9px] text-zinc-500">({stageInfo?.label})</span>
                                    <span className={`text-[8px] px-1.5 py-px border rounded uppercase font-semibold ${badgeColors}`}>
                                      {actionLabels[h.action] || h.action}
                                    </span>
                                    <span className="text-[8px] text-zinc-600 ml-auto">{h.date}</span>
                                  </div>
                                  <p className="text-zinc-400 mt-1 font-mono text-[10.5px] bg-black/25 p-2 rounded border border-zinc-900/70">{h.comment}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* PAINEL DE HOMOLOGAÇÃO SEQUENCIAL (MESA DE HOMOLOGAÇÃO) */}
                    {(() => {
                      const currentStage = idea.currentStage !== undefined ? idea.currentStage : 1;
                      const stage = FLOW.find(f => f.id === currentStage);
                      const userHasReviewRole = stage?.role === 'Administrador' 
                        ? (currentUser.role === 'Administrador' || currentUser.role === 'Super Admin')
                        : currentUser.role === stage?.role;
                      const isIdeaPendingReview = idea.status === 'Em análise' && currentStage >= 1 && currentStage <= 3;
                      const canModerate = isIdeaPendingReview && userHasReviewRole;

                      if (!canModerate) return null;

                      return (
                        <div className="p-4 bg-purple-950/10 border-2 border-dashed border-purple-500/25 rounded-xl space-y-4 text-left animate-in fade-in">
                          <div className="flex items-center gap-2 border-b border-purple-950/60 pb-2">
                            <Award className="w-4 h-4 text-purple-400" />
                            <div className="text-left">
                              <h4 className="text-xs font-bold text-white uppercase tracking-wider">📥 Mesa de Homologação de Projetos: Passo {currentStage} - {stage?.label}</h4>
                              <p className="text-[10px] text-zinc-400">Emita seu parecer de acordo com a sua competência hierárquica ({currentUser.name} · {currentUser.role}).</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Selector 1: Status Action */}
                            <div className="space-y-1 font-sans">
                              <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Decisão de Homologação</label>
                              <select
                                value={leaderStatuses[idea.id] || 'Aprovado'}
                                onChange={(e) => setLeaderStatuses({ ...leaderStatuses, [idea.id]: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-500"
                              >
                                <option value="Aprovado">Aprovar e Avançar Fluxo (Acolher)</option>
                                <option value="Solicitar Ajuste">Solicitar Ajuste / Solicitar Revisão</option>
                                <option value="Reprovado">Reprovar e Arquivar</option>
                              </select>
                            </div>

                            {/* Selector 2: Points based on quality and innovation */}
                            <div className="space-y-1 font-sans">
                              <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Pontos Outorgados</label>
                              <select
                                value={leaderPoints[idea.id] || 100}
                                onChange={(e) => setLeaderPoints({ ...leaderPoints, [idea.id]: parseInt(e.target.value, 10) })}
                                className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                              >
                                <option value="50">+50 pts (Impacto Regional Unidade)</option>
                                <option value="100">+100 pts (Médio Impacto Institucional)</option>
                                <option value="150">+150 pts (Forte Impacto Redução Custos)</option>
                                <option value="200">+200 pts (Altíssimo Ganho SESI/SENAI)</option>
                              </select>
                            </div>

                            {/* Feedback text area */}
                            <div className="md:col-span-3 space-y-1 font-sans">
                              <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Parecer Justificado da Decisão (Obrigatório) *</label>
                              <textarea
                                placeholder="Adicione instrução prática de execução, correções solicitadas, ou justificativa técnica de reprovação..."
                                value={leaderFeedback[idea.id] || ''}
                                onChange={(e) => setLeaderFeedback({ ...leaderFeedback, [idea.id]: e.target.value })}
                                rows={2.5}
                                className="w-full bg-zinc-950 border border-zinc-855 rounded-lg p-2 text-xs text-zinc-200 placeholder:text-zinc-650 focus:outline-none focus:border-purple-500"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => handleLeaderApprovalSubmit(idea.id)}
                              disabled={approvalSubmittingId === idea.id}
                              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4.5 py-2 rounded-lg transition-all flex items-center gap-1 shadow-lg shadow-purple-950 cursor-pointer"
                            >
                              {approvalSubmittingId === idea.id ? 'Publicando Parecer...' : 'Publicar Parecer de Inovação e Premiar Colaborador (+pts)'}
                            </button>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Collaboration and Like actions */}
                    <div className="flex justify-between items-center text-xs border-t border-zinc-900/60 pt-3">
                      <div className="flex gap-4">
                        {/* Like button */}
                        <button
                          onClick={() => onLikeIdea(idea.id)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] transition-all ${hasLiked ? 'bg-purple-600/25 text-purple-300 font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" /> 
                          <span>{idea.likes} curtidas</span>
                        </button>

                        {/* Comment section toggle trigger */}
                        <button
                          onClick={() => {
                            if (selectedIdeaForComment === idea.id) {
                              setSelectedIdeaForComment(null);
                            } else {
                              setSelectedIdeaForComment(idea.id);
                            }
                          }}
                          className="flex items-center gap-1.5 text-zinc-400 hover:text-white px-3 py-1 rounded-full text-[11px]"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{idea.comments?.length || 0} comentários ({selectedIdeaForComment === idea.id ? 'Ocultar' : 'Discutir'})</span>
                        </button>
                      </div>

                      <button className="text-zinc-500 hover:text-zinc-300">
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Comment box expansion drawer */}
                    {selectedIdeaForComment === idea.id && (
                      <div className="border-t border-zinc-900 pt-3 space-y-3.5 animate-in fade-in">
                        <div className="flex gap-2 text-left">
                          <input
                            type="text"
                            placeholder="Deixe suas contribuições para enriquecer esta iniciativa..."
                            value={commentTextState}
                            onChange={(e) => setCommentTextState(e.target.value)}
                            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none"
                            onKeyDown={(el) => { if (el.key === 'Enter') handleCommentSubmit(idea.id); }}
                          />
                          <button
                            onClick={() => handleCommentSubmit(idea.id)}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded-lg text-xs font-semibold shrink-0"
                          >
                            Enviar
                          </button>
                        </div>

                        {/* List of comments inside cards */}
                        {idea.comments && idea.comments.length > 0 && (
                          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {idea.comments.map((comm) => {
                              const isLeaderBlock = comm.text.startsWith('[Avaliação');
                              return (
                                <div 
                                  key={comm.id} 
                                  className={`p-2.5 rounded-lg text-xs text-left ${
                                    isLeaderBlock 
                                      ? 'bg-purple-950/20 border border-purple-500/10' 
                                      : 'bg-zinc-950/50 border border-zinc-900'
                                  }`}
                                >
                                  <div className="flex justify-between items-center text-[9.5px] text-zinc-500 font-mono mb-1">
                                    <strong className={isLeaderBlock ? 'text-purple-300' : 'text-zinc-400'}>{comm.authorName}</strong>
                                    <span>{new Date(comm.createdAt).toLocaleString('pt-BR')}</span>
                                  </div>
                                  <p className="text-zinc-300 leading-normal text-[11px] whitespace-pre-line">{comm.text}</p>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* INTERNAL TAB 2: EXECUTIVE ECO-ANALYTICS & RETURN GAINS (ROI) */}
      {/* ========================================================== */}
      {internalTab === 'analytics' && (
        <div className="space-y-6 animate-in fade-in" id="analytics_impacta">
          {/* Top analytical info bar */}
          <div className="relative overflow-hidden rounded-2xl p-5 md:p-6 glass-panel border-purple-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -z-10" />
            
            <div className="space-y-1">
              <span className="text-[9px] bg-purple-500/10 text-purple-300 font-mono tracking-widest uppercase border border-purple-500/20 px-2.5 py-0.5 rounded-full font-bold">
                MÓDULO GESTOR E EXECUTIVE DASHBOARD
              </span>
              <h2 className="text-lg md:text-xl font-bold font-display text-white">Indicadores de Economia & Produtividade</h2>
              <p className="text-xs text-zinc-400 max-w-xl">
                Acompanhe o ganho anual acumulado gerado por ideias aprovadas e verifique o engajamento de fomento de sua unidade e equipe em tempo real.
              </p>
            </div>
          </div>

          {/* Metrics Boxes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-xl border-zinc-850 flex items-center gap-3 bg-zinc-950/40 text-left">
              <div className="p-2 w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/10">
                <Lightbulb className="w-5 h-5 font-bold" />
              </div>
              <div>
                <span className="text-[9.5px] text-zinc-500 block uppercase font-mono font-semibold leading-none">Ideias Propostas</span>
                <span className="text-lg font-bold text-white mt-1 block leading-tight">{totalIdeas}</span>
                <span className="text-[9px] text-green-400 font-mono">Controle Ativo</span>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-xl border-zinc-850 flex items-center gap-3 bg-zinc-950/40 text-left">
              <div className="p-2 w-10 h-10 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center border border-green-500/10">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[9.5px] text-zinc-500 block uppercase font-mono font-semibold leading-none">Projetos Acolhidos</span>
                <span className="text-lg font-bold text-white mt-1 block leading-tight">{approvedIdeas}</span>
                <span className="text-[9px] text-zinc-400 font-mono">Adesão: {totalIdeas ? Math.round((approvedIdeas / totalIdeas) * 100) : 0}%</span>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-xl border-zinc-850 flex items-center gap-3 bg-zinc-950/40 text-left col-span-2 sm:col-span-1">
              <div className="p-2 w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/10">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[9.5px] text-zinc-500 block uppercase font-mono font-semibold leading-none">Economia Estimada</span>
                <span className="text-lg font-bold text-emerald-300 mt-1 block leading-tight">R$ {totalSavings.toLocaleString('pt-BR')}</span>
                <span className="text-[9px] text-zinc-400 font-mono">Retorno Anualizado</span>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-xl border-zinc-850 flex items-center gap-3 bg-zinc-950/40 text-left col-span-2 sm:col-span-1">
              <div className="p-2 w-10 h-10 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center border border-yellow-500/10">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[9.5px] text-zinc-500 block uppercase font-mono font-semibold leading-none">Engajamento Interno</span>
                <span className="text-lg font-bold text-white mt-1 block leading-tight">96.4%</span>
                <span className="text-[9px] text-purple-400 font-mono">Alta participação</span>
              </div>
            </div>
          </div>

          {/* Chart Display Area and Segment details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Chart */}
            <div className="glass-panel p-5 rounded-xl border-zinc-850 md:col-span-2 space-y-4 text-left">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display">
                    Retorno Financeiro Mensal de Eficiência (ROI)
                  </h3>
                  <p className="text-[10px] text-zinc-500">Curva de captação de desperdícios resolvidos de forma descentralizada</p>
                </div>
                <div className="flex gap-3 text-[9px] font-mono">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-purple-500 rounded-full inline-block" /> Economia (R$)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full inline-block" /> Ideias Lançadas
                  </span>
                </div>
              </div>

              {/* Graphic Area */}
              <div className="w-full h-44 relative bg-zinc-950/60 rounded-lg p-2 border border-zinc-900">
                <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                  <line x1="30" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.02)" />
                  <line x1="30" y1="65" x2="480" y2="65" stroke="rgba(255,255,255,0.02)" />
                  <line x1="30" y1="110" x2="480" y2="110" stroke="rgba(255,255,255,0.02)" />
                  <line x1="30" y1="155" x2="480" y2="155" stroke="rgba(255,255,255,0.04)" />

                  <defs>
                    <linearGradient id="purpleG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="greenG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Areas representational rendering */}
                  <path d="M 30 155 Q 120 120, 210 90 T 370 50 T 480 25 L 480 155 Z" fill="url(#purpleG)" />
                  <path d="M 30 155 Q 120 120, 210 90 T 370 50 T 480 25" fill="none" stroke="#a855f7" strokeWidth="2" />

                  <path d="M 30 155 Q 120 145, 210 135 T 370 110 T 480 80 L 480 155 Z" fill="url(#greenG)" />
                  <path d="M 30 155 Q 120 145, 210 135 T 370 110 T 480 80" fill="none" stroke="#22c55e" strokeWidth="1" strokeDasharray="2 2" />

                  <circle cx="210" cy="90" r="3" fill="#a855f7" />
                  <circle cx="370" cy="50" r="3" fill="#a855f7" />
                  <circle cx="480" cy="25" r="4" fill="#22c55e" />

                  <text x="30" y="175" fill="#52525b" fontSize="8" textAnchor="middle">Março</text>
                  <text x="150" y="175" fill="#52525b" fontSize="8" textAnchor="middle">Abril</text>
                  <text x="280" y="175" fill="#52525b" fontSize="8" textAnchor="middle">Maio (Corrente)</text>
                  <text x="400" y="175" fill="#52525b" fontSize="8" textAnchor="middle">Junho</text>
                  <text x="480" y="175" fill="#52525b" fontSize="8" textAnchor="end">Julho (Projeção)</text>

                  <text x="25" y="24" fill="#3f3f46" fontSize="7" textAnchor="end">R$ 500k</text>
                  <text x="25" y="68" fill="#3f3f46" fontSize="7" textAnchor="end">R$ 200k</text>
                  <text x="25" y="113" fill="#3f3f46" fontSize="7" textAnchor="end">R$ 80K</text>
                  <text x="25" y="158" fill="#3f3f46" fontSize="7" textAnchor="end">0</text>
                </svg>
              </div>
            </div>

            {/* Segment Breakdown */}
            <div className="glass-panel p-5 rounded-xl border-zinc-850 space-y-4 text-left">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display flex items-center gap-1 text-purple-400">
                  <Plus className="w-4 h-4 text-purple-400" /> Rendimento por Segmento
                </h3>
                <p className="text-[10px] text-zinc-500">Mapeamento coletivo da rede fluminense</p>
              </div>

              <div className="space-y-3 pt-1">
                {Object.keys(segmentCount).map(seg => {
                  const count = segmentCount[seg];
                  const percentage = totalIdeas ? Math.round((count / totalIdeas) * 100) : 0;
                  return (
                    <div key={seg} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">{seg}</span>
                        <span className="text-zinc-650 font-mono text-[9.5px]">{count} propostas ({percentage}%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-950 rounded-full border border-zinc-900 overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 rounded-full transition-all duration-700"
                          style={{ width: `${Math.max(percentage, 5)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Distribuição de Ideias Aprovadas por Unidade (D3.js Bar-Chart) */}
          <div className="glass-panel p-5 rounded-xl border-zinc-850 text-left space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
              <div className="space-y-0.5">
                <h3 id="d3_title_approved_ideas" className="text-xs font-bold text-white uppercase tracking-wider font-display text-purple-400">
                  Distribuição de Ideias Aprovadas por Unidade Firjan (D3.js)
                </h3>
                <p className="text-[10px] text-zinc-500">
                  Gráfico de barras interativo mapeando propostas e inovações homologadas por unidade regional do Rio de Janeiro
                </p>
              </div>
            </div>

            <div className="w-full bg-zinc-950/40 p-4 rounded-xl border border-zinc-900">
              <ApprovedIdeasUnitChart ideas={ideas} users={users} />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* INTERNAL TAB 3: GAMIFICATION LEADERBOARD & REWARDS REVENUE */}
      {/* ========================================================== */}
      {internalTab === 'recompensas' && (
        <div className="space-y-6 animate-in fade-in" id="rewards_gamification">
          <div className="relative overflow-hidden p-5 rounded-2xl border-yellow-500/10 glass-panel flex flex-col md:flex-row justify-between items-start md:items-center gap-5 text-left bg-gradient-to-tr from-zinc-950 to-zinc-900/40">
            <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
            
            <div className="space-y-1 flex-1">
              <span className="text-[9px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 font-mono px-2 py-0.5 rounded uppercase font-bold tracking-widest inline-block mb-1">
                ECONOMIA COLETIVA & COMPETIÇÃO SAUDÁVEL
              </span>
              <h2 className="text-lg md:text-xl font-bold font-display text-white">Prêmios de Reconhecimento Firjan</h2>
              <p className="text-xs text-zinc-400 max-w-xl">
                Ajude nos processos, traga inovações sólidas analisadas pela Inteligência Artificial e troque seus pontos acumulados por produtos oficiais da rede fluminense.
              </p>
            </div>

            {/* Wallet points */}
            <div className="p-4 bg-yellow-500/15 rounded-2xl border border-yellow-500/25 text-center min-w-[170px] shrink-0 space-y-1">
              <span className="text-[8.5px] text-yellow-500 font-mono uppercase tracking-widest font-extrabold block">Seu Saldo Disponível</span>
              <strong className="text-2xl font-mono text-yellow-400 block font-bold leading-none">{currentUser.points} pts</strong>
              <span className="text-[9.5px] bg-black/60 text-purple-300 border border-purple-500/15 px-2 py-0.5 rounded font-mono font-medium block">
                Patente: {currentUser.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left section: prizes shop grid */}
            <div className="md:col-span-2 space-y-4 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-yellow-400 animate-bounce" /> Recompensas Disponíveis para Retirada
                </h3>
              </div>

              {redeemErrorMessage && (
                <div className="p-3 bg-red-950/20 text-red-400 border border-red-500/20 rounded-xl text-xs">
                  ❌ Estorno: {redeemErrorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {REWARDS.map(reward => {
                  const isEligible = currentUser.points >= reward.points;
                  const ratio = Math.min(Math.round((currentUser.points / reward.points) * 100), 100);

                  return (
                    <div key={reward.id} className="p-4 rounded-xl border border-zinc-850 bg-zinc-950/40 space-y-3.5 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded font-mono uppercase font-bold">
                            {reward.category}
                          </span>
                          <span className="text-xl">{reward.icon}</span>
                        </div>
                        <h4 className="text-xs font-bold text-white leading-tight">{reward.name}</h4>
                        <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2">{reward.desc}</p>
                      </div>

                      <div className="space-y-3 pt-2">
                        {!isEligible && (
                          <div className="space-y-0.5">
                            <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                              <span>Progresso:</span>
                              <span>{currentUser.points}/{reward.points} {reward.points === 1000 ? 'pts' : 'pts'}</span>
                            </div>
                            <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-500/20" style={{ width: `${ratio}%` }} />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2 border-t border-zinc-900/60 pt-2.5">
                          <span className="text-xs font-mono font-bold text-yellow-400">
                            💰 {reward.points} pts
                          </span>
                          
                          <button
                            onClick={() => handleRedeemItemClick(reward.id, reward.points, reward.name)}
                            disabled={!isEligible || isRedeeming}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                              isEligible 
                                ? 'bg-yellow-500 hover:bg-yellow-450 text-black shadow-md' 
                                : 'bg-zinc-900 text-zinc-650 cursor-not-allowed border border-zinc-850'
                            }`}
                          >
                            {isRedeeming ? 'Invocando...' : isEligible ? 'Resgatar' : 'Faltam Pontos'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Side: Gamified Leaderboard users & cupom wallet */}
            <div className="space-y-5 text-left md:col-span-1">
              
              {/* Leaderboard list */}
              <div className="glass-panel p-4 rounded-xl border-zinc-850 space-y-3.5">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display flex items-center gap-1">
                    <Award className="w-4 h-4 text-green-400 animate-pulse" /> Ranking de Inovação {new Date().getFullYear()}
                  </h3>
                  <p className="text-[9px] text-zinc-500">Pontuação cumulativa geral de ideias registradas da unidade</p>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {topCollaborators.map((u, idx) => {
                    const rankMedal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🎗️';
                    return (
                      <div key={u.id} className="flex items-center justify-between bg-zinc-950 p-2 rounded-lg border border-zinc-900 text-xs">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="text-xs font-mono shrink-0 select-none w-4 text-center">{rankMedal}</span>
                          <img 
                            src={u.avatar} 
                            alt={u.name} 
                            className="w-6.5 h-6.5 rounded-full object-cover border border-purple-500/20 shrink-0" 
                          />
                          <div className="overflow-hidden">
                            <span className="text-xs font-bold text-white block truncate leading-tight">{u.name}</span>
                            <span className="text-[9px] text-zinc-550 block truncate">{u.unidade || 'Botafogo Sede'}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono font-bold text-yellow-400 block">{u.points} pts</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Redeemed cupons log */}
              <div className="glass-panel p-4 rounded-xl border-zinc-850 space-y-2.5">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase font-mono block">Histórico de Cupons Gerados ({redeemHistory.length})</span>

                {redeemHistory.length > 0 ? (
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {redeemHistory.map(item => (
                      <div key={item.id} className="p-2 bg-zinc-950 rounded border border-zinc-900 text-[10px] space-y-1 text-left">
                        <div className="flex justify-between items-center font-semibold text-white">
                          <span className="truncate max-w-28">{item.name}</span>
                          <span className="text-yellow-450">-{item.points} pts</span>
                        </div>
                        <div className="flex justify-between items-center text-[9px] text-zinc-500 font-mono">
                          <span>{item.date}</span>
                          <span className="text-green-400 uppercase font-bold font-mono tracking-wider">{item.voucher}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center bg-zinc-950 p-4 border border-zinc-900 rounded-lg">
                    <p className="text-[11px] text-zinc-650">Nenhum resgate efetuado. Seus pontos continuam integrados no ranking!</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* VOUCHER GENERATION DETAILED MODAL MODULATOR */}
      {/* ========================================================== */}
      {activeVoucher && (
        <div id="rewards_voucher_modal" className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="relative bg-zinc-950 border-2 border-yellow-500/30 rounded-2xl p-6 md:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="absolute inset-1 border border-zinc-850 rounded-xl -z-10" />
            
            <div className="space-y-1.5">
              <span className="w-11 h-11 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center justify-center mx-auto text-yellow-400 text-lg font-bold">
                ✓
              </span>
              <h3 className="text-sm font-bold font-display text-white uppercase tracking-wider pt-1">Resgate Confirmado!</h3>
              <p className="text-[11px] text-zinc-500 px-3">Seu cupom foi registrado no servidor. Forneça o código abaixo para receber seu brinde físico:</p>
            </div>

            <div className="p-3 bg-zinc-900 border border-yellow-500/20 rounded-xl text-center space-y-0.5">
              <span className="text-[8.5px] text-zinc-500 tracking-wider font-mono uppercase block font-semibold">CÓDIGO DE RETIRADA AUTORIZADO</span>
              <strong className="text-base font-mono text-green-400 tracking-widest block uppercase font-bold">{activeVoucher.code}</strong>
              <span className="text-[10px] text-zinc-400 block pt-1 font-semibold">{activeVoucher.name}</span>
            </div>

            <div className="text-[11px] text-zinc-500 font-sans leading-relaxed text-left bg-zinc-950/80 p-3 rounded-lg border border-zinc-900 space-y-1">
              <p>📍 <strong>Local de Retirada:</strong> Setor de RH ou Secretaria da Unidade: <strong className="text-zinc-350">{currentUser.unidade || 'Botafogo Sede'}</strong>.</p>
              <p>🔑 <strong>Matrícula:</strong> {currentUser.matricula || '0028163'}</p>
            </div>

            <button
              onClick={() => setActiveVoucher(null)}
              className="w-full bg-yellow-500 hover:bg-yellow-450 text-black py-2 rounded-xl text-xs font-semibold shadow-md transition-all select-none"
            >
              Concluir e Voltar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
