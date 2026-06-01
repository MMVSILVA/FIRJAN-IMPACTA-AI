import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Settings, 
  HelpCircle, 
  Zap, 
  CheckCircle,
  FileSpreadsheet,
  Download,
  Database,
  Search,
  Plus
} from 'lucide-react';
import { OperationalInsight } from '../types';

interface EfficiencyViewProps {
  insights: OperationalInsight[];
  onAddInsight: (insightData: any) => Promise<void>;
  onResolveInsight: (id: string, status: OperationalInsight['status']) => Promise<void>;
}

export default function EfficiencyView({ 
  insights, 
  onAddInsight, 
  onResolveInsight 
}: EfficiencyViewProps) {
  const [showLogForm, setShowLogForm] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState<OperationalInsight['type']>('gargalo');
  const [area, setArea] = useState('Secretarias de Escolas SENAI');
  const [description, setDescription] = useState('');
  const [impact, setImpact] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogInsightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setIsSubmitting(true);
    try {
      await onAddInsight({
        title,
        type,
        area,
        description,
        impact: impact || 'Ociosidade parcial ou retrabalho administrativo',
        recommendation: recommendation || 'Padronizar processos operacionais através das ferramentas digitais do Firjan Connect AI'
      });
      setTitle('');
      setDescription('');
      setImpact('');
      setRecommendation('');
      setShowLogForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredInsights = insights.filter(ins =>
    ins.title.toLowerCase().includes(searchVal.toLowerCase()) ||
    ins.area.toLowerCase().includes(searchVal.toLowerCase()) ||
    ins.description.toLowerCase().includes(searchVal.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left" role="main">
      {/* Welcome & Overview Header */}
      <div className="glass-panel p-5 rounded-xl border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] bg-green-500/10 text-green-300 font-mono tracking-widest uppercase border border-green-500/20 px-2 py-0.5 rounded-full">
            EFICIÊNCIA OPERACIONAL
          </span>
          <h2 className="text-xl font-bold font-display text-white mt-1.5">Radar IA de Otimização e Gargalos</h2>
          <p className="text-xs text-zinc-400">Varreduras proativas com algoritmos generativos para simplificar aprovações hierárquicas e fluxos corporativos.</p>
        </div>

        {!showLogForm && (
          <button
            id="btn_trigger_log_gargalo"
            onClick={() => setShowLogForm(true)}
            className="w-full md:w-auto bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg focus:ring-2 focus:ring-purple-300"
          >
            <Plus className="w-4 h-4" /> Notificar Alerta de Gargalo
          </button>
        )}
      </div>

      {/* Log Bottleneck Form */}
      {showLogForm && (
        <div id="section_add_insight_form" className="glass-panel p-5 rounded-xl border-zinc-800/80 space-y-4 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
            <h3 className="text-xs font-semibold uppercase text-white font-display flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-orange-400" /> Relatar Novo Gargalo ou Desperdício
            </h3>
            <button 
              onClick={() => setShowLogForm(false)}
              className="text-xs text-zinc-500 hover:text-white"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleLogInsightSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Título Breve do Alerta *</label>
                <input
                  id="input_insight_title"
                  type="text"
                  placeholder="Ex: Tempo excessivo em faturamento de notas"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Tipo de Obstáculo</label>
                <select
                  id="select_insight_type"
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
                >
                  <option value="gargalo">Gargalo</option>
                  <option value="retrabalho">Retrabalho</option>
                  <option value="processo lento">Processo Lento</option>
                  <option value="desperdício">Desperdício</option>
                  <option value="duplicidade">Duplicidade</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Área / Setor Afetado</label>
                <input
                  id="input_insight_area"
                  type="text"
                  placeholder="Ex: Secretaria Acadêmica / SESI RJ frotas"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Descrição Detalhada do Obstáculo *</label>
              <textarea
                id="textarea_insight_desc"
                placeholder="Descreva as etapas lentas ou desperdício de insumos que observou neste fluxo..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Impacto Mensurável Estimado (Tempo ou Custo)</label>
                <input
                  id="input_insight_impact"
                  type="text"
                  placeholder="Ex: Atraso de 4 dias úteis no faturamento ou desperdício de copos descartáveis"
                  value={impact}
                  onChange={(e) => setImpact(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Recomendação Inicial de Melhoria (Sua sugestão)</label>
                <input
                  id="input_insight_recom"
                  type="text"
                  placeholder="Ex: Digitalização automática de notas integradas com o banco"
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none"
                />
              </div>
            </div>

            <button
              id="btn_submit_notific_gargalo"
              type="submit"
              disabled={isSubmitting}
              className="bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded-lg text-xs font-semibold float-right"
            >
              {isSubmitting ? 'Registrando...' : 'Submeter Alerta de Gargalo'}
            </button>
            <div className="clear-both" />
          </form>
        </div>
      )}

      {/* Grid Table of alerts and intelligence mapping */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
          <span className="text-[10px] text-zinc-500 font-mono font-semibold uppercase block">Obstáculos Mapeados em Tempo Real ({filteredInsights.length})</span>
          
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
            <input
              id="insight_grid_search"
              type="text"
              placeholder="Pesquisar por setor, impacto..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-2 py-1.5 text-xs text-zinc-100 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredInsights.map((ins) => (
            <div 
              key={ins.id} 
              className={`glass-panel p-4.5 rounded-xl border flex flex-col justify-between space-y-4 ${
                ins.status === 'Resolvido' 
                  ? 'border-green-500/20 bg-green-950/5' 
                  : ins.status === 'Analisando'
                  ? 'border-cyan-500/20 bg-cyan-950/5'
                  : 'border-orange-500/20 bg-orange-950/5'
              }`}
            >
              {/* Card Meta */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-start gap-1">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-mono leading-none font-bold uppercase ${
                    ins.type === 'gargalo' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/10' :
                    ins.type === 'retrabalho' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/10' :
                    'bg-yellow-500/10 text-yellow-500 border border-yellow-500/10'
                  }`}>
                    {ins.type}
                  </span>

                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                    ins.status === 'Resolvido' ? 'bg-green-500/25 text-green-300' :
                    ins.status === 'Analisando' ? 'bg-cyan-500/25 text-cyan-300' :
                    'bg-orange-500/25 text-orange-300'
                  }`}>
                    {ins.status}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white uppercase font-display leading-tight">{ins.title}</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{ins.description}</p>
              </div>

              {/* Impact / Solution guidelines */}
              <div className="space-y-2 pt-2.5 border-t border-zinc-900/80 text-[11px] leading-snug font-sans">
                <div className="text-zinc-500"><strong className="text-zinc-400 font-mono">⚠️ Gargalo:</strong> {ins.impact}</div>
                <div className="text-green-400"><strong className="text-green-300 font-sans">💡 Solução Reativa:</strong> {ins.recommendation}</div>
                <span className="text-[9px] bg-black/40 text-zinc-500 px-1.5 py-0.5 rounded font-mono inline-block">🏢 Setor: {ins.area}</span>
              </div>

              {/* Interactive Status Transition buttons */}
              <div className="flex gap-1.5 pt-2 border-t border-zinc-900/40">
                {ins.status !== 'Analisando' && ins.status !== 'Resolvido' && (
                  <button
                    id={`btn_transition_analisando_${ins.id}`}
                    onClick={() => onResolveInsight(ins.id, 'Analisando')}
                    className="flex-1 py-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40 hover:bg-cyan-900/30 text-[10px] font-semibold transition-all"
                  >
                    Mandar p/ Análise
                  </button>
                )}
                
                {ins.status !== 'Resolvido' && (
                  <button
                    id={`btn_transition_resolvido_${ins.id}`}
                    onClick={() => onResolveInsight(ins.id, 'Resolvido')}
                    className="flex-1 py-1 rounded bg-green-500 hover:bg-green-400 text-black text-[10px] font-semibold transition-all text-center"
                  >
                    Marcar como Resolvido
                  </button>
                )}

                {ins.status === 'Resolvido' && (
                  <span className="w-full text-center py-1.5 bg-green-950/30 text-green-400 border border-green-950/40 rounded text-[10px] uppercase font-mono tracking-widest block">
                    ✓ Obstáculo Eliminado
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export analytical reports to Excel (Simulating download data exports) */}
      <div className="p-4 bg-zinc-950/40 rounded-xl border border-zinc-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="space-y-0.5">
          <h4 className="text-xs font-semibold text-white">Relatórios Analíticos consolidados (LGPD & Custos)</h4>
          <p className="text-[10px] text-zinc-550">Exportação de dados auditados conformes com as diretrizes de governança da Firjan.</p>
        </div>
        <button
          id="btn_export_xlsx"
          onClick={() => {
            alert('Relatório consolidado de eficiência operacional gerado com sucesso em conformidade com a LGPD e salvo na Intranet Firjan corporativa!');
          }}
          className="bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 px-3.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-green-400" /> Exportar Dados (.XLSX)
        </button>
      </div>

    </div>
  );
}
