import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Lightbulb, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Award, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  BookOpen,
  Cpu,
  ShieldCheck,
  User,
  LogOut,
  Sparkles,
  HelpCircle,
  Menu,
  X,
  Volume2,
  Lock,
  UserPlus,
  MessageSquare,
  Cog,
  Edit3,
  Gift
} from 'lucide-react';

// Imports of Modular Component Views
import DashboardView from './components/DashboardView';
import IdeaPortalView from './components/IdeaPortalView';
import WikiView from './components/WikiView';
import ChatView from './components/ChatView';
import EfficiencyView from './components/EfficiencyView';
import AdminView from './components/AdminView';
import AccessibilityToolbar from './components/AccessibilityToolbar';
import UserMedals from './components/UserMedals';

import { 
  Idea, 
  UserProfile, 
  WikiArticle, 
  OperationalInsight, 
  SystemAuditLog, 
  AccessibilitySettings,
  UserRole
} from './types';

import { ESTADOS, UNIDADES_SENAI, UNIDADES_SESI, CARGOS_FUNCIONAIS } from './data/brazilData';

export default function App() {
  // Current user / profile state - Always starts on the login screen upon app load
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [simulatedUsers, setSimulatedUsers] = useState<UserProfile[]>([]);
  const [connectionErrorMsg, setConnectionErrorMsg] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showSimulations, setShowSimulations] = useState(true);

  // Advanced Security & Authentication additions
  const [isMfaActive, setIsMfaActive] = useState(false);
  const [mfaDigit1, setMfaDigit1] = useState('');
  const [mfaDigit2, setMfaDigit2] = useState('');
  const [mfaDigit3, setMfaDigit3] = useState('');
  const [mfaDigit4, setMfaDigit4] = useState('');
  const [mfaDigit5, setMfaDigit5] = useState('');
  const [mfaDigit6, setMfaDigit6] = useState('');
  const [showMfaStep, setShowMfaStep] = useState(false);
  const [mfaError, setMfaError] = useState('');
  const [pendingMfaUser, setPendingMfaUser] = useState<UserProfile | null>(null);
  
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState('');

  // Registration panel states (User creation fields with size photo limits up to 2MB)
  const [isRegistering, setIsRegistering] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regMatricula, setRegMatricula] = useState('');
  const [regSetor, setRegSetor] = useState('SENAI');
  const [regUnidade, setRegUnidade] = useState('');
  const [regEstado, setRegEstado] = useState('RJ');
  const [regCidade, setRegCidade] = useState('Rio de Janeiro');
  const [regRole, setRegRole] = useState<UserRole>('Colaborador');
  const [regAvatar, setRegAvatar] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [isSubmitRegistering, setIsSubmitRegistering] = useState(false);
  const [regMfaEnabled, setRegMfaEnabled] = useState(false);

  // States for Editing profile
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editMatricula, setEditMatricula] = useState('');
  const [editSetor, setEditSetor] = useState('SENAI');
  const [editUnidade, setEditUnidade] = useState('');
  const [editEstado, setEditEstado] = useState('RJ');
  const [editCidade, setEditCidade] = useState('Rio de Janeiro');
  const [editAvatar, setEditAvatar] = useState('');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [isSubmitUpdatingProfile, setIsSubmitUpdatingProfile] = useState(false);
  const [editMfaEnabled, setEditMfaEnabled] = useState(false);

  // States for recovery password redefinition step
  const [simulatedCode, setSimulatedCode] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [isForgotPasswordStep2, setIsForgotPasswordStep2] = useState(false);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Collapsed on mobile by default, toggled easily

  // Main synchronized collections
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [wikiArticles, setWikiArticles] = useState<WikiArticle[]>([]);
  const [operationalInsights, setOperationalInsights] = useState<OperationalInsight[]>([]);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>([]);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Accessibility setups
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>({
    highContrast: false,
    fontSize: 'base',
    dyslexicFont: false,
    screenReaderEnabled: false,
    cognitiveSimplified: false
  });

  const [isServerConnecting, setIsServerConnecting] = useState(false);

  // Load backend database state on mount or profile change with automatic retries for booting server robustness
  const loadInitialData = async () => {
    setIsServerConnecting(true);
    setConnectionErrorMsg('');
    
    const maxRetries = 4;
    let attempt = 0;
    let success = false;
    let lastErrorStatus = '';
    let lastErrorMessage = '';

    while (attempt < maxRetries && !success) {
      try {
        const res = await fetch(`/api/auth/users?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          setSimulatedUsers(data);
          success = true;
        } else {
          lastErrorStatus = `Http Error ${res.status}`;
          lastErrorMessage = res.statusText || 'Erro de conexão intermediária';
          attempt++;
          if (attempt < maxRetries) {
            // Wait 2 seconds before retrying
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      } catch (err: any) {
        console.error(`Attempt ${attempt + 1} failed:`, err);
        lastErrorMessage = err?.message || 'Falha de rede indefinida';
        attempt++;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    if (!success) {
      if (lastErrorStatus) {
        setConnectionErrorMsg(`${lastErrorStatus}: ${lastErrorMessage}`);
      } else {
        setConnectionErrorMsg(lastErrorMessage);
      }
    }

    try {
      await fetchState();
    } catch (err) {
      console.error('Failed state sync:', err);
    }
    setIsServerConnecting(false);
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Periodic statistics & logs refresher
  const fetchState = async (skipUserRefresh = false) => {
    try {
      const resUsers = await fetch(`/api/auth/users?t=${Date.now()}`);
      if (resUsers.ok) {
        let data = await resUsers.json();
        if (!Array.isArray(data)) {
          data = [];
        }

        // Merge in locally registered users from localStorage (Vercel offline persistent backup)
        const localReg = localStorage.getItem('firjan_local_users');
        if (localReg) {
          try {
            const parsedLocal = JSON.parse(localReg);
            if (Array.isArray(parsedLocal)) {
              parsedLocal.forEach(lu => {
                const idx = data.findIndex((u: UserProfile) => u.email.trim().toLowerCase() === lu.email.trim().toLowerCase());
                if (idx !== -1) {
                  // Keep the local representation since it has points earned
                  if ((lu.points || 0) > (data[idx].points || 0)) {
                    data[idx] = { ...data[idx], ...lu };
                  }
                } else {
                  data.push(lu);
                }
              });
            }
          } catch (e) {
            console.error('Failed to merge local users:', e);
          }
        }

        setSimulatedUsers(data);
        
        // Refresh active user details if logged in and not logging out
        if (currentUser && !skipUserRefresh) {
          const updatedSelf = data.find((u: UserProfile) => u.id === currentUser.id);
          if (updatedSelf) {
            setCurrentUser(updatedSelf);
            localStorage.setItem('firjan_connected_user', JSON.stringify(updatedSelf));
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch active users during state sync:', err);
    }

    try {
      const resIdeas = await fetch(`/api/ideas?t=${Date.now()}`);
      if (resIdeas.ok) {
        let data = await resIdeas.json();
        if (!Array.isArray(data)) {
          data = [];
        }
        
        // Merge and backup created ideas locally to survive Vercel backend recycling
        const savedIdeas = localStorage.getItem('firjan_local_ideas');
        if (savedIdeas) {
          try {
            const parsedIdeas = JSON.parse(savedIdeas);
            if (Array.isArray(parsedIdeas)) {
              parsedIdeas.forEach(li => {
                const idx = data.findIndex((id: Idea) => id.id === li.id);
                if (idx !== -1) {
                  // Keep whichever has higher likes, comments or more advanced status
                  const serverComments = data[idx].comments?.length || 0;
                  const localComments = li.comments?.length || 0;
                  const serverLikes = data[idx].likes || 0;
                  const localLikes = li.likes || 0;
                  if (localComments >= serverComments || localLikes >= serverLikes || li.status !== 'Em análise') {
                    data[idx] = { ...data[idx], ...li };
                  }
                } else {
                  data.unshift(li); // Place new local ideas on top
                }
              });
            }
          } catch (e) {
            console.error('Failed to merge local ideas:', e);
          }
        }
        
        setIdeas(data);
      }
    } catch (err) {
      console.error('Failed to fetch ideas:', err);
    }

    try {
      const resWiki = await fetch(`/api/wiki?t=${Date.now()}`);
      if (resWiki.ok) {
        let data = await resWiki.json();
        if (!Array.isArray(data)) {
          data = [];
        }

        // Merge locally created articles
        const localArticles = localStorage.getItem('firjan_local_wiki_articles');
        if (localArticles) {
          try {
            const parsedArticles = JSON.parse(localArticles);
            if (Array.isArray(parsedArticles)) {
              parsedArticles.forEach(la => {
                if (!data.some((a: WikiArticle) => a.id === la.id)) {
                  data.push(la);
                }
              });
            }
          } catch (e) {
            console.error('Failed to merge local wiki articles:', e);
          }
        }

        // Apply local favorites
        const localFavs = localStorage.getItem('firjan_local_wiki_favorites');
        if (localFavs) {
          try {
            const parsedFavs = JSON.parse(localFavs);
            if (Array.isArray(parsedFavs)) {
              data = data.map((a: WikiArticle) => ({
                ...a,
                isFavorite: parsedFavs.includes(a.id) ? true : a.isFavorite
              }));
            }
          } catch (e) {
            console.error('Failed to apply local favorites:', e);
          }
        }

        setWikiArticles(data);
      }
    } catch (err) {
      console.error('Failed to fetch wiki:', err);
    }

    try {
      const resIns = await fetch(`/api/insights?t=${Date.now()}`);
      if (resIns.ok) {
        let data = await resIns.json();
        if (!Array.isArray(data)) {
          data = [];
        }

        // Merge local operational insights
        const localInsights = localStorage.getItem('firjan_local_insights');
        if (localInsights) {
          try {
            const parsedInsights = JSON.parse(localInsights);
            if (Array.isArray(parsedInsights)) {
              parsedInsights.forEach(li => {
                const idx = data.findIndex((i: OperationalInsight) => i.id === li.id);
                if (idx !== -1) {
                  data[idx] = { ...data[idx], ...li };
                } else {
                  data.unshift(li);
                }
              });
            }
          } catch (e) {
            console.error('Failed to merge local insights:', e);
          }
        }

        setOperationalInsights(data);
      }
    } catch (err) {
      console.error('Failed to fetch insights:', err);
    }

    try {
      const resLogs = await fetch(`/api/audit-events?t=${Date.now()}`);
      if (resLogs.ok) {
        let data = await resLogs.json();
        if (!Array.isArray(data)) {
          data = [];
        }

        // Merge in locally registered logs
        const localLogs = localStorage.getItem('firjan_local_logs');
        if (localLogs) {
          try {
            const parsedLogs = JSON.parse(localLogs);
            if (Array.isArray(parsedLogs)) {
              parsedLogs.forEach(ll => {
                if (!data.some((l: SystemAuditLog) => l.id === ll.id)) {
                  data.unshift(ll);
                }
              });
            }
          } catch (e) {
            console.error('Failed to merge local logs:', e);
          }
        }

        setAuditLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    }
  };

  // Reset inactive timers deactivated as requested by users. Done.
  const resetTimer = () => {
    // Timeout functionality deactivated successfully.
  };

  // Login handler with rigorous domain enforce @firjan.com.br
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim()) {
      setLoginError('Por favor digite um e-mail válido.');
      return;
    }

    const emailStr = loginEmail.trim().toLowerCase();
    if (!emailStr.endsWith('@firjan.com.br')) {
      setLoginError('Acesso recusado. Domínio não registrado. Permitido somente e-mails @firjan.com.br.');
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailStr, password: loginPassword })
      });

      const textResponse = await res.text();
      let data;
      try {
        data = JSON.parse(textResponse);
      } catch (err) {
        console.warn('Invalid JSON from backend, checking fallback registry:', textResponse);
        // Fallback check in local storage users
        const localReg = localStorage.getItem('firjan_local_users');
        if (localReg) {
          const parsedLocal = JSON.parse(localReg);
          if (Array.isArray(parsedLocal)) {
            const localUser = parsedLocal.find((u: UserProfile) => u.email.trim().toLowerCase() === emailStr && u.password === loginPassword);
            if (localUser) {
              localStorage.setItem('firjan_connected_user', JSON.stringify(localUser));
              setCurrentUser(localUser);
              setLoginEmail('');
              setLoginPassword('');
              fetchState(true);
              return;
            }
          }
        }
        setLoginError('Ocorreu um erro no servidor ou a resposta da rede foi inválida. Por favor, tente novamente em instantes.');
        return;
      }

      if (!res.ok || !data?.success) {
        // Fallback check in local storage users before hard rejecting
        const localReg = localStorage.getItem('firjan_local_users');
        if (localReg) {
          try {
            const parsedLocal = JSON.parse(localReg);
            if (Array.isArray(parsedLocal)) {
              const localUser = parsedLocal.find((u: UserProfile) => u.email.trim().toLowerCase() === emailStr && u.password === loginPassword);
              if (localUser) {
                localStorage.setItem('firjan_connected_user', JSON.stringify(localUser));
                setCurrentUser(localUser);
                setLoginEmail('');
                setLoginPassword('');
                fetchState(true);
                return;
              }
            }
          } catch (e) {
            console.error('Local fallback auth error:', e);
          }
        }
        setLoginError(data?.error || 'Autenticação reprovada. Verifique suas credenciais de rede.');
        return;
      }

      if (data.mfaRequired || isMfaActive) {
        setPendingMfaUser(data.userId ? { id: data.userId } as any : data.user);
        setShowMfaStep(true);
        setMfaError('');
      } else {
        localStorage.setItem('firjan_connected_user', JSON.stringify(data.user));
        setCurrentUser(data.user);
        setLoginEmail('');
        setLoginPassword('');
        fetchState(true);
      }
    } catch (err) {
      console.warn('Network or connection exception during login. Querying persistent browser backup registry:', err);
      // Fallback check in local storage users
      const localReg = localStorage.getItem('firjan_local_users');
      if (localReg) {
        try {
          const parsedLocal = JSON.parse(localReg);
          if (Array.isArray(parsedLocal)) {
            const localUser = parsedLocal.find((u: UserProfile) => u.email.trim().toLowerCase() === emailStr && u.password === loginPassword);
            if (localUser) {
              localStorage.setItem('firjan_connected_user', JSON.stringify(localUser));
              setCurrentUser(localUser);
              setLoginEmail('');
              setLoginPassword('');
              fetchState(true);
              return;
            }
          }
        } catch (localErr) {
          console.error('Failed fallback authentication query:', localErr);
        }
      }
      setLoginError('Falha temporária ao comunicar com o servidor de autenticação. Por favor, verifique sua conexão ou tente novamente.');
    }
  };

  // Profile image handler - verifies that file size is strictly less than 1MB/2MB
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // 2MB size definition check (2 * 1024 * 1024 bytes)
    const limitBytes = 2 * 1024 * 1024;
    if (file.size > limitBytes) {
      setRegError('A foto do perfil excede o tamanho limite de 2MB permitida.');
      e.target.value = ''; // Reset input selection
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setRegAvatar(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Manual Profile Creation poster
  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim() || !regMatricula.trim() || !regUnidade.trim()) {
      setRegError('Preencha todos os campos obrigatórios (Nome, E-mail, Senha de Rede, Matrícula e Unidade).');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('A senha de rede precisa ter pelo menos 6 caracteres.');
      return;
    }

    const cleanedEmail = regEmail.trim().toLowerCase();
    if (!cleanedEmail.endsWith('@firjan.com.br')) {
      setRegError('Seu e-mail cadastrado precisa necessariamente terminar com o domínio institucional @firjan.com.br.');
      return;
    }

    setIsSubmitRegistering(true);
    const mockedNewUser: UserProfile = {
      id: `user_${Date.now()}`,
      name: regName.trim(),
      email: cleanedEmail,
      password: regPassword || 'firjan123',
      role: regRole,
      department: regSetor || 'Geral',
      points: 0,
      badges: ['Inovador Iniciante'],
      avatar: regAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      matricula: regMatricula.trim(),
      setor: regSetor,
      unidade: regUnidade.trim(),
      estado: regEstado,
      cidade: regCidade.trim(),
      mfaEnabled: regMfaEnabled
    };

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          email: cleanedEmail,
          password: regPassword,
          matricula: regMatricula.trim(),
          setor: regSetor,
          unidade: regUnidade.trim(),
          estado: regEstado,
          cidade: regCidade.trim(),
          role: regRole,
          avatar: regAvatar,
          mfaEnabled: regMfaEnabled
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Save to persistent localStorage to survive Vercel scale-downs
        const localReg = localStorage.getItem('firjan_local_users');
        let parsedLocal = [];
        if (localReg) {
          try { parsedLocal = JSON.parse(localReg); } catch (e) {}
        }
        if (!Array.isArray(parsedLocal)) parsedLocal = [];
        parsedLocal.push(data.user);
        localStorage.setItem('firjan_local_users', JSON.stringify(parsedLocal));
        localStorage.setItem('firjan_connected_user', JSON.stringify(data.user));

        setRegSuccess('Cadastro realizado com sucesso! Conectando você ao novo ecossistema...');
        fetchState(true);
        setTimeout(() => {
          setCurrentUser(data.user);
          setIsRegistering(false);
          // clear forms
          setRegName('');
          setRegEmail('');
          setRegPassword('');
          setRegMatricula('');
          setRegUnidade('');
          setRegAvatar('');
          setRegMfaEnabled(false);
        }, 1500);
      } else {
        // Backend returned business error (like email already exists in state)
        setRegError(data.error || 'Falha ao registrar colaborador.');
      }
    } catch (err) {
      console.warn('Vercel backend offline or timed out, falling back to local storage persistence:', err);
      
      // Complete registration process safely in client fallback mode
      const localReg = localStorage.getItem('firjan_local_users');
      let parsedLocal = [];
      if (localReg) {
        try { parsedLocal = JSON.parse(localReg); } catch (e) {}
      }
      if (!Array.isArray(parsedLocal)) parsedLocal = [];
      parsedLocal.push(mockedNewUser);
      localStorage.setItem('firjan_local_users', JSON.stringify(parsedLocal));
      localStorage.setItem('firjan_connected_user', JSON.stringify(mockedNewUser));

      setRegSuccess('Cadastro realizado com sucesso! Conectando você ao novo ecossistema...');
      fetchState(true);
      setTimeout(() => {
        setCurrentUser(mockedNewUser);
        setIsRegistering(false);
        // clear forms
        setRegName('');
        setRegEmail('');
        setRegPassword('');
        setRegMatricula('');
        setRegUnidade('');
        setRegAvatar('');
        setRegMfaEnabled(false);
      }, 1500);
    } finally {
      setIsSubmitRegistering(false);
    }
  };

  // Handle profile avatar editing
  const handleEditAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 2MB size definition check
    const limitBytes = 2 * 1024 * 1024;
    if (file.size > limitBytes) {
      setEditError('A foto do perfil excede o tamanho limite de 2MB permitido.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setEditAvatar(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle updating user profile on backend
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setEditError('');
    setEditSuccess('');

    if (!editName.trim() || !editMatricula.trim() || !editUnidade.trim()) {
      setEditError('Preencha todos os campos obrigatórios (Nome, Matrícula e Unidade).');
      return;
    }

    setIsSubmitUpdatingProfile(true);
    try {
      const res = await fetch('/api/auth/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          name: editName.trim(),
          matricula: editMatricula.trim(),
          setor: editSetor,
          unidade: editUnidade.trim(),
          estado: editEstado,
          cidade: editCidade.trim(),
          avatar: editAvatar,
          mfaEnabled: editMfaEnabled
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Save to connected user session storage
        localStorage.setItem('firjan_connected_user', JSON.stringify(data.user));

        // Save to backup local users list
        const localReg = localStorage.getItem('firjan_local_users');
        let parsedLocal = [];
        if (localReg) {
          try { parsedLocal = JSON.parse(localReg); } catch (e) {}
        }
        if (!Array.isArray(parsedLocal)) parsedLocal = [];
        const idx = parsedLocal.findIndex(u => u.id === data.user.id);
        if (idx !== -1) {
          parsedLocal[idx] = data.user;
        } else {
          parsedLocal.push(data.user);
        }
        localStorage.setItem('firjan_local_users', JSON.stringify(parsedLocal));

        setCurrentUser(data.user);
        setEditSuccess('Perfil atualizado com sucesso!');
        
        // Sync with parent state lists (simulatedUsers list etc.)
        await fetchState(true);

        setTimeout(() => {
          setIsEditProfileOpen(false);
          setEditSuccess('');
        }, 1500);
      } else {
        setEditError(data.error || 'Falha ao atualizar perfil.');
      }
    } catch (err) {
      console.warn('Network error during profile update, saving locally:', err);
      // Fallback: save locally
      const updatedMock: UserProfile = {
        ...currentUser,
        name: editName.trim(),
        matricula: editMatricula.trim(),
        setor: editSetor,
        unidade: editUnidade.trim(),
        estado: editEstado,
        cidade: editCidade.trim(),
        avatar: editAvatar,
        mfaEnabled: editMfaEnabled
      };
      
      localStorage.setItem('firjan_connected_user', JSON.stringify(updatedMock));

      const localReg = localStorage.getItem('firjan_local_users');
      let parsedLocal = [];
      if (localReg) {
        try { parsedLocal = JSON.parse(localReg); } catch (e) {}
      }
      if (!Array.isArray(parsedLocal)) parsedLocal = [];
      const idx = parsedLocal.findIndex(u => u.id === currentUser.id);
      if (idx !== -1) {
        parsedLocal[idx] = updatedMock;
      } else {
        parsedLocal.push(updatedMock);
      }
      localStorage.setItem('firjan_local_users', JSON.stringify(parsedLocal));

      setCurrentUser(updatedMock);
      setEditSuccess('Perfil atualizado (salvo localmente devido ao modo de sobrevivência offline)!');
      
      await fetchState(true);

      setTimeout(() => {
        setIsEditProfileOpen(false);
        setEditSuccess('');
      }, 1500);
    } finally {
      setIsSubmitUpdatingProfile(false);
    }
  };

  // Quick simulation switch (Preset button logins)
  const handleSimulatedProfileSelect = async (userId: string) => {
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulatedUserId: userId })
      });
      const textResponse = await res.text();
      let data;
      try {
        data = JSON.parse(textResponse);
      } catch (err) {
        console.error('Resposta de simulação inválida:', textResponse);
        return;
      }
      if (data && data.success) {
        if (isMfaActive) {
          setPendingMfaUser(data.user);
          setShowMfaStep(true);
          setMfaError('');
        } else {
          setCurrentUser(data.user);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyMfaMatch = async () => {
    const enteredCode = `${mfaDigit1}${mfaDigit2}${mfaDigit3}${mfaDigit4}${mfaDigit5}${mfaDigit6}`;
    if (enteredCode === '195402' || enteredCode === '123456') {
      if (pendingMfaUser) {
        try {
          const mfaRes = await fetch('/api/auth/verify-mfa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: pendingMfaUser.id, code: enteredCode })
          });
          const mfaData = await mfaRes.json();
          if (mfaRes.ok && mfaData.success) {
            setCurrentUser(mfaData.user);
            setPendingMfaUser(null);
            setShowMfaStep(false);
            setMfaError('');
            // Reset code inputs
            setMfaDigit1('');
            setMfaDigit2('');
            setMfaDigit3('');
            setMfaDigit4('');
            setMfaDigit5('');
            setMfaDigit6('');
            setLoginEmail('');
            setLoginPassword('');
          } else {
            setMfaError(mfaData.error || 'Autenticação MFA recusada.');
          }
        } catch (err) {
          setMfaError('Erro de conexão ao servidor de MFA.');
        }
      }
    } else {
      setMfaError('Código MFA inválido. Por favor utilize o código de simulação: 195402 ou 123456.');
    }
  };

  const handleRecoverPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoverySuccess('');
    setResetError('');
    setResetSuccess('');
    if (!recoveryEmail.trim()) return;

    const emailStr = recoveryEmail.trim().toLowerCase();
    if (!emailStr.endsWith('@firjan.com.br')) {
      setResetError('E-mail institucional inválido. Permitidos apenas domínios @firjan.com.br.');
      return;
    }

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailStr })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRecoverySuccess(data.message);
        setSimulatedCode(data.simulatedCode || '123456');
        setIsForgotPasswordStep2(true);
      } else {
        setResetError(data.error || 'E-mail não localizado.');
      }
    } catch (err) {
      setResetError('Falha de rede ao solicitar recuperação.');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (!resetCode.trim() || !newPassword.trim()) {
      setResetError('Todos os campos são obrigatórios.');
      return;
    }

    if (newPassword.length < 6) {
      setResetError('A nova senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: recoveryEmail.trim().toLowerCase(),
          code: resetCode.trim(),
          newPassword: newPassword.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResetSuccess(data.message);
        setTimeout(() => {
          setIsForgotPassword(false);
          setIsForgotPasswordStep2(false);
          setRecoveryEmail('');
          setRecoverySuccess('');
          setResetCode('');
          setNewPassword('');
          setLoginEmail('');
          setLoginPassword('');
        }, 3000);
      } else {
        setResetError(data.error || 'Código verificador incorreto.');
      }
    } catch (err) {
      setResetError('Erro ao comunicar com o servidor.');
    }
  };

  const handleLogout = (reason = 'Usuário solicitou') => {
    if (currentUser) {
      const loggerUser = currentUser;
      // Send optional logout analytics info log to server before signoff
      try {
        fetch('/api/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'gargalo',
            title: 'Logout de Sessão',
            description: `${reason} encerrou a sessão conectada.`,
            area: loggerUser.unidade || loggerUser.department,
            userId: loggerUser.id,
            userName: loggerUser.name
          })
        }).then(() => fetchState(true));
      } catch (err) {
        console.error('Failed to report logout:', err);
      }
      
      localStorage.removeItem('firjan_connected_user');
      setCurrentUser(null);
      setActiveTab('dashboard');
    }
  };

  const updateServerLog = (action: string, details: string) => {
    if (!currentUser) return;
    fetch('/api/insights', { // server database automatically writes log using updateAuditLog
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'gargalo', // dummy endpoint triggered to log activities
        title: action,
        description: details,
        area: currentUser.unidade || currentUser.department,
        userId: currentUser.id,
        userName: currentUser.name
      })
    }).then(() => fetchState());
  };

  // 1. Idea Submission backend caller
  const handleSubmitIdea = async (ideaData: any) => {
    const res = await fetch('/api/ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ideaData)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao publicar.');
    }

    try {
      const createdIdea = await res.json();
      const savedIdeas = localStorage.getItem('firjan_local_ideas');
      const parsedIdeas = savedIdeas ? JSON.parse(savedIdeas) : [];
      parsedIdeas.push(createdIdea);
      localStorage.setItem('firjan_local_ideas', JSON.stringify(parsedIdeas));
    } catch (e) {
      console.warn('LocalStorage backup for idea bypassed:', e);
    }

    fetchState(); // reload list with new reviews
  };

  // 2. Like toggle caller
  const handleLikeIdea = async (ideaId: string) => {
    if (!currentUser) return;
    try {
      await fetch(`/api/ideas/${ideaId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name
        })
      });
    } catch (e) {
      console.warn('Network issue during like sync, updating local state only:', e);
    }

    // Direct local state and localStorage update for instant, Vercel-proof save
    try {
      const savedIdeas = localStorage.getItem('firjan_local_ideas');
      let parsedIdeas: Idea[] = savedIdeas ? JSON.parse(savedIdeas) : [];
      
      const currentIdea = ideas.find(i => i.id === ideaId);
      if (currentIdea) {
        const isAlreadyLiked = currentIdea.likedBy?.includes(currentUser.id) || false;
        const updatedLikedBy = isAlreadyLiked 
          ? (currentIdea.likedBy || []).filter(uid => uid !== currentUser.id)
          : [...(currentIdea.likedBy || []), currentUser.id];
        const updatedLikes = isAlreadyLiked ? Math.max(0, currentIdea.likes - 1) : currentIdea.likes + 1;
        
        const updatedIdea = {
          ...currentIdea,
          likes: updatedLikes,
          likedBy: updatedLikedBy
        };
        
        const idxInLocal = parsedIdeas.findIndex(i => i.id === ideaId);
        if (idxInLocal !== -1) {
          parsedIdeas[idxInLocal] = updatedIdea;
        } else {
          parsedIdeas.push(updatedIdea);
        }
        localStorage.setItem('firjan_local_ideas', JSON.stringify(parsedIdeas));
        setIdeas(prev => prev.map(i => i.id === ideaId ? updatedIdea : i));
      }
    } catch (err) {
      console.error('Failed to update local like tracking:', err);
    }
    
    fetchState();
  };

  // 3. Comments caller
  const handleCommentIdea = async (ideaId: string, commentText: string) => {
    if (!currentUser) return;
    try {
      await fetch(`/api/ideas/${ideaId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name,
          authorName: currentUser.name,
          text: commentText
        })
      });
    } catch (e) {
      console.warn('Network issue during comment sync, local update is primary:', e);
    }

    // Direct local comment insertion
    try {
      const newComment = {
        id: `comment_${Date.now()}`,
        authorId: currentUser.id,
        authorName: currentUser.name,
        text: commentText,
        createdAt: new Date().toISOString()
      };
      
      const savedIdeas = localStorage.getItem('firjan_local_ideas');
      let parsedIdeas: Idea[] = savedIdeas ? JSON.parse(savedIdeas) : [];
      
      const currentIdea = ideas.find(i => i.id === ideaId);
      if (currentIdea) {
        const updatedIdea = {
          ...currentIdea,
          comments: [...(currentIdea.comments || []), newComment]
        };
        
        const idxInLocal = parsedIdeas.findIndex(i => i.id === ideaId);
        if (idxInLocal !== -1) {
          parsedIdeas[idxInLocal] = updatedIdea;
        } else {
          parsedIdeas.push(updatedIdea);
        }
        localStorage.setItem('firjan_local_ideas', JSON.stringify(parsedIdeas));
        setIdeas(prev => prev.map(i => i.id === ideaId ? updatedIdea : i));
      }
    } catch (err) {
      console.error('Failed to update local comment tracking:', err);
    }

    fetchState();
  };

  // 3.5 Status Update & Leaders Approval Flow Caller
  const handleUpdateIdeaStatus = async (ideaId: string, status: string, pointsRewarded: number, stageComments?: string) => {
    if (!currentUser) return;
    try {
      await fetch(`/api/ideas/${ideaId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          userId: currentUser.id,
          userName: currentUser.name,
          pointsRewarded,
          stageComments
        })
      });
    } catch (e) {
      console.warn('Network issue during approval sync:', e);
    }

    // Direct local state and status update for persistence
    try {
      const savedIdeas = localStorage.getItem('firjan_local_ideas');
      let parsedIdeas: Idea[] = savedIdeas ? JSON.parse(savedIdeas) : [];
      
      const currentIdea = ideas.find(i => i.id === ideaId);
      if (currentIdea) {
        let updatedApprovalHistory = [...(currentIdea.approvalHistory || [])];
        let currentStage = currentIdea.currentStage || 1;
        
        if (status === 'Aprovada') {
          currentStage = Math.min(4, currentStage + 1);
          const stageIdx = updatedApprovalHistory.findIndex(h => h.stageId === currentStage - 1);
          if (stageIdx !== -1) {
            updatedApprovalHistory[stageIdx] = {
              ...updatedApprovalHistory[stageIdx],
              approver: currentUser.name,
              action: 'approved',
              date: new Date().toLocaleDateString('pt-BR'),
              comment: stageComments || 'Aprovada para implementação pelo comitê regional.'
            };
          }
        } else if (status === 'Rejeitada') {
          const stageIdx = updatedApprovalHistory.findIndex(h => h.stageId === currentStage);
          if (stageIdx !== -1) {
            updatedApprovalHistory[stageIdx] = {
              ...updatedApprovalHistory[stageIdx],
              approver: currentUser.name,
              action: 'rejected',
              date: new Date().toLocaleDateString('pt-BR'),
              comment: stageComments || 'Recusada.'
            };
          }
        }
        
        const nextStatus = currentStage === 4 ? 'Aprovada para Implementação' : status === 'Rejeitada' ? 'Recusada' : 'Em análise';
        
        const updatedIdea: Idea = {
          ...currentIdea,
          status: nextStatus,
          currentStage,
          approvalHistory: updatedApprovalHistory,
          pointsRewarded: (currentIdea.pointsRewarded || 0) + (pointsRewarded || 0)
        };
        
        const idxInLocal = parsedIdeas.findIndex(i => i.id === ideaId);
        if (idxInLocal !== -1) {
          parsedIdeas[idxInLocal] = updatedIdea;
        } else {
          parsedIdeas.push(updatedIdea);
        }
        localStorage.setItem('firjan_local_ideas', JSON.stringify(parsedIdeas));
        setIdeas(prev => prev.map(i => i.id === ideaId ? updatedIdea : i));

        // Credit points to caller's representation also if they are the author
        if (currentUser.id === currentIdea.authorId && pointsRewarded > 0) {
          const updatedUser = { ...currentUser, points: currentUser.points + pointsRewarded };
          setCurrentUser(updatedUser);
          localStorage.setItem('firjan_connected_user', JSON.stringify(updatedUser));
          
          // Save in local users list too
          const localRegList = localStorage.getItem('firjan_local_users');
          let parsedLocalUsers: UserProfile[] = localRegList ? JSON.parse(localRegList) : [];
          const uIdx = parsedLocalUsers.findIndex(u => u.id === currentUser.id);
          if (uIdx !== -1) {
            parsedLocalUsers[uIdx] = updatedUser;
          } else {
            parsedLocalUsers.push(updatedUser);
          }
          localStorage.setItem('firjan_local_users', JSON.stringify(parsedLocalUsers));
        }
      }
    } catch (err) {
      console.error('Failed to update local idea workflow state:', err);
    }
    
    // Attempt backend sync
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulatedUserId: currentUser.id })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        localStorage.setItem('firjan_connected_user', JSON.stringify(data.user));
      }
    } catch (e) {}
    
    try {
      fetch(`/api/auth/users?t=${Date.now()}`)
        .then(r => r.json())
        .then(data => setSimulatedUsers(data));
    } catch (e) {}

    fetchState();
  };

  // Points Redemption direct store caller
  const handleRedeemReward = async (itemId: string, itemPrice: number, itemName: string) => {
    if (!currentUser) return { success: false, error: 'Usuário desconectado.' };
    
    // Simulate/verify points locally first
    if (currentUser.points < itemPrice) {
      return { success: false, error: `Saldo insuficiente. Você possui ${currentUser.points} pts e este brinde custa ${itemPrice} pts.` };
    }

    let serverSuccess = false;
    let computedPoints = currentUser.points - itemPrice;
    let serverVoucher = `FIRJAN-${Math.floor(1000 + Math.random() * 9000)}-${currentUser.id.toUpperCase().split('_')[1] || 'VOUCHER'}`;

    try {
      const res = await fetch('/api/auth/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          itemId,
          itemPrice,
          itemName
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        computedPoints = data.updatedPoints;
        serverVoucher = data.voucher;
        serverSuccess = true;
      }
    } catch (err) {
      console.warn('Network issue during reward redemption, completing locally:', err);
    }

    // Direct local state and localStorage update for points redemption
    try {
      const updatedUser = { ...currentUser, points: computedPoints };
      setCurrentUser(updatedUser);
      localStorage.setItem('firjan_connected_user', JSON.stringify(updatedUser));

      // Sync into local users list
      const localRegList = localStorage.getItem('firjan_local_users');
      let parsedLocalUsers: UserProfile[] = localRegList ? JSON.parse(localRegList) : [];
      const uIdx = parsedLocalUsers.findIndex(u => u.id === currentUser.id);
      if (uIdx !== -1) {
        parsedLocalUsers[uIdx] = updatedUser;
      } else {
        parsedLocalUsers.push(updatedUser);
      }
      localStorage.setItem('firjan_local_users', JSON.stringify(parsedLocalUsers));
    } catch (e) {
      console.error('Failed to update local points representation:', e);
    }

    fetchState();
    return { success: true, voucher: serverVoucher };
  };

  // Wiki Directory Favorite caller
  const handleFavoriteWiki = async (articleId: string) => {
    if (!currentUser) return;
    try {
      await fetch(`/api/wiki/${articleId}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name
        })
      });
    } catch (e) {
      console.warn('Network issue during wiki favorites sync:', e);
    }

    // Direct local state and localStorage update for favorites list
    try {
      const localFavs = localStorage.getItem('firjan_local_wiki_favorites');
      let parsedFavs: string[] = localFavs ? JSON.parse(localFavs) : [];
      
      if (parsedFavs.includes(articleId)) {
        parsedFavs = parsedFavs.filter(id => id !== articleId);
      } else {
        parsedFavs.push(articleId);
      }
      localStorage.setItem('firjan_local_wiki_favorites', JSON.stringify(parsedFavs));

      setWikiArticles(prev => prev.map(a => a.id === articleId ? { ...a, isFavorite: parsedFavs.includes(articleId) } : a));
    } catch (err) {
      console.error('Failed to update local wiki favorites:', err);
    }

    fetchState();
  };

  // Submit custom article wiki
  const handleSubmitWikiArticle = async (artData: any) => {
    if (!currentUser) return;
    let createdArticle = {
      ...artData,
      id: `wiki_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      isFavorite: false,
      likes: 0
    };

    try {
      const res = await fetch('/api/wiki', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...artData,
          userId: currentUser.id,
          userName: currentUser.name
        })
      });
      if (res.ok) {
        const body = await res.json();
        if (body && body.id) {
          createdArticle = body;
        }
      }
    } catch (e) {
      console.warn('Network issue during custom wiki article submission:', e);
    }

    // Direct local article storage
    try {
      const localArticles = localStorage.getItem('firjan_local_wiki_articles');
      let parsedArticles = localArticles ? JSON.parse(localArticles) : [];
      if (!Array.isArray(parsedArticles)) parsedArticles = [];
      parsedArticles.push(createdArticle);
      localStorage.setItem('firjan_local_wiki_articles', JSON.stringify(parsedArticles));
    } catch (err) {
      console.error('Failed to update local wiki articles:', err);
    }

    fetchState();
  };

  // AI Chat Messages poster
  const handleSendChatMessage = async (msgText: string) => {
    const userMsg = { id: `chat_${Date.now()}`, role: 'user', content: msgText };
    setChatHistory(prev => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: msgText,
          history: chatHistory 
        })
      });
      const data = await res.json();
      const modelMsg = { 
        id: `chat_${Date.now() + 1}`, 
        role: 'model', 
        content: data.response || 'Erro ao processar instrução no modelo.' 
      };
      setChatHistory(prev => [...prev, modelMsg]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { 
        id: `chat_err`, 
        role: 'model', 
        content: 'Desculpe, ocorreu uma instabilidade na conexão do servidor.' 
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Handle manual additions to Efficiency Bottlenecks lists
  const handleAddOperationalBottleneck = async (insightData: any) => {
    if (!currentUser) return;
    let newInsight = {
      ...insightData,
      id: `insight_${Date.now()}`,
      status: 'Pendente',
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reporterDept: currentUser.department || 'Operacional',
      createdAt: new Date().toLocaleDateString('pt-BR'),
      resolvedAt: null,
      resolvedBy: null
    };

    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...insightData,
          userId: currentUser.id,
          userName: currentUser.name
        })
      });
      if (res.ok) {
        const body = await res.json();
        if (body && body.id) {
          newInsight = body;
        }
      }
    } catch (e) {
      console.warn('Network issue during insight sync:', e);
    }

    try {
      const localInsights = localStorage.getItem('firjan_local_insights');
      let parsedInsights = localInsights ? JSON.parse(localInsights) : [];
      if (!Array.isArray(parsedInsights)) parsedInsights = [];
      parsedInsights.unshift(newInsight);
      localStorage.setItem('firjan_local_insights', JSON.stringify(parsedInsights));
    } catch (err) {
      console.error('Failed to update local insights:', err);
    }

    fetchState();
  };

  const handleResolveOperationalInsight = async (insightId: string) => {
    if (!currentUser) return;
    try {
      await fetch(`/api/insights/${insightId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name
        })
      });
    } catch (e) {
      console.warn('Network issue during insight resolution:', e);
    }

    try {
      const localInsights = localStorage.getItem('firjan_local_insights');
      let parsedInsights: any[] = localInsights ? JSON.parse(localInsights) : [];
      
      const currentInsight = operationalInsights.find(i => i.id === insightId);
      if (currentInsight) {
        const updatedInsight = {
          ...currentInsight,
          status: 'Resolvido',
          resolvedAt: new Date().toLocaleDateString('pt-BR'),
          resolvedBy: currentUser.name
        };
        
        const idx = parsedInsights.findIndex(i => i.id === insightId);
        if (idx !== -1) {
          parsedInsights[idx] = updatedInsight;
        } else {
          parsedInsights.push(updatedInsight);
        }
        localStorage.setItem('firjan_local_insights', JSON.stringify(parsedInsights));
        setOperationalInsights(prev => prev.map(i => i.id === insightId ? updatedInsight : i));
      }
    } catch (err) {
      console.error('Failed to update local resolved insight:', err);
    }

    fetchState();
  };

  const handleUserRoleChange = async (userId: string, targetRole: UserRole) => {
    if (!currentUser) return;
    await fetch(`/api/auth/users/${userId}/role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: targetRole,
        userId: currentUser.id,
        userName: currentUser.name
      })
    });
    // refresh with cache-breaker
    fetch(`/api/auth/users?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => setSimulatedUsers(data));
    fetchState();
  };

  // Voice recognition navigation handler
  const handleVoiceCommandNavigation = (targetTab: string) => {
    if (['dashboard', 'cadastro', 'chat', 'wiki', 'eficiencia', 'admin'].includes(targetTab)) {
      setActiveTab(targetTab);
    }
  };

  // Render the Login screen if not connected
  if (!currentUser) {
    return (
      <div className={`min-h-screen bg-zinc-90 w-full flex flex-col justify-between p-4 selection:bg-purple-900/25 relative overflow-x-hidden text-zinc-800 textSize-${accessibility.fontSize}`}>
        
        {/* Nav header of Login */}
        <header className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-center py-6 px-4 relative z-10 border-b border-zinc-200 mb-4 bg-white/50 backdrop-blur rounded-xl">
          <div className="flex justify-center md:justify-start items-center w-full">
            <img 
               src="/impacta_logo.png" 
               alt="Ide.IA Logo" 
               className="h-auto w-full max-w-[720px] object-contain transition-transform duration-300 hover:scale-[1.03] mix-blend-multiply"
               referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="text-center md:text-right px-2">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight font-display text-[#003399] leading-tight">
              Plataforma Institucional de Inteligência Operacional Contínua baseada em IA
            </h1>
          </div>
        </header>

        {/* Central Card */}
        <main className="flex-1 flex items-center justify-center relative z-10 py-8">
          <div className="w-full max-w-md glass-panel p-6 sm:p-8 rounded-2xl border-zinc-200 shadow-xl space-y-5 bg-white">
            
            {/* Header info switcher */}
            <div className="text-center space-y-3">
              <div className="py-2 flex items-center justify-center">
                <img 
                  src="/impacta_logo.png" 
                  alt="Ide.IA Card Logo" 
                  className="h-24 w-auto object-contain mx-auto mix-blend-multiply"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h2 className="text-sm font-extrabold font-display tracking-widest uppercase text-white pt-1">
                {isRegistering ? 'Cadastro de Colaborador' : 'Acesso ao FIRJAN IMPACTA AI'}
              </h2>
              {isRegistering ? (
                <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                  Crie seu perfil profissional integrado para registrar ideias e colaborar com a melhoria contínua.
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                    Conecte-se com seu e-mail corporativo ou registre um novo colaborador da rede.
                  </p>
                  <div className="p-3.5 bg-purple-950/10 border border-purple-500/10 rounded-xl text-center select-none">
                    <p className="text-[11px] text-zinc-300 italic leading-relaxed font-sans">
                      &ldquo;Transformando conhecimento distribuído em eficiência operacional mensurável através de inteligência artificial, colaboração institucional e melhoria contínua.&rdquo;
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Error notifications */}
            {loginError && !isRegistering && (
              <div id="login_error_box" className="p-3 bg-red-950/20 text-red-400 border border-red-500/25 rounded-xl text-xs flex flex-col gap-2 text-left animate-in fade-in">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  <span>{loginError}</span>
                </div>
                {loginError.includes('servidor') && (
                  <button
                    type="button"
                    onClick={async () => {
                      setLoginError('');
                      await loadInitialData();
                    }}
                    className="self-end text-[10px] bg-red-900/45 hover:bg-purple-900/50 text-purple-305 font-bold px-2.5 py-1 rounded border border-purple-500/30 transition-all select-none cursor-pointer"
                  >
                    {isServerConnecting ? 'Restaurando...' : '🔄 Testar Conexão Novamente'}
                  </button>
                )}
              </div>
            )}

            {/* --- CASE A: FORMULARIO DE CADASTRO NOVO USUARIO (Atendendo solicitação do usuário) --- */}
            {isRegistering ? (
              <form onSubmit={handleRegisterUser} id="form_registration_colaborador" className="space-y-3 pt-1 text-left">
                {regError && (
                  <div className="p-3 bg-red-950/25 text-red-400 border border-red-500/25 rounded-xl text-xs flex flex-col gap-2 animate-in fade-in">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                      <span>{regError}</span>
                    </div>
                    {regError.includes('servidor') && (
                      <button
                        type="button"
                        onClick={async () => {
                          setRegError('');
                          await loadInitialData();
                        }}
                        className="self-end text-[10px] bg-red-900/45 hover:bg-purple-900/50 text-purple-305 font-bold px-2.5 py-1 rounded border border-purple-500/30 transition-all select-none cursor-pointer"
                      >
                        {isServerConnecting ? 'Restaurando...' : '🔄 Testar Conexão Novamente'}
                      </button>
                    )}
                  </div>
                )}
                {regSuccess && (
                  <div className="p-3 bg-green-550/10 text-green-300 border border-green-500/20 rounded-xl text-xs">
                    {regSuccess}
                  </div>
                )}

                {/* Nome & Matrícula */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Nome Completo *</label>
                    <input
                      id="input_reg_name"
                      type="text"
                      placeholder="Ex: Alan Turing"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Matrícula (Fórmula) *</label>
                    <input
                      id="input_reg_matricula"
                      type="text"
                      placeholder="Apenas números (Ex: 827162)"
                      value={regMatricula}
                      onChange={(e) => setRegMatricula(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                </div>

                {/* E-mail Corporativo */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">E-mail Corporativo *</label>
                  <input
                    id="input_reg_email"
                    type="email"
                    placeholder="Ex: seu.nome@firjan.com.br"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-purple-500"
                    required
                  />
                  <span className="text-[8px] text-zinc-650 block">Somente domínio permitido institucional da Firjan.</span>
                </div>

                {/* Senha de Rede Corporativa */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block font-sans">Cadastrar Senha de Rede *</label>
                  <input
                    id="input_reg_password"
                    type="password"
                    placeholder="Defina sua senha de rede (mín. 6 caracteres)"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-purple-500"
                    required
                  />
                  <span className="text-[8px] text-zinc-650 block">Sua chave de acesso seguro integrada.</span>
                </div>

                {/* Segmento & Cargo (Líder / Gerente / etc.) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Segmento/Setor *</label>
                    <select
                      id="input_reg_setor"
                      value={regSetor}
                      onChange={(e) => setRegSetor(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-purple-500"
                    >
                      <option value="SENAI">SENAI (Educação/Lab)</option>
                      <option value="SESI">SESI (Saúde/Cultura)</option>
                      <option value="IEL">IEL (Liderança/Gestão)</option>
                      <option value="Firjan Central">Firjan Corporativo / Sede</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Cargo / Nível *</label>
                    <select
                      id="input_reg_role"
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as any)}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-purple-500"
                    >
                      {CARGOS_FUNCIONAIS.map((cargo) => (
                        <option key={cargo} value={cargo}>
                          {cargo}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Unidade Residência */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Unidade Corporativa *</label>
                  <input
                    id="input_reg_unidade"
                    type="text"
                    list="unidades_list"
                    placeholder="Ex: SENAI Maracanã ou SESI Sede Botafogo"
                    value={regUnidade}
                    onChange={(e) => setRegUnidade(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-purple-500"
                    required
                  />
                  <datalist id="unidades_list">
                    {regSetor === 'SESI' ? (
                      UNIDADES_SESI.map((unit) => <option key={unit} value={unit} />)
                    ) : (
                      UNIDADES_SENAI.map((unit) => <option key={unit} value={unit} />)
                    )}
                  </datalist>
                </div>

                {/* Estado & Cidade */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Estado *</label>
                    <select
                      id="input_reg_estado"
                      value={regEstado}
                      onChange={(e) => {
                        const selectedUf = e.target.value;
                        setRegEstado(selectedUf);
                        const stateObj = ESTADOS.find((est) => est.uf === selectedUf);
                        if (stateObj && stateObj.cities.length > 0) {
                          setRegCidade(stateObj.cities[0]);
                        }
                      }}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-purple-500"
                    >
                      {ESTADOS.map((est) => (
                        <option key={est.uf} value={est.uf}>
                          {est.name} ({est.uf})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block text-zinc-400">Cidade *</label>
                    <select
                      id="input_reg_cidade"
                      value={regCidade}
                      onChange={(e) => setRegCidade(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-2 py-1.5 text-xs text-zinc-350 focus:outline-none focus:border-purple-500 cursor-pointer"
                      required
                    >
                      <option value="">Selecione um município...</option>
                      {(ESTADOS.find((est) => est.uf === regEstado)?.cities || []).map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Foto do colaborador limitado a 2MB */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Foto de Perfil (Max 2MB) *</label>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                      {regAvatar ? (
                        <img src={regAvatar} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-zinc-700" />
                      )}
                    </div>
                    <input
                      id="input_reg_avatar_file"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="text-xs text-zinc-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-zinc-900 file:text-purple-300 file:cursor-pointer hover:file:bg-zinc-850"
                    />
                  </div>
                  <span className="text-[8px] text-zinc-600 block">Dica: Selecione fotos menores que 2MB.</span>
                </div>

                {/* Segurança MFA */}
                <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-900 flex items-center justify-between text-xs select-none">
                  <div className="flex flex-col">
                    <span className="font-semibold text-zinc-300 text-[11px]">Ativar MFA de Duas Etapas</span>
                    <span className="text-[8.5px] text-zinc-500">Reforçar a identidade corporativa via token</span>
                  </div>
                  <input
                    id="checkbox_reg_mfa"
                    type="checkbox"
                    checked={regMfaEnabled}
                    onChange={(e) => setRegMfaEnabled(e.target.checked)}
                    className="rounded border-zinc-900 text-purple-600 bg-zinc-950 focus:ring-0 focus:ring-offset-0 focus:outline-none cursor-pointer w-4 h-4"
                  />
                </div>

                {/* Submissao */}
                <div className="pt-2 flex gap-2">
                  <button
                    id="btn_cancel_registration"
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className="flex-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 py-2 rounded-lg text-xs transition-all border border-zinc-850 select-none font-semibold"
                  >
                    Voltar
                  </button>
                  <button
                    id="btn_submit_colaborador_registration"
                    type="submit"
                    disabled={isSubmitRegistering}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-2 rounded-lg text-xs font-bold transition-all shadow-md select-none"
                  >
                    {isSubmitRegistering ? 'Cadastrando...' : 'Cadastrar Perfil'}
                  </button>
                </div>
              </form>
            ) : showMfaStep ? (
              /* --- REQUISITO: MULTI-FACTOR AUTHENTICATION (MFA OPCONAL) PASS --- */
              <div className="space-y-4 text-left animate-in fade-in zoom-in-95 duration-200">
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-400" /> Verificação em Duas Etapas (MFA)
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Insira o token temporário de 6 dígitos obtido em seu aplicativo autenticador corporativo Firjan.
                  </p>
                </div>

                {mfaError && (
                  <div className="p-3 bg-red-950/30 text-red-400 border border-red-500/20 rounded-xl text-xs flex items-center gap-2 animate-in slide-in-from-top-1">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{mfaError}</span>
                  </div>
                )}

                <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-xl text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-ping" />
                    <span className="text-[9px] text-purple-300 font-mono font-bold uppercase tracking-wider">Simulador de MFA Ativo</span>
                  </div>
                  <p className="text-zinc-300 text-[10px] leading-relaxed">
                    Código de teste gerado pela rede autorizada da Firjan: <strong className="text-green-400 font-mono text-xs bg-zinc-950 px-1.5 py-0.5 rounded select-all border border-zinc-900">195402</strong> ou <strong className="text-green-400 font-mono text-xs bg-zinc-950 px-1.5 py-0.5 rounded select-all border border-zinc-900">123456</strong>
                  </p>
                </div>

                {/* Secure Digit Inputs */}
                <div className="flex gap-2 justify-between">
                  {[
                    { val: mfaDigit1, set: setMfaDigit1 },
                    { val: mfaDigit2, set: setMfaDigit2 },
                    { val: mfaDigit3, set: setMfaDigit3 },
                    { val: mfaDigit4, set: setMfaDigit4 },
                    { val: mfaDigit5, set: setMfaDigit5 },
                    { val: mfaDigit6, set: setMfaDigit6 }
                  ].map((digit, idx) => (
                    <input
                      key={idx}
                      type="text"
                      maxLength={1}
                      value={digit.val}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        digit.set(val);
                        // Shift focus
                        if (val && e.target.nextElementSibling) {
                          (e.target.nextElementSibling as HTMLInputElement).focus();
                        }
                      }}
                      className="w-10 h-11 bg-zinc-950 border border-zinc-900 rounded-lg text-center text-sm font-bold font-mono text-green-400 focus:outline-none focus:border-purple-500 transition-all shadow-md focus:shadow-purple-500/10"
                    />
                  ))}
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMfaStep(false);
                      setPendingMfaUser(null);
                      setMfaError('');
                    }}
                    className="flex-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 py-2 rounded-lg text-xs transition-all border border-zinc-850 select-none cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyMfaMatch}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-2 rounded-lg text-xs font-bold transition-all shadow-md select-none cursor-pointer"
                  >
                    Confirmar Token
                  </button>
                </div>
              </div>
            ) : isForgotPassword ? (
              /* --- REQUISITO: RECUPERAÇÃO DE SENHA --- */
              <div className="space-y-4 text-left animate-in fade-in duration-200">
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">Recuperar Senha de Rede</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Insira seu e-mail corporativo cadastrado da Firjan para receber instruções automáticas de verificação vinculadas ao Active Directory (AD).
                  </p>
                </div>

                {resetError && (
                  <div className="p-3 bg-red-950/30 text-red-400 border border-red-500/20 rounded-xl text-xs">
                    {resetError}
                  </div>
                )}

                {resetSuccess && (
                  <div className="p-3 bg-green-950/30 text-green-300 border border-green-500/20 rounded-xl text-xs">
                    {resetSuccess}
                  </div>
                )}

                {isForgotPasswordStep2 ? (
                  <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
                    <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-xl text-xs space-y-1">
                      <p className="text-[9px] text-purple-300 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping" />
                        Simulador de Microsoft Email/Teams
                      </p>
                      <p className="text-zinc-400 text-[10px]">
                        Código de redefinição de segurança autônomo gerado: <strong className="text-green-400 font-mono text-xs bg-zinc-950 px-1.5 py-0.5 rounded select-all border border-zinc-900">{simulatedCode}</strong>
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Código Recebido</label>
                      <input
                        type="text"
                        placeholder="Insira o código de 6 dígitos"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-3 py-2 text-xs text-zinc-350 focus:outline-none focus:border-purple-500 font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Nova Senha de Rede</label>
                      <input
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-3 py-2 text-xs text-zinc-150 focus:outline-none focus:border-purple-500"
                        required
                      />
                    </div>

                    <div className="pt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPasswordStep2(false);
                          setRecoverySuccess('');
                          setResetError('');
                        }}
                        className="flex-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 py-2 rounded-lg text-xs transition-all border border-zinc-850 cursor-pointer"
                      >
                        Voltar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer animate-pulse"
                      >
                        Definir Senha
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleRecoverPassword} className="space-y-3">
                    {recoverySuccess && (
                      <div className="p-3 bg-green-550/10 text-green-300 border border-green-500/20 rounded-xl text-xs leading-relaxed">
                        {recoverySuccess}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">E-mail Corporativo</label>
                      <input
                        type="email"
                        placeholder="seu.nome@firjan.com.br"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-purple-500 transition-all font-sans"
                        required
                      />
                    </div>

                    <div className="pt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(false);
                          setRecoverySuccess('');
                          setResetError('');
                        }}
                        className="flex-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 py-2 rounded-lg text-xs transition-all border border-zinc-850 select-none cursor-pointer"
                      >
                        Voltar ao Login
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-lg text-xs font-bold transition-all shadow-md select-none cursor-pointer"
                      >
                        Enviar Código
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              /* --- CASE B: LOGIN NORMAL COM O-AUTH SIMULADO --- */
              <>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">E-mail Corporativo</label>
                    <input
                      id="input_login_email"
                      type="email"
                      placeholder="seu.nome@firjan.com.br"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-900 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-purple-500 transition-all font-sans"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Senha de Rede</label>
                      <span className="text-[8px] text-zinc-600 font-sans">Active Directory Integrado</span>
                    </div>
                    <input
                      id="input_login_password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-750 focus:outline-none focus:border-purple-500 transition-all font-sans"
                      required
                    />
                  </div>

                  {/* REQUISITO: Opcional MFA e Esqueci Minha Senha */}
                  <div className="flex items-center justify-between text-[11px] select-none">
                    <label className="flex items-center gap-1.5 text-zinc-400 hover:text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isMfaActive}
                        onChange={(e) => setIsMfaActive(e.target.checked)}
                        className="rounded border-zinc-900 text-purple-600 bg-zinc-950 focus:ring-0 focus:ring-offset-0 focus:outline-none"
                      />
                      <span>Ativar MFA de Duas Etapas</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-purple-400 hover:text-purple-300 font-medium cursor-pointer"
                    >
                      Esqueci minha senha
                    </button>
                  </div>

                  <button
                    id="btn_login_manual_submit"
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2.5 rounded-xl text-xs transition-all shadow-lg select-none cursor-pointer"
                  >
                    Conectar via Login Integrado
                  </button>

                  {/* Button to trigger registration screen toggle */}
                  <button
                    id="btn_switch_to_registration"
                    type="button"
                    onClick={() => setIsRegistering(true)}
                    className="w-full py-2 bg-zinc-950/60 hover:bg-zinc-900 text-[11px] text-purple-400 rounded-xl border border-zinc-900 hover:border-purple-500/25 transition-all text-center flex items-center justify-center gap-1.5 font-medium cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Registre-se como Novo Colaborador
                  </button>
                </form>
              </>
            )}
          </div>
        </main>

        <footer className="py-4 text-center text-[10px] text-zinc-600 font-mono relative z-10 border-t border-zinc-950">
          FIRJAN CONNECT AI • INTEGRIDADE INSTITUCIONAL • SENAI VOLTA REDONDA-RJ- 2026
        </footer>
      </div>
    );
  }

  // Else render primary dashboard workspace
  return (
    <div className={`min-h-screen bg-black text-zinc-100 flex flex-col md:flex-row relative z-10 selection:bg-purple-500/30 selection:text-white textSize-${accessibility.fontSize} ${accessibility.dyslexicFont ? 'dyslexic-font-active' : ''}`}>

      {/* Backdrop for mobile drawer sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-30 md:hidden animate-in fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`w-64 border-r border-zinc-250 bg-zinc-950 flex flex-col justify-between py-5 px-4 shrink-0 h-screen overflow-y-auto z-40 fixed md:static inset-y-0 left-0 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="space-y-6">
          
          {/* Brand header */}
          <div className="flex flex-col gap-2 pb-3 border-b border-zinc-200 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img 
                  src="/impacta_logo.png" 
                  alt="Ide.IA Logo" 
                  className="h-24 w-auto object-contain mix-blend-multiply"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              {/* Collapse button on mobile sidebar open */}
              <button
                id="sidebar_mobile_close"
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden text-zinc-500 hover:text-zinc-800 p-1 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[9px] text-zinc-400 font-sans tracking-tight leading-relaxed max-w-[220px]">
              Canal institucional de fomento, análise por IA, gamificação e homologação contínua de melhorias.
            </p>
          </div>

          {/* Connected User Profile Widget - Mapeado para matricula, setor e unidade ao logar */}
          <div className="p-3.5 bg-zinc-900/70 border border-zinc-800 rounded-xl relative overflow-visible text-left space-y-2.5 shadow-xl">
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-2 overflow-hidden">
                <img 
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
                  alt={currentUser.name} 
                  className="w-8 h-8 rounded-full border border-purple-500/40 object-cover shrink-0" 
                />
                <div className="overflow-visible">
                  <span className="text-xs font-extrabold text-white block truncate leading-tight select-all">
                    {currentUser.name}
                  </span>
                  <span className="text-[9px] text-purple-300 font-mono block uppercase font-bold tracking-wider">
                    Rank: {currentUser.role}
                  </span>
                </div>
              </div>

              <button
                id="btn_open_edit_profile"
                type="button"
                onClick={() => {
                  setEditName(currentUser.name);
                  setEditMatricula(currentUser.matricula || '');
                  setEditSetor(currentUser.setor || currentUser.department || 'SENAI');
                  setEditUnidade(currentUser.unidade || 'Sede Firjan Botafogo');
                  setEditEstado(currentUser.estado || 'RJ');
                  setEditCidade(currentUser.cidade || 'Rio de Janeiro');
                  setEditAvatar(currentUser.avatar || '');
                  setEditMfaEnabled(!!currentUser.mfaEnabled);
                  setEditError('');
                  setEditSuccess('');
                  setIsEditProfileOpen(true);
                }}
                className="p-1 px-2 text-[9px] bg-zinc-800 hover:bg-zinc-700 text-white rounded-md border border-zinc-700/60 transition-all font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                title="Editar informações do Perfil"
              >
                <Edit3 className="w-2.5 h-2.5 text-purple-400" /> Editar
              </button>
            </div>

            {/* Corporate Registration Info tags (Atendendo quesito: Nome, Matrícula e Unidade ao Logar) */}
            <div className="space-y-2.5 pt-2.5 border-t border-zinc-800/80 text-[10.5px] text-zinc-200 font-sans">
              <div className="flex justify-between items-center gap-2">
                <span className="text-zinc-400 font-bold font-mono uppercase text-[8px] tracking-wider shrink-0">Matrícula</span>
                <strong className="text-white font-mono select-all font-black bg-zinc-950 px-1.5 py-0.5 rounded leading-none">{currentUser.matricula || '000000'}</strong>
              </div>
              <div className="flex justify-between items-start gap-2">
                <span className="text-zinc-400 font-bold font-mono uppercase text-[8px] tracking-wider shrink-0">Setor</span>
                <strong className="text-white font-black text-right uppercase leading-tight max-w-[150px] break-words">{currentUser.department || currentUser.setor || 'Geral'}</strong>
              </div>
              <div className="flex flex-col gap-0.5 pt-1 border-t border-zinc-900/40">
                <span className="text-zinc-400 font-bold font-mono uppercase text-[8px] tracking-wider text-left">Unidade Firjan de Atuação</span>
                <strong className="text-green-300 font-black uppercase text-[10px] text-left leading-normal break-words" title={currentUser.unidade}>
                  {currentUser.unidade || 'Botafogo Sede'}
                </strong>
              </div>
            </div>

            {/* Score details */}
            <div className="flex justify-between items-center text-[9px] bg-black/80 p-2 rounded-lg border border-zinc-800/60 font-mono">
              <div className="text-left">
                <span className="text-zinc-400 block text-[7.5px] uppercase font-bold leading-none tracking-wider">Saldo de Pontos:</span>
                <strong className="text-yellow-400 font-black text-xs">{currentUser.points} pts</strong>
              </div>
              
              <div className="text-right">
                <span className="text-zinc-400 block text-[7.5px] uppercase font-bold leading-none tracking-wider">Medalhas:</span>
                <strong className="text-purple-300 font-black text-xs">{currentUser.badges?.length || 0} un</strong>
              </div>
            </div>

            {/* Dynamic Medals & Achievements component with tooltips */}
            <UserMedals points={currentUser.points} badges={currentUser.badges || []} />
          </div>

          {/* Navigation Tab lists */}
          <nav className="space-y-1 align-left text-left">
            <span className="text-[9px] text-zinc-300 font-mono font-bold uppercase block px-2 mb-1.5 tracking-wider">Módulos de Inovação</span>
            {[
              { id: 'dashboard', name: 'Dashboard & Economia', icon: TrendingUp },
              { id: 'cadastro', name: 'Ideias & Aprovação', icon: Lightbulb },
              { id: 'loja', name: 'Gamificação & Loja', icon: Gift },
              { id: 'chat', name: 'Assistente Virtual AI', icon: Sparkles },
              { id: 'wiki', name: 'Central de Conhecimento', icon: BookOpen, description: 'Políticas, manuais SENAI/SESI e fluxogramas estratégicos consolidados.' },
              { id: 'eficiencia', name: 'Desperdícios e Gargalos', icon: AlertTriangle }
            ].map((tab) => {
              const IconComp = tab.icon;
              return (
                <div key={tab.id} className="space-y-0.5">
                  <button
                    id={`btn_nav_${tab.id}`}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsSidebarOpen(false); // Auto close sidebar drawer on mobile tap
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-left text-xs font-semibold transition-all select-none ${
                      activeTab === tab.id 
                        ? 'bg-purple-600 text-white font-extrabold shadow-md shadow-purple-600/15 scale-[1.01]'
                        : 'text-zinc-200 hover:text-white hover:bg-zinc-900/60'
                    }`}
                  >
                    <IconComp className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-white' : 'text-purple-400'}`} /> {tab.name}
                  </button>
                  {tab.description && (
                    <span className="text-[9px] text-zinc-500 block px-4 leading-normal mt-0.5 max-w-[220px]">
                      {tab.description}
                    </span>
                  )}
                </div>
              );
            })}

            {/* Protected Tab: Admin */}
            {(currentUser.role === 'Administrador' || currentUser.role === 'Super Admin') && (
              <div className="space-y-1 pt-3 border-t border-zinc-900/80 mt-2">
                <span className="text-[9px] text-zinc-300 font-mono font-bold uppercase block px-2 mb-1.5 tracking-wider font-extrabold">Painel de Controle</span>
                <button
                  id="btn_nav_admin"
                  onClick={() => {
                    setActiveTab('admin');
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-left text-xs font-semibold transition-all select-none ${
                    activeTab === 'admin' 
                      ? 'bg-green-500 text-black font-extrabold'
                      : 'text-zinc-200 hover:text-white hover:bg-zinc-900/60'
                  }`}
                >
                  <ShieldCheck className={`w-3.5 h-3.5 ${activeTab === 'admin' ? 'text-black' : 'text-green-400'}`} /> Administração
                </button>
              </div>
            )}
          </nav>
        </div>

        {/* Signoff but NO timeout visuals as requested */}
        <div className="pt-4 border-t border-zinc-900/80 text-left space-y-2 select-none">
          <button
            id="btn_logout"
            onClick={() => handleLogout()}
            className="w-full bg-zinc-900 hover:bg-zinc-850 text-[11px] font-semibold py-1.5 rounded-xl text-zinc-300 hover:text-white border border-zinc-850 transition-all flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5 text-zinc-400" /> Desconectar Sessão
          </button>
        </div>

      </aside>

      {/* Main Workspace Frame panel */}
      <main className="flex-1 bg-black flex flex-col min-w-0" role="main">
        {/* Top Navbar */}
        <header className="h-14 border-b border-zinc-900 bg-zinc-950 px-4 flex items-center justify-between text-left">
          <div className="flex items-center gap-2.5">
            {/* Sidebar toggle mobile */}
            <button
              id="sidebar_mobile_toggle"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden text-zinc-400 hover:text-white p-1 hover:bg-zinc-90 w-8 h-8 rounded-lg flex items-center justify-center border border-zinc-900 shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-white uppercase font-display select-none">
              FILIAL RJ • {currentUser.unidade || 'Botafogo Sede'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono select-none">
            <span className="text-[9px] text-zinc-500 hidden sm:inline-block font-semibold">RJ • {new Date().toLocaleDateString('pt-BR')}</span>
            <span className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded text-[9px] border border-green-500/10 font-bold">EM COMPLIANCE LGPD</span>
          </div>
        </header>

        {/* Central tab layout workspace router */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto max-h-[calc(100vh-56px)]">
          {(activeTab === 'dashboard' || activeTab === 'loja') && (
            <DashboardView 
              ideas={ideas} 
              insights={operationalInsights} 
              users={simulatedUsers} 
              onNavigate={setActiveTab} 
              currentUser={currentUser}
              onRedeemReward={handleRedeemReward}
              onSimulateUser={handleSimulatedProfileSelect}
              initialTab={activeTab === 'loja' ? 'rewards' : 'kpis'}
            />
          )}

          {activeTab === 'cadastro' && (
            <IdeaPortalView 
              ideas={ideas}
              currentUser={currentUser}
              users={simulatedUsers}
              onSubmitIdea={handleSubmitIdea}
              onLikeIdea={handleLikeIdea}
              onCommentIdea={handleCommentIdea}
              onUpdateIdeaStatus={handleUpdateIdeaStatus}
              onRedeemReward={handleRedeemReward}
            />
          )}

          {activeTab === 'chat' && (
            <ChatView 
              chatHistory={chatHistory}
              onSendMessage={handleSendChatMessage}
              onClearHistory={() => setChatHistory([])}
              isLoading={isChatLoading}
            />
          )}

          {activeTab === 'wiki' && (
            <WikiView 
              articles={wikiArticles}
              onSubmitArticle={handleSubmitWikiArticle}
              onFavoriteArticle={handleFavoriteWiki}
            />
          )}

          {activeTab === 'eficiencia' && (
            <EfficiencyView 
              insights={operationalInsights}
              onAddInsight={handleAddOperationalBottleneck}
              onResolveInsight={handleResolveOperationalInsight}
            />
          )}

          {activeTab === 'admin' && canAccessTab('admin') && (
            <AdminView 
              users={simulatedUsers}
              logs={auditLogs}
              onRoleChange={handleUserRoleChange}
              onRefreshLogs={fetchState}
            />
          )}
        </div>
      </main>

      {/* EDIT PROFILE MODAL */}
      {isEditProfileOpen && currentUser && (
        <div id="modal_edit_profile" className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-850 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col text-left font-sans animate-fade-in">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/40">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">Editar Perfil</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="text-zinc-500 hover:text-white transition-all cursor-pointer p-1"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleUpdateProfile} className="p-4 space-y-4 overflow-y-auto max-h-[80vh]">
              {editError && (
                <div className="p-3 bg-red-950/40 border border-red-900 text-red-200 rounded-lg text-xs font-medium">
                  {editError}
                </div>
              )}
              {editSuccess && (
                <div className="p-3 bg-green-950/40 border border-green-900 text-green-200 rounded-lg text-xs font-medium">
                  {editSuccess}
                </div>
              )}

              {/* Avatar Upload */}
              <div className="flex items-center gap-4 bg-zinc-900/20 p-3 rounded-xl border border-zinc-900">
                <div className="w-12 h-12 rounded-full border border-purple-500/40 relative overflow-hidden shrink-0 bg-zinc-900">
                  {editAvatar ? (
                    <img src={editAvatar} alt="Profile Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-650 font-bold text-xs uppercase bg-purple-950/30">
                      EP
                    </div>
                  )}
                </div>
                <div className="space-y-1 flex-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Foto de Perfil (Max 2MB)</label>
                  <input
                    id="input_edit_avatar_file"
                    type="file"
                    accept="image/*"
                    onChange={handleEditAvatarChange}
                    className="text-[10px] text-zinc-500 file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-purple-900/20 file:text-purple-300 hover:file:bg-purple-900/30 file:cursor-pointer cursor-pointer w-full text-ellipsis overflow-hidden"
                  />
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block font-extrabold text-zinc-400">Nome Completo *</label>
                <input
                  id="input_edit_name"
                  type="text"
                  placeholder="Seu nome"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-750 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              {/* Matrícula & Segmento */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block font-extrabold text-zinc-400">Matrícula *</label>
                  <input
                    id="input_edit_matricula"
                    type="text"
                    maxLength={10}
                    placeholder="Ex: 1234567"
                    value={editMatricula}
                    onChange={(e) => setEditMatricula(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-750 focus:outline-none focus:border-purple-500 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block font-extrabold text-zinc-400">Segmento/Setor *</label>
                  <select
                    id="input_edit_setor"
                    value={editSetor}
                    onChange={(e) => {
                      const selectedSetor = e.target.value;
                      setEditSetor(selectedSetor);
                      if (selectedSetor === 'SESI') {
                        setEditUnidade('SESI Duque de Caxias');
                      } else if (selectedSetor === 'SENAI') {
                        setEditUnidade('SENAI Maracanã');
                      } else {
                        setEditUnidade('Sede Firjan Botafogo');
                      }
                    }}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="SENAI">SENAI (Educação/Lab)</option>
                    <option value="SESI">SESI (Saúde/Cultura)</option>
                    <option value="IEL">IEL (Liderança/Gestão)</option>
                    <option value="Firjan Central">Firjan Corporativo / Sede</option>
                  </select>
                </div>
              </div>

              {/* Unidade Firjan */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block font-extrabold text-zinc-400">Unidade Firjan de Atuação *</label>
                <input
                  id="input_edit_unidade"
                  type="text"
                  list="edit_unidades_list"
                  placeholder="Ex: SENAI Maracanã"
                  value={editUnidade}
                  onChange={(e) => setEditUnidade(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-750 focus:outline-none focus:border-purple-500"
                  required
                />
                <datalist id="edit_unidades_list">
                  {editSetor === 'SESI' ? (
                    UNIDADES_SESI.map((unit) => <option key={unit} value={unit} />)
                  ) : (
                    UNIDADES_SENAI.map((unit) => <option key={unit} value={unit} />)
                  )}
                </datalist>
              </div>

              {/* Estado & Cidade */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block font-extrabold text-zinc-400">Estado *</label>
                  <select
                    id="input_edit_estado"
                    value={editEstado}
                    onChange={(e) => {
                      const selectedUf = e.target.value;
                      setEditEstado(selectedUf);
                      const stateObj = ESTADOS.find((est) => est.uf === selectedUf);
                      if (stateObj && stateObj.cities.length > 0) {
                        setEditCidade(stateObj.cities[0]);
                      }
                    }}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    {ESTADOS.map((est) => (
                      <option key={est.uf} value={est.uf}>
                        {est.name} ({est.uf})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block font-extrabold text-zinc-400">Cidade *</label>
                  <select
                    id="input_edit_cidade"
                    value={editCidade}
                    onChange={(e) => setEditCidade(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-2 py-1.5 text-xs text-zinc-350 focus:outline-none focus:border-purple-500 cursor-pointer"
                    required
                  >
                    <option value="">Selecione um município...</option>
                    {(ESTADOS.find((est) => est.uf === editEstado)?.cities || []).map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Segurança MFA Edição */}
              <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-900 flex items-center justify-between text-xs select-none">
                <div className="flex flex-col">
                  <span className="font-semibold text-zinc-300 text-[11px]">Segurança: Ativar MFA de Duas Etapas</span>
                  <span className="text-[8.5px] text-zinc-500">Exigir verificação extra ao realizar login nesta conta</span>
                </div>
                <input
                  id="checkbox_edit_mfa"
                  type="checkbox"
                  checked={editMfaEnabled}
                  onChange={(e) => setEditMfaEnabled(e.target.checked)}
                  className="rounded border-zinc-900 text-purple-600 bg-zinc-950 focus:ring-0 focus:ring-offset-0 focus:outline-none cursor-pointer w-4 h-4"
                />
              </div>

              {/* Footer edit action controls */}
              <div className="pt-4 border-t border-zinc-900 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitUpdatingProfile}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isSubmitUpdatingProfile ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Accessibility Control widgets drawer */}
      <AccessibilityToolbar 
        settings={accessibility} 
        onChange={setAccessibility}
        onVoiceCommandTrigger={handleVoiceCommandNavigation}
        activeTab={activeTab}
      />

    </div>
  );

  // Protected tabs rules
  function canAccessTab(tabName: string): boolean {
    if (!currentUser) return false;
    if (tabName === 'admin') {
      return currentUser.role === 'Administrador' || currentUser.role === 'Super Admin';
    }
    return true;
  }
}
