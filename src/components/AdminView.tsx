import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Terminal, 
  FileText, 
  Search, 
  AlertTriangle,
  UserCheck,
  Cpu,
  RefreshCcw,
  ExternalLink,
  Trash2,
  Database,
  BookOpen,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Settings
} from 'lucide-react';
import { UserProfile, SystemAuditLog, UserRole } from '../types';

interface AdminViewProps {
  users: UserProfile[];
  logs: SystemAuditLog[];
  onRoleChange: (userId: string, newRole: UserRole) => void;
  onRefreshLogs: () => void;
}

export default function AdminView({ 
  users, 
  logs, 
  onRoleChange, 
  onRefreshLogs 
}: AdminViewProps) {
  const [userNameFilter, setUserNameFilter] = useState('');
  const [logFilter, setLogFilter] = useState('');
  
  // Database maintenance & documentation states
  const [confirmReset, setConfirmReset] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetResult, setResetResult] = useState<'success' | 'error' | null>(null);
  const [showSetupInstructions, setShowSetupInstructions] = useState(false);

  const handleResetDatabase = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    
    setIsResetting(true);
    setResetResult(null);
    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        setResetResult('success');
        setConfirmReset(false);
        // Refresh structural states across active viewports
        onRefreshLogs();
        setTimeout(() => {
          setResetResult(null);
        }, 5000);
      } else {
        setResetResult('error');
      }
    } catch (err) {
      console.error('[FRONTEND] Database reset communication failed:', err);
      setResetResult('error');
    } finally {
      setIsResetting(false);
    }
  };

  const filteredUsers = users.filter(usr =>
    usr.name.toLowerCase().includes(userNameFilter.toLowerCase()) ||
    usr.email.toLowerCase().includes(userNameFilter.toLowerCase()) ||
    usr.department.toLowerCase().includes(userNameFilter.toLowerCase())
  );

  const filteredLogs = logs.filter(lg =>
    lg.userName.toLowerCase().includes(logFilter.toLowerCase()) ||
    lg.action.toLowerCase().includes(logFilter.toLowerCase()) ||
    lg.details.toLowerCase().includes(logFilter.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left" role="main">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-900 pb-4">
        <div>
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
            <ShieldCheck className="w-5.5 h-5.5 text-purple-400" /> Painel Geral de Administração
          </h2>
          <p className="text-xs text-zinc-400">Controle de credenciais, permissório regional e logs de rastreabilidade (LGPD) em vigor.</p>
        </div>
        <button
          id="btn_refresh_logs_auditor"
          onClick={onRefreshLogs}
          className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all"
        >
          <RefreshCcw className="w-3.5 h-3.5 text-purple-400" /> Atualizar Logs & Perfis
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1 & 2: User management list & Role switches */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-xl border-zinc-800 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-semibold uppercase text-white font-display flex items-center gap-1">
              <Users className="w-4 h-4 text-green-400" /> Gerenciamento de Colaboradores e Níveis de Permissão
            </h3>
            
            <div className="relative w-48">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
              <input
                id="search_admin_user_input"
                type="text"
                placeholder="Pesquisar perfis..."
                value={userNameFilter}
                onChange={(e) => setUserNameFilter(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-2 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead>
                <tr className="border-b border-zinc-900 text-zinc-500 text-[10px] font-mono uppercase">
                  <th className="py-2.5">Colaborador</th>
                  <th>Departamento</th>
                  <th>Pontuação</th>
                  <th>Nível de Permissão (Role)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60">
                {filteredUsers.map((usr) => (
                  <tr key={usr.id} className="hover:bg-zinc-900/10">
                    {/* Author ID */}
                    <td className="py-3.5 flex items-center gap-2">
                      <img 
                        src={usr.avatar} 
                        alt={usr.name} 
                        className="w-7 h-7 rounded-full object-cover border border-zinc-800"
                      />
                      <div>
                        <span className="font-semibold text-white block leading-tight">{usr.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono block">{usr.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-zinc-400 font-medium">{usr.department}</span>
                    </td>
                    <td className="font-mono text-green-400 font-bold">
                      {usr.points} pts
                    </td>
                    <td>
                      <select
                        id={`select_role_user_${usr.id}`}
                        value={usr.role}
                        onChange={(e) => onRoleChange(usr.id, e.target.value as UserRole)}
                        className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300 font-medium focus:outline-none focus:border-purple-500"
                      >
                        <option value="Colaborador">Colaborador</option>
                        <option value="Líder/Gestor">Líder/Gestor</option>
                        <option value="Comissão Avaliadora">Comissão Avaliadora</option>
                        <option value="Administrador">Administrador</option>
                        <option value="Super Admin">Super Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Column 3: Maintenance & Config, LGPD Guidelines */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Database Maintenance Panel */}
          <div className="glass-panel p-5 rounded-xl border-zinc-800 space-y-4">
            <span className="text-[10px] text-zinc-500 font-mono font-semibold uppercase block flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-red-400" /> Manutenção & Redefinição
            </span>
            
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white font-display">Limpar e Restaurar Servidor</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Esta ação remove permanentemente todas as ideias enviadas, logs adicionais de auditoria, comentários e curtidas criadas pelos usuários, restaurando o ecossistema FIRJAN a seu estado original limpo.
              </p>
              
              <div className="pt-2">
                <button
                  id="btn_reset_database"
                  onClick={handleResetDatabase}
                  disabled={isResetting}
                  className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isResetting ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' :
                    confirmReset ? 'bg-red-950/70 text-red-200 border border-red-500 hover:bg-red-900' :
                    resetResult === 'success' ? 'bg-green-950/60 text-green-350 border border-green-500' :
                    resetResult === 'error' ? 'bg-red-950 text-red-200 border border-red-500' :
                    'bg-zinc-900 border border-zinc-800 text-zinc-100 hover:bg-zinc-850 hover:text-white'
                  }`}
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                  {isResetting ? 'Limpando e reconfigurando...' :
                   confirmReset ? '⚠️ Confirmar Reset Geral do Banco!' :
                   resetResult === 'success' ? '✅ Banco restaurado com sucesso!' :
                   resetResult === 'error' ? '❌ Erro ao limpar banco' :
                   'Zerar Banco de Dados'}
                </button>
                
                {confirmReset && (
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="w-full mt-2 text-center text-[10px] text-zinc-500 underline hover:text-zinc-300 transition-all font-mono"
                  >
                    Cancelar Operação
                  </button>
                )}
                
                {resetResult === 'success' && (
                  <p className="text-[10px] text-green-400 text-center mt-2 font-mono flex items-center justify-center gap-1 animate-pulse">
                    <CheckCircle2 className="w-3 h-3" /> Estado restaurado ao padrão de fábrica!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Step-by-Step Setup Guide */}
          <div className="glass-panel p-5 rounded-xl border-zinc-800 space-y-4">
            <button
              onClick={() => setShowSetupInstructions(!showSetupInstructions)}
              className="w-full text-left flex justify-between items-center focus:outline-none"
            >
              <span className="text-[10px] text-zinc-500 font-mono font-semibold uppercase flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-purple-400" /> Passo a Passo de Setup
              </span>
              {showSetupInstructions ? (
                <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              )}
            </button>
            
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white font-display">Configuração de Banco Integrado</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Como configurar seu Cloud Firestore Corporativo para persistência durável no ecossistema da Federação das Indústrias:
              </p>
              
              {showSetupInstructions && (
                <ul className="space-y-3 pt-2 text-[11px] text-zinc-300 leading-relaxed font-sans border-t border-zinc-900 mt-2">
                  <li className="space-y-1">
                    <strong className="text-white block font-display">1. Criar Projeto no Firebase</strong>
                    <span className="text-zinc-400 block">
                      Acesse a plataforma oficial <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline inline-flex items-center gap-0.5">Console Firebase <ExternalLink className="w-2.5 h-2.5" /></a> e adicione um novo projeto para sua regional.
                    </span>
                  </li>
                  
                  <li className="space-y-1">
                    <strong className="text-white block font-display">2. Ativar o Cloud Firestore</strong>
                    <span className="text-zinc-400 block">
                      No menu lateral, vá para <strong>Cloud Firestore</strong>, clique em <strong>Criar Banco de Dados</strong>, escolha o modo de início adequado (ex: Teste) e selecione a região do servidor (recomendado: <code>southamerica-east1</code>).
                    </span>
                  </li>
                  
                  <li className="space-y-1">
                    <strong className="text-white block font-display">3. Registrar Aplicativo Web (Web App)</strong>
                    <span className="text-zinc-400 block">
                      Nas configurações do projeto, sob <i>Seus Aplicativos</i>, crie uma aplicação Web para gerar as variáveis de ambiente necessárias. Ative também a autenticação se optar por Google Workspace Sing-In.
                    </span>
                  </li>
                  
                  <li className="space-y-1">
                    <strong className="text-white block font-display">4. Salvar Credenciais de Acesso</strong>
                    <span className="text-zinc-400 block">
                      Copie o objeto do código e preencha as credenciais no arquivo <code>firebase-applet-config.json</code> localizado na raiz do projeto neste formato:
                    </span>
                    <pre className="p-2 bg-black rounded border border-zinc-900 font-mono text-[9px] text-zinc-400 overflow-x-auto whitespace-pre">
{`{
  "apiKey": "AIzaSy...",
  "authDomain": "...firebaseapp.com",
  "projectId": "firjan-connect-...",
  "storageBucket": "...appspot.com",
  "messagingSenderId": "...",
  "appId": "..."
}`}
                    </pre>
                  </li>

                  <li className="space-y-1">
                    <strong className="text-white block font-display">5. Regras de Segurança (Rules)</strong>
                    <span className="text-zinc-400 block">
                      Copie o conteúdo integral do arquivo <code>firestore.rules</code> na raiz e cole na aba <strong>Rules</strong> do seu console para garantir conformidade LGPD e segurança de perfis contra vazamento.
                    </span>
                  </li>

                  <li className="space-y-1">
                    <strong className="text-white block font-display">6. Inicialização Automatizada</strong>
                    <span className="text-zinc-400 block">
                      Dê play ou reinicie o ambiente de desenvolvimento. O script do servidor de API do FIRJAN Connect detecta as credenciais preparadas e irá semear automaticamente a estrutura básica padrão pré-configurada!
                    </span>
                  </li>
                </ul>
              )}
              
              {!showSetupInstructions && (
                <button
                  onClick={() => setShowSetupInstructions(true)}
                  className="w-full text-center py-1 bg-zinc-950 border border-zinc-900 rounded-lg text-[10px] text-purple-400 hover:text-purple-300 font-mono"
                >
                  Expandir Instruções Detalhadas
                </button>
              )}
            </div>
          </div>

          {/* Compliance & LGPD Panel */}
          <div className="glass-panel p-5 rounded-xl border-zinc-800 space-y-4">
            <span className="text-[10px] text-zinc-500 font-mono font-semibold uppercase block flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-purple-400" /> Diretrizes de Governança & LGPD
            </span>

            <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-900 text-xs text-zinc-400 space-y-3 leading-relaxed">
              <h4 className="font-bold text-white font-display">Compliance de Dados na FIRJAN</h4>
              <p>
                Toda interação, criação de ideias ou validação operacional gera logs permanentes contendo o ID do usuário que desencadeou a ação, data-hora precisa e o endereço IP do terminal.
              </p>
              <p>
                Qualquer exclusão ou modificação de dados sensíveis obedece ao regulamento nacional da Lei Geral de Proteção de Dados (LGPD).
              </p>
              <div className="p-2.5 bg-yellow-950/25 border border-yellow-500/20 text-yellow-400 rounded text-[10px] leading-snug">
                ⚠️ Em auditoria nacional, o descarte manual ou destruição de logs segue auditoria estrita sob dupla aprovação.
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Audit System Logs Shell terminal (La crème de la crème) */}
      <div className="glass-panel p-5 rounded-xl border-zinc-800 space-y-3">
        <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
          <h3 className="text-xs font-semibold text-white uppercase font-display flex items-center gap-1">
            <Terminal className="w-4 h-4 text-purple-400" /> Terminal de Auditoria e Logs de Ação (Conformidade LGPD)
          </h3>
          
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
            <input
              id="admin_terminal_search"
              type="text"
              placeholder="Digitar filtro de log..."
              value={logFilter}
              onChange={(e) => setLogFilter(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-2 py-1 text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none"
            />
          </div>
        </div>

        {/* Shell content blocks */}
        <div className="bg-black p-4 rounded-xl border border-zinc-800/80 font-mono text-[11px] text-zinc-300 space-y-2 max-h-60 overflow-y-auto pr-1">
          {filteredLogs.length === 0 ? (
            <p className="text-zinc-500 text-center py-4">Nenhum evento registrado de auditoria.</p>
          ) : (
            filteredLogs.map((lg) => (
              <div key={lg.id} className="border-b border-zinc-900/60 pb-1.5 last:border-b-0">
                <div className="flex justify-between items-start text-[10px] text-zinc-500 mb-0.5">
                  <span className="text-green-400 font-semibold">[ID: {lg.id}] • {new Date(lg.timestamp).toISOString()}</span>
                  <span className="text-purple-400 bg-purple-950/20 px-1 rounded">DEPART: {lg.ip}</span>
                </div>
                <div>
                  <strong className="text-white uppercase">{lg.action}</strong> feito por &lt;{lg.userName}&gt; • <span className="text-zinc-400">{lg.details}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
