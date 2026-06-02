import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
  MapPin,
  Gift,
  Search,
  BookOpen,
  Map,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 110,
      damping: 14
    }
  }
};
import { Idea, OperationalInsight, UserProfile } from '../types';

interface DashboardViewProps {
  ideas: Idea[];
  insights: OperationalInsight[];
  users: UserProfile[];
  onNavigate: (tab: string) => void;
  currentUser: UserProfile;
  onRedeemReward: (itemId: string, itemPrice: number, itemName: string) => Promise<{ success: boolean; voucher?: string; error?: string }>;
  onSimulateUser?: (userId: string) => Promise<void>;
  initialTab?: 'kpis' | 'maps' | 'rewards' | 'colaboradores';
}

export default function DashboardView({ 
  ideas, 
  insights, 
  users, 
  onNavigate,
  currentUser,
  onRedeemReward,
  onSimulateUser,
  initialTab
}: DashboardViewProps) {
  // Analytical Calculations
  const totalIdeas = ideas.length;
  const approvedIdeas = ideas.filter(i => i.status === 'Aprovado' || i.status === 'Em implementação' || i.status === 'Finalizado').length;
  
  // Calculate simulated financial economy from ideas
  const totalSavings = ideas
    .filter(i => i.status === 'Aprovado' || i.status === 'Em implementação' || i.status === 'Finalizado')
    .reduce((acc, curr) => {
      if (curr.aiReview?.operationalSaving) {
        const val = parseInt(curr.aiReview.operationalSaving.replace(/[^0-9]/g, ''), 10);
        return acc + (isNaN(val) ? 0 : val);
      }
      return acc + 40000; // default simulation saving if not present
    }, 0);

  // Simulated material/resource waste mitigated (Desperdício Mitigado)
  const totalWasteMitigated = ideas
    .filter(i => i.status === 'Aprovado' || i.status === 'Em implementação' || i.status === 'Finalizado')
    .reduce((acc, curr) => {
      if (curr.aiReview?.operationalSaving) {
        const val = parseInt(curr.aiReview.operationalSaving.replace(/[^0-9]/g, ''), 10);
        return acc + (isNaN(val) ? 0 : Math.round(val * 0.42)); // 42% of saving is mitigated direct waste
      }
      return acc + 16800;
    }, 0);

  // Adesão de Fomento (Engagement / active fumento rate)
  const engagementRate = users.length ? Math.min(99.8, Math.max(78.5, 88.4 + (ideas.length * 1.1))) : 95.8;

  // Group ideas by department/area
  const deptCount: { [key: string]: number } = {
    'SESI RJ': 0,
    'SENAI RJ': 0,
    'IEL RJ': 0,
    'Suporte e TI': 0,
    'Recursos Humanos': 0
  };

  ideas.forEach(i => {
    const author = users.find(u => u.id === i.authorId);
    const sector = (author?.setor || '').toLowerCase();
    const dept = (i.authorDept || author?.department || '').toLowerCase();
    const title = (i.title || '').toLowerCase();
    const desc = (i.description || '').toLowerCase();

    if (sector.includes('sesi') || dept.includes('sesi') || title.includes('sesi') || desc.includes('sesi')) {
      deptCount['SESI RJ']++;
    } else if (sector.includes('senai') || dept.includes('senai') || dept.includes('produção') || title.includes('senai') || desc.includes('senai')) {
      deptCount['SENAI RJ']++;
    } else if (sector.includes('iel') || dept.includes('iel') || title.includes('iel') || desc.includes('iel')) {
      deptCount['IEL RJ']++;
    } else if (dept.includes('recurso') || dept.includes('humanos')) {
      deptCount['Recursos Humanos']++;
    } else {
      deptCount['Suporte e TI']++;
    }
  });

  // Ranking of collaborators with more rich gamification details (count of contributions)
  const topCollaborators = [...users]
    .sort((a, b) => b.points - a.points);

  // Local dashboard tabs
  const [dashboardTab, setDashboardTab] = useState<'kpis' | 'maps' | 'rewards' | 'colaboradores'>(initialTab || 'kpis');

  useEffect(() => {
    if (initialTab) {
      setDashboardTab(initialTab);
    }
  }, [initialTab]);

  // Interactive Maps state
  const [selectedUnitId, setSelectedUnitId] = useState<string>('sede_botafogo');
  const [searchUnitQuery, setSearchUnitQuery] = useState<string>('');
  const [filterUnitType, setFilterUnitType] = useState<string>('all');
  const [tableRegion, setTableRegion] = useState<string>('all');
  const [tableSearch, setTableSearch] = useState<string>('');

  // State for simulated collaborators list and rankings
  const [selectedColabId, setSelectedColabId] = useState<string>('');
  const [searchColabQuery, setSearchColabQuery] = useState<string>('');

  // Find current active collaborator details & ideas lists
  const activeColab = selectedColabId ? users.find(u => u.id === selectedColabId) : null;
  const colabIdeas = activeColab ? ideas.filter(i => i.authorId === activeColab.id) : [];

  // Filtered collaborators list
  const filteredColabs = users.filter(colab => {
    const text = `${colab.name} ${colab.email} ${colab.unidade || ''} ${colab.setor || ''} ${colab.role} ${colab.matricula || ''}`.toLowerCase();
    return text.includes(searchColabQuery.toLowerCase());
  });

  // Real Firjan Units coordinates & detail mappings
  const firjanUnits = [
    {
      id: 'sede_botafogo',
      name: 'Firjan Sede (Botafogo)',
      type: 'Sede',
      address: 'Rua Farani, 203 - Botafogo, Rio de Janeiro - RJ, 22231-020',
      phone: '(21) 2563-4000',
      workingHours: '08:00 às 18:00 (Seg a Sex)',
      description: 'Centro político-institucional e inteligência coletiva Firjan. Centralização administrativa e coordenação institucional do Rio de Janeiro.',
      services: ['Inteligência de Mercado', 'Defesa de Patentes', 'Assessoria Tributária', 'Atendimento Corporativo'],
      mapsQuery: 'Firjan+Rua+Farani+203+Botafogo+Rio+de+Janeiro'
    },
    {
      id: 'senai_maracana',
      name: 'Firjan SENAI Maracanã',
      type: 'SENAI',
      address: 'Rua Mariz e Barros, 678 - Tijuca, Rio de Janeiro - RJ, 20270-001',
      phone: '(21) 4002-0231',
      workingHours: '07:00 às 22:00 (Seg a Sáb)',
      description: 'Centro de Tecnologia e Educação Profissionalizante com laboratórios avançados em Mecatrônica, TI, Telecomunicações e Automação Industrial.',
      services: ['Labs de Computação em Nuvem', 'Ensaios de Equipamentos Médicos', 'Vestuário e Têxtil', 'Fomento SENAI Lab'],
      mapsQuery: 'Firjan+SENAI+Maracana+Rua+Mariz+e+Barros'
    },
    {
      id: 'sesi_caxias',
      name: 'Firjan SESI / SENAI Duque de Caxias',
      type: 'SESI-SENAI',
      address: 'Rua Arthur Neiva, 100 - Bairro Circular, Duque de Caxias - RJ, 25012-000',
      phone: '(21) 3661-5300',
      workingHours: '07:30 às 22:00 (Seg a Sáb)',
      description: 'Reforço operacional do pólo petroquímico e frotas de saúde móvel diagnóstica. Estrutura acadêmica e poliesportiva SESI.',
      services: ['Diagnósticos de Foco em Saúde', 'Medicina do Trabalho', 'Quadras esportivas e Piscinas', 'Ensino Fundamental SESI'],
      mapsQuery: 'Firjan+Duque+de+Caxias+Rua+Arthur+Neiva'
    },
    {
      id: 'sesi_laranjeiras',
      name: 'Firjan SESI Laranjeiras',
      type: 'SESI',
      address: 'Rua Pinheiro Machado, 256 - Laranjeiras, Rio de Janeiro - RJ, 22211-110',
      phone: '(21) 2563-5000',
      workingHours: '09:00 às 21:00 (Seg a Sex)',
      description: 'Pólo cultural e de fomento artisticos SESI RJ. Atendimento focado em fomento social, peças de teatro e ginástica laboral corporativa.',
      services: ['Teatro SESI Laranjeiras', 'Oficinas de Criação de Áudio', 'Apoio de Bem-estar', 'Salas de Reunião'],
      mapsQuery: 'Firjan+SESI+Laranjeiras+Rua+Pinheiro+Machado'
    },
    {
      id: 'senai_jacarepagua',
      name: 'Firjan SENAI Jacarepaguá',
      type: 'SENAI',
      address: 'Av. Geremário Dantas, 940 - Freguesia, Jacarepaguá, Rio de Janeiro - RJ, 22743-011',
      phone: '(21) 3312-3210',
      workingHours: '08:00 às 22:00 (Seg a Sáb)',
      description: 'Unidade estratégica voltada à Manutenção Automotiva, Soldagem Avançada, Metalomecânica de precisão e Patentes.',
      services: ['Fomento de Sistemas Embarcados', 'Oficinas de Tornearia CNC', 'Formação Aprendiz Civil', 'Apoio Tecnológico às Oficinas'],
      mapsQuery: 'Firjan+SENAI+Jacarepagua+Avenida+Geremario+Dantas'
    },
    {
      id: 'sesi_nova_iguacu',
      name: 'Firjan SESI/SENAI Nova Iguaçu',
      type: 'SESI-SENAI',
      address: 'Rua Gerson Chernicharo, 1319 - Bairro da Luz, Nova Iguaçu - RJ, 26263-110',
      phone: '(21) 3761-1250',
      workingHours: '07:30 às 21:30 (Seg a Sáb)',
      description: 'Integração na Baixada Fluminense. Oferece soluções integradas de fomento de educação básica, segurança alimentar e laboratórios de logística.',
      services: ['Simuladores Avançados de Empilhadeira', 'Escola Técnica da Informação', 'Clinica Odontológica', 'Refeitório SESI Nutre'],
      mapsQuery: 'Firjan+Nova+Iguacu+Rua+Gerson+Chernicharo'
    },
    {
      id: 'senai_resende',
      name: 'Firjan SENAI Resende',
      type: 'SENAI',
      address: 'Rua Marcílio Dias, 468 - Jardim Jalisco, Resende - RJ, 27510-080',
      phone: '(24) 3381-9200',
      workingHours: '08:00 às 22:00 (Seg a Sex)',
      description: 'Pilar do pólo automotivo fluminense. Laboratórios estruturados para Mecânica de Motores leves e pesados, Siderurgia e Automação de Caminhões.',
      services: ['Simulação de Robótica KUKA', 'Inovação em Automação Siderúrgica', 'Parceria Administrativa Stellantis/VW', 'Ensaios de Resistência de Materiais'],
      mapsQuery: 'Firjan+SENAI+Resende+Rua+Marcilio+Dias'
    },
    {
      id: 'sesi_niteroi',
      name: 'Firjan SESI / SENAI Niterói',
      type: 'SESI-SENAI',
      address: 'Rua General Castrioto, 460 - Barreto, Niterói - RJ, 24110-256',
      phone: '(21) 2719-9400',
      workingHours: '07:00 às 22:00 (Seg a Sáb)',
      description: 'Unidade metropolitana focada na Indústria Criativa, Manutenção de Equipamentos Navais de Fretamento e Engenharia Mecânica de fomento.',
      services: ['Fomento de Soldagem Naval', 'Apoio de Segurança do Trabalho', 'Estudos de Economia do Mar', 'Cursos IEL Rio Leste'],
      mapsQuery: 'Firjan+Niteroi+Rua+General+Castrioto'
    },
    {
      id: 'senai_volta_redonda',
      name: 'Firjan SENAI Volta Redonda',
      type: 'SENAI',
      address: 'Rua Pedro Lima, 130 - Niterói, Volta Redonda - RJ, 27283-370',
      phone: '(24) 3340-5550',
      workingHours: '07:30 às 22:00 (Seg a Sáb)',
      description: 'Centro tecnológico metalomecânico de Volta Redonda, focado em Siderurgia tradicional, Automação Industrial CLP de ponta e Soldagem profissional.',
      services: ['Ensaios Técnicos Metallurgicos', 'Labs Soldagem e Caldeiraria', 'Automação CLP e Robótica', 'Treinamentos de NR Industriais'],
      mapsQuery: 'Firjan+SENAI+Volta+Redonda+Rua+Pedro+Lima+130'
    },
    {
      id: 'sesi_volta_redonda',
      name: 'Firjan SESI Volta Redonda',
      type: 'SESI',
      address: 'Av. Lucas Evangelista de Oliveira Figueireira, 1600 - Aterrado, Volta Redonda - RJ, 27215-000',
      phone: '(24) 3344-9750',
      workingHours: '08:00 às 18:00 (Seg a Sex)',
      description: 'Estrutura integrada de saúde ocupacional, esporte, educação básica e bem-estar do trabalhador na região do Médio Paraíba.',
      services: ['Medicina Ocupacional Preventiva', 'Academia e Ginásio Poliesportivo', 'Escola Educação Básica SESI', 'Odontologia e Vacinação'],
      mapsQuery: 'Firjan+SESI+Volta+Redonda+Avenida+Lucas+Evangelista+Oliveira'
    },
    {
      id: 'senai_barra_mansa',
      name: 'Firjan SENAI Barra Mansa',
      type: 'SENAI',
      address: 'Rua São Sebastião, 1720 - Centro, Barra Mansa - RJ, 27310-022',
      phone: '(24) 3328-1350',
      workingHours: '08:00 às 21:30 (Seg a Sex)',
      description: 'Unidade capacitadora para o desenvolvimento metalúrgico regional, mecânica de fomento e soluções industriais práticas.',
      services: ['Manutenção Mecânica Geral', 'Panificação e Alimentos', 'AutoCAD Integrado', 'Apoio de Patentes'],
      mapsQuery: 'Firjan+SENAI+Barra+Mansa+Rua+Sao+Sebastiao'
    },
    {
      id: 'senai_campos',
      name: 'Firjan SENAI Campos dos Goytacazes',
      type: 'SENAI',
      address: 'Rua Dr. Lacerda Sobrinho, 220 - Centro, Campos dos Goytacazes - RJ, 28010-076',
      phone: '(22) 2739-1600',
      workingHours: '08:00 às 22:00 (Seg a Sáb)',
      description: 'Desenvolvimento industrial focado na bacia petrolífera e açúcar e álcool no Norte Fluminense.',
      services: ['Instrumentação Industrial', 'Eletrônica e Automação', 'Laboratório Petroquímico', 'Formação Continuada'],
      mapsQuery: 'Firjan+SENAI+Campos+Dr+Lacerda+Sobrinho'
    },
    {
      id: 'senai_macae',
      name: 'Firjan SENAI Macaé',
      type: 'SENAI',
      address: 'Estrada Imburo, s/n - Imburo, Macaé - RJ, 27913-970',
      phone: '(22) 2791-9250',
      workingHours: '07:30 às 22:00 (Seg a Sáb)',
      description: 'Unidade estratégica offshore. Centrada na cadeia petrolífera profunda, normas de segurança de frotas e refinaria.',
      services: ['Operações Onshore/Offshore', 'Hidráulica de Precisão', 'Soldagem em Alta Pressão', 'Segurança Marítima'],
      mapsQuery: 'Firjan+SENAI+Macae+Estrada+Imburo'
    },
    {
      id: 'senai_petropolis',
      name: 'Firjan SENAI Petrópolis',
      type: 'SENAI',
      address: 'Rua Bingen, 130 - Bingen, Petrópolis - RJ, 25660-004',
      phone: '(24) 2244-3200',
      workingHours: '08:00 às 22:00 (Seg a Sex)',
      description: 'Escola de tecnologia focada na Região Serrana com fomento de softwares, eletrotécnica e inovação têxtil.',
      services: ['Fomento de Software', 'Análise de Redes Informáticas', 'Painéis de Eficiência Energética', 'Moda Têxtil'],
      mapsQuery: 'Firjan+SENAI+Petropolis+Rua+Bingen'
    },
    {
      id: 'senai_friburgo',
      name: 'Firjan SENAI Nova Friburgo',
      type: 'SENAI',
      address: 'Rua Ernesto Brasílio, 74 - Centro, Nova Friburgo - RJ, 28610-120',
      phone: '(22) 2525-6300',
      workingHours: '08:00 às 21:00 (Seg a Sex)',
      description: 'Focado em Moda Íntima e Metalomecânica leve na Região Serrana.',
      services: ['Laboratórios Têxteis Integrados', 'Oficinas Costura Industrial', 'Metrologia Dimensional', 'Usinagem de Moldes'],
      mapsQuery: 'Firjan+SENAI+Nova+Friburgo+Rua+Ernesto+Brasilio'
    },
    {
      id: 'senai_itaperuna',
      name: 'Firjan SENAI Itaperuna',
      type: 'SENAI',
      address: 'Av. Deputado José de Cerqueira Garcia, s/n - Bairro Aeroporto, Itaperuna - RJ, 28300-000',
      phone: '(22) 3811-2100',
      workingHours: '08:00 às 21:30 (Seg a Sex)',
      description: 'Atendimento do Noroeste Fluminense no suporte à agroindústria e fomento do vestuário regional.',
      services: ['Design de Calçados', 'Manutenção Agroindustrial', 'Logística de Abastecimento', 'Informática Comercial'],
      mapsQuery: 'Firjan+SENAI+Itaperuna+Bairro+Aeroporto'
    },
    {
      id: 'senai_cabo_frio',
      name: 'Firjan SENAI Cabo Frio',
      type: 'SENAI',
      address: 'Estrada de Nelore, s/n - Novo Portinho, Cabo Frio - RJ, 28912-320',
      phone: '(22) 2641-7200',
      workingHours: '08:00 às 22:00 (Seg a Sex)',
      description: 'Focado no desenvolvimento do comércio marinho, manutenção mecânica náutica e fomento turístico da Região dos Lagos.',
      services: ['Instalações de Telecomunicação', 'Motores Náuticos', 'Refrigeração Comercial', 'Usinagem CNC de Alumínio'],
      mapsQuery: 'Firjan+SENAI+Cabo+Frio+Novo+Portinho'
    },
    {
      id: 'senai_tres_rios',
      name: 'Firjan SENAI Três Rios',
      type: 'SENAI',
      address: 'Av. Prefeito Alberto da Silva Lavinas, 1847 - Centro, Três Rios - RJ, 25802-100',
      phone: '(24) 2251-9500',
      workingHours: '08:00 às 22:00 (Seg a Sex)',
      description: 'Pólo regional de transportes logísticos e mecânica pesada rodoviária.',
      services: ['Logística Integrada', 'Eletromecânica Frota', 'Qualificação Logística', 'NR12 Máquinas Máquinas'],
      mapsQuery: 'Firjan+SENAI+Tres+Rios+Alberto+Silva+Lavinas'
    },
    {
      id: 'senai_santa_cruz',
      name: 'Firjan SENAI Santa Cruz',
      type: 'SENAI',
      address: 'Rua do Império, 500 - Santa Cruz, Rio de Janeiro - RJ, 23515-160',
      phone: '(21) 3331-5221',
      workingHours: '07:30 às 22:00 (Seg a Sáb)',
      description: 'Unidade que atende o maciço industrial da Zona Oeste Carioca na área portuária e siderúrgica moderna.',
      services: ['Instalações Siderúrgicas', 'CLP e Dispositivos Industriais', 'Labs Químicos Focados', 'Segurança Patrimonial'],
      mapsQuery: 'Firjan+SENAI+Santa+Cruz+Rua+do+Imperio'
    },
    {
      id: 'senai_benfica',
      name: 'Firjan SENAI Benfica',
      type: 'SENAI',
      address: 'Praça Assunção, 115 - Benfica, Rio de Janeiro - RJ, 20961-020',
      phone: '(21) 3891-2300',
      workingHours: '07:00 às 22:00 (Seg a Sáb)',
      description: 'Unidade central e sede técnica dos Institutos SENAI de Tecnologia em Soldagem e Automação Industrial do RJ.',
      services: ['Homologação de Soldadores', 'Simulação Dinâmica Avançada', 'Impressão 3D e Prototipagem', 'Projetos PDI Certificados'],
      mapsQuery: 'Firjan+SENAI+Benfica+Praca+Assuncao'
    },
    {
      id: 'senai_sao_goncalo',
      name: 'Firjan SENAI São Gonçalo',
      type: 'SENAI',
      address: 'Rua Dr. Nilo Peçanha, 134 - Centro, São Gonçalo - RJ, 24440-410',
      phone: '(21) 3706-1300',
      workingHours: '08:00 às 22:00 (Seg a Sab)',
      description: 'Polo técnico de São Gonçalo voltado à metalúrgica e serviços de instalações prediais e fomento de edificações.',
      services: ['Desenho Técnico Industrial', 'Eletricidade Predial Comercial', 'Usinagem Pesada e Fresagem', 'Pintura Técnica Estofamento'],
      mapsQuery: 'Firjan+SENAI+Sao+Goncalo+Nilo+Pecanha'
    },
    {
      id: 'senai_teresopolis',
      name: 'Firjan SENAI Teresópolis',
      type: 'SENAI',
      address: 'Rua Jorge Lóssio, 1205 - Alto, Teresópolis - RJ, 25960-030',
      phone: '(24) 2641-7500',
      workingHours: '08:00 às 21:00 (Seg a Sex)',
      description: 'Unidade focada no fomento tecnológico de panificação profissional de alta qualidade, confeitaria e soluções de TI locais.',
      services: ['Panificação Artesanal Industrial', 'TI e Redes de fibra óptica', 'Suporte a Empreendedores Digitais', 'Manutenção Predial'],
      mapsQuery: 'Firjan+SENAI+Teresopolis+Rua+Jorge+Lossio'
    },
    {
      id: 'senai_angra',
      name: 'Firjan SENAI Angra dos Reis',
      type: 'SENAI',
      address: 'Av. Almirante Júlio César de Noronha, s/n - Centro, Angra dos Reis - RJ, 23900-500',
      phone: '(24) 3365-1440',
      workingHours: '08:00 às 21:30 (Seg a Sex)',
      description: 'Fomento da Engenharia Pesada Naval de Angra dos Reis com laboratórios integrados de Metalurgia de Alta Pressão e Soldagem em Estaleiros.',
      services: ['Soldagem Naval Reconhecida', 'Inspeção Dutos Ultrassom', 'Hidráulica de Bombas e Turbinas', 'Pintura Naval Especializada'],
      mapsQuery: 'Firjan+SENAI+Angra+dos+Reis+Centro'
    },
    {
      id: 'senai_padua',
      name: 'Firjan SENAI Santo Antônio de Pádua',
      type: 'SENAI',
      address: 'Rua Dr. Temístocles de Almeida, 15 - Centro, Santo Antônio de Pádua - RJ, 28470-000',
      phone: '(22) 3851-2400',
      workingHours: '13:00 às 22:00 (Seg a Sex)',
      description: 'Polo minerais da região noroeste, focado em ensaios de gesso, rochas e consultoria de fomento mineral.',
      services: ['Ensaios Resistência Rochas', 'Tecnologia Extração Mineral', 'Manutenção Máquinas Pesadas', 'Ergonomia Operacional'],
      mapsQuery: 'Firjan+SENAI+Santo+Antonio+de+Padua'
    },
    {
      id: 'senai_vassouras',
      name: 'Firjan SENAI Vassouras',
      type: 'SENAI',
      address: 'Rua Nilo Peçanha, 85 - Centro, Vassouras - RJ, 27700-000',
      phone: '(24) 2471-1220',
      workingHours: '13:00 às 22:00 (Seg a Sex)',
      description: 'Centro de Tecnologia e Eletrotécnica focado nas indústrias agroquímicas e fomento à inovação de logística.',
      services: ['Análise Eficiência Energia', 'CLP Automação Básica', 'Instalações Comerciais', 'Projetos CAD'],
      mapsQuery: 'Firjan+SENAI+Vassouras+Rua+Nilo+Pecanha'
    },
    {
      id: 'senai_valenca',
      name: 'Firjan SENAI Valença',
      type: 'SENAI',
      address: 'Rua Dom Pedro II, 221 - Centro, Valença - RJ, 27600-000',
      phone: '(24) 2452-9600',
      workingHours: '08:00 às 21:00 (Seg a Sex)',
      description: 'Polo produtivo do Médio Paraíba na capacitação profissional em usinagem rotativa, moda e calçados.',
      services: ['Costura Industrial Camisaria', 'Torno Mecânico e Fresagem', 'Logística de Suprimentos', 'Manutenção Frota Leve'],
      mapsQuery: 'Firjan+SENAI+Valenca+Dom+Pedro+II'
    },
    {
      id: 'senai_barra_pirai',
      name: 'Firjan SENAI Barra do Piraí',
      type: 'SENAI',
      address: 'Rua Franklin de Moraes, 153 - Centro, Barra do Piraí - RJ, 27123-010',
      phone: '(24) 2442-1200',
      workingHours: '13:00 às 22:00 (Seg a Sex)',
      description: 'Infraestrutura voltada ao desenvolvimento metal mecânico e fomento à automação industrial em microrregiões ferroviárias.',
      services: ['Automação Eletropneumática', 'Instrumentação Básica', 'Suporte a Pequenas Indústrias', 'Treinamento Segurança'],
      mapsQuery: 'Firjan+SENAI+Barra+do+Pirai+Franklin'
    },
    {
      id: 'sesi_barra_mansa',
      name: 'Firjan SESI Barra Mansa',
      type: 'SESI',
      address: 'Av. Argemiro de Paula Coutinho, 2000 - Centro, Barra Mansa - RJ, 27310-020',
      phone: '(24) 3328-1400',
      workingHours: '08:00 às 18:00 (Seg a Sex)',
      description: 'Centro integrado de lazer, atendimento odontológico e saúde ocupacional preventiva do SESI.',
      services: ['Medicina Trabalho Periódicos', 'Quadra Areia e Piscinas', 'Eventos Culturais Regional Sesi', 'Palestras Bem-Estar'],
      mapsQuery: 'Firjan+SESI+Barra+Mansa+Argemiro'
    },
    {
      id: 'sesi_campos',
      name: 'Firjan SESI Campos dos Goytacazes',
      type: 'SESI',
      address: 'Av. Deputado Bartolomeu Lysandro, 862 - Guarus, Campos dos Goytacazes - RJ, 28060-010',
      phone: '(22) 2739-1700',
      workingHours: '08:00 às 18:00 (Seg a Sex)',
      description: 'Estrutura completa de esporte e escola de educação básica SESI de alta referência do Norte Fluminense.',
      services: ['Educação Infantil e Fundamental', 'Teatro Sesi Campos', 'Vacinação e Ergonomia Industrial', 'Clube Lazer Trabalhador'],
      mapsQuery: 'Firjan+SESI+Campos+Bartolomeu+Lysandro'
    },
    {
      id: 'sesi_macae',
      name: 'Firjan SESI Macaé',
      type: 'SESI',
      address: 'Alameda Etelvino Gomes, 155 - Riviera Fluminense, Macaé - RJ, 27930-470',
      phone: '(22) 2791-9500',
      workingHours: '08:00 às 18:00 (Seg a Sex)',
      description: 'Preservando a saúde e integridade com foco extremo em ergonomia offshore e check-ups completos dos tripulantes marinhas.',
      services: ['Check-up Clínico Integrado', 'Academia Condicionamento Físico', 'Apoio Psicossocial nas Empresas', 'Exames Saúde Ocupacional'],
      mapsQuery: 'Firjan+SESI+Macae+Etelvino+Gomes'
    },
    {
      id: 'sesi_petropolis',
      name: 'Firjan SESI Petrópolis',
      type: 'SESI',
      address: 'Av. Barão do Rio Branco, 2564 - Centro, Petrópolis - RJ, 25680-276',
      phone: '(24) 2244-3000',
      workingHours: '08:00 às 18:00 (Seg a Sex)',
      description: 'Atuação robusta no apoio esportivo, odontologia clínica focado no bem-estar comunitário da Região Serrana.',
      services: ['Clinica Dentária Especializada', 'Plano Bem-Estar SESI RJ', 'Atividades Físicas Hidroginástica', 'Fomento Cultural no Teatro Sesi'],
      mapsQuery: 'Firjan+SESI+Petropolis+Barao+Rio+Branco'
    },
    {
      id: 'sesi_friburgo',
      name: 'Firjan SESI Nova Friburgo',
      type: 'SESI',
      address: 'Rua Teresópolis, 248 - Vila Amélia, Nova Friburgo - RJ, 28625-050',
      phone: '(22) 2525-6200',
      workingHours: '08:00 às 18:00 (Seg a Sex)',
      description: 'Qualidade de vida com esporte de alta relevância, aulas escolares integradas e clube recreativo do trabalhador serrano.',
      services: ['Ensino Médio Tecnológico Sesi', 'Clube Social Recreativo Sesi / RJ', 'Medicina Ocupacional Periódica', 'Atendimento Nutrológico'],
      mapsQuery: 'Firjan+SESI+Nova+Friburgo+Rua+Teresopolis'
    }
  ];

  // Helper function to dynamically deduce region of units
  const getUnitRegion = (name: string, address: string): string => {
    const n = name.toLowerCase();
    const a = address.toLowerCase();
    if (
      n.includes('sede') || 
      n.includes('maracanã') || 
      n.includes('laranjeiras') || 
      n.includes('jacarepaguá') || 
      n.includes('benfica') || 
      n.includes('santa cruz') || 
      n.includes('niteroi') || 
      n.includes('niterói') || 
      n.includes('gonçalo')
    ) {
      return 'Capital / Região Metropolitana';
    }
    if (n.includes('caxias') || n.includes('nova iguaçu') || n.includes('iguacu')) {
      return 'Baixada Fluminense';
    }
    if (
      n.includes('volta redonda') || 
      n.includes('resende') || 
      n.includes('barra mansa') || 
      n.includes('angra') || 
      n.includes('piraí') || 
      n.includes('valença') || 
      n.includes('vassouras')
    ) {
      return 'Sul Fluminense';
    }
    if (n.includes('campos') || n.includes('macaé') || n.includes('macae')) {
      return 'Norte Fluminense';
    }
    if (
      n.includes('petrópolis') || 
      n.includes('petropolis') || 
      n.includes('friburgo') || 
      n.includes('teresópolis') || 
      n.includes('teresopolis')
    ) {
      return 'Região Serrana';
    }
    if (
      n.includes('itaperuna') || 
      n.includes('pádua') || 
      n.includes('padua') || 
      n.includes('três rios') || 
      n.includes('tres rios') || 
      n.includes('cabo frio')
    ) {
      return 'Noroeste / Centro-Sul / Lagos';
    }
    return 'Outras Regiões';
  };

  // Filtering units logic
  const filteredUnits = firjanUnits.filter(unit => {
    const matchesSearch = unit.name.toLowerCase().includes(searchUnitQuery.toLowerCase()) || 
                          unit.address.toLowerCase().includes(searchUnitQuery.toLowerCase()) ||
                          unit.description.toLowerCase().includes(searchUnitQuery.toLowerCase());
    const matchesFilter = filterUnitType === 'all' || 
                          (filterUnitType === 'SENAI' && unit.type.includes('SENAI')) ||
                          (filterUnitType === 'SESI' && unit.type.includes('SESI')) ||
                          (filterUnitType === 'Sede' && unit.type === 'Sede');
    return matchesSearch && matchesFilter;
  });

  const activeUnit = firjanUnits.find(u => u.id === selectedUnitId) || firjanUnits[0];

  // Rewards catalog programs
  const REWARDS = [
    { id: 'prize_temp_cup', name: 'Caneca Térmica Inox Firjan Connect', points: 150, category: 'Brindes', desc: 'Caneca térmica com isolamento duplo a vácuo, pintura preto fosca e logo gravado a laser.', icon: '☕' },
    { id: 'prize_temp_notebook', name: 'Caderno de Anotações Ecocraft', points: 100, category: 'Brindes', desc: 'Capa dura de bambu sustentável, papel kraft reciclado com caneta ecológica em espiral.', icon: '📔' },
    { id: 'prize_temp_backpack', name: 'Mochila Antifurto Premium Pro', points: 500, category: 'Acessórios', desc: 'Mochila acolchoada impermeável para notebook, com cadeado de senha e conexões USB/P2 externas.', icon: '🎒' },
    { id: 'prize_temp_course', name: 'Certificação Avançada AI Generativa SENAI', points: 300, category: 'Educação', desc: 'Acesso integral à trilha VIP de especialização em Inteligência Artificial Generativa e Prompts da Firjan.', icon: '🎓' },
    { id: 'prize_temp_jacket', name: 'Corta Vento Oficial Firjan Connect', points: 400, category: 'Moda', desc: 'Jaqueta esportiva repelente à água, cor grafite texturizado com revestimento em microfibra.', icon: '🧥' },
    { id: 'prize_temp_hotel', name: 'Fim de Semana SESI Convenções Hotel Recreio', points: 1000, category: 'Lazer e Bem-estar', desc: 'Hospedagem com direito a acompanhante (Sexta a Domingo) com pensão completa na colônia ecológica SESI.', icon: '🏨' }
  ];

  // Points redemption variables and feedback
  const [redeemHistory, setRedeemHistory] = useState<{ id: string, name: string, points: number, date: string, voucher: string }[]>([]);
  const [activeVoucher, setActiveVoucher] = useState<{ code: string; name: string } | null>(null);
  const [redeemErrorMessage, setRedeemErrorMessage] = useState<string>('');
  const [isRedeeming, setIsRedeeming] = useState<boolean>(false);

  const handleRedeemItemClick = async (itemId: string, itemPrice: number, itemName: string) => {
    setRedeemErrorMessage('');
    setIsRedeeming(true);
    try {
      const result = await onRedeemReward(itemId, itemPrice, itemName);
      if (result.success && result.voucher) {
        setActiveVoucher({ code: result.voucher, name: itemName });
        // Add locally to history
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
        setRedeemErrorMessage(result.error || 'Erro inesperante ao processar o resgate.');
      }
    } catch (err) {
      setRedeemErrorMessage('Falha temporária ao comunicar com o servidor.');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="space-y-6" role="main">
      {/* Upper Module navigation tabs inside executive dashboard */}
      <div className="flex border-b border-zinc-900 bg-zinc-950/40 p-1 rounded-xl gap-2 select-none border overflow-x-auto sm:overflow-visible">
        <button
          id="tab_dash_indicators"
          onClick={() => setDashboardTab('kpis')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-semibold uppercase font-display tracking-wider flex items-center justify-center gap-2 transition-all ${
            dashboardTab === 'kpis' 
              ? 'bg-purple-600/15 text-purple-300 border border-purple-500/20' 
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40 border border-transparent'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-purple-400 shrink-0" /> Indicadores & Radar
        </button>
        <button
          id="tab_dash_maps"
          onClick={() => setDashboardTab('maps')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-semibold uppercase font-display tracking-wider flex items-center justify-center gap-2 transition-all ${
            dashboardTab === 'maps' 
              ? 'bg-purple-600/15 text-purple-300 border border-purple-500/20' 
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40 border border-transparent'
          }`}
        >
          <Map className="w-4 h-4 text-green-400 shrink-0" /> Unidades Reais
        </button>
        <button
          id="tab_dash_rewards"
          onClick={() => setDashboardTab('rewards')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-semibold uppercase font-display tracking-wider flex items-center justify-center gap-2 transition-all ${
            dashboardTab === 'rewards' 
              ? 'bg-purple-600/15 text-purple-300 border border-purple-500/20' 
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40 border border-transparent'
          }`}
        >
          <Gift className="w-4 h-4 text-yellow-400 shrink-0" /> Loja de Prêmios
        </button>
        <button
          id="tab_dash_colaboradores"
          onClick={() => setDashboardTab('colaboradores')}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg text-xs font-semibold uppercase font-display tracking-wider flex items-center justify-center gap-2 transition-all ${
            dashboardTab === 'colaboradores' 
              ? 'bg-purple-600/15 text-purple-300 border border-purple-500/20' 
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40 border border-transparent'
          }`}
        >
          <Users className="w-4 h-4 text-cyan-400 shrink-0" /> Colaboradores & Rankings
        </button>
      </div>

      {/* --- DASHBOARD TAB 1: EXECUTIVE INDICATORS --- */}
      {dashboardTab === 'kpis' && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-6"
        >
          {/* Welcome Banner */}
          <motion.div
            variants={cardVariants}
            className="relative overflow-hidden rounded-2xl p-5 md:p-6 glass-panel border-purple-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-10 w-60 h-60 bg-green-500/5 rounded-full blur-3xl -z-10" />
            
            <div className="space-y-1.5">
              <span className="text-[9px] bg-purple-500/10 text-purple-300 font-mono tracking-widest uppercase border border-purple-500/20 px-2.5 py-0.5 rounded-full font-bold">
                Ecosistema Firjan Connect
              </span>
              <h1 className="text-xl md:text-2xl font-bold font-display tracking-tight text-white leading-tight">
                Impulsionando a Inovação Industrial
              </h1>
              <p className="text-xs text-zinc-400 max-w-xl">
                Acompanhe indicadores consolidados de fomento, produtividade setorial da comissão de frotas e análises instantâneas de gargalos com Inteligência Artificial de ponta.
              </p>
            </div>

            <button
              id="dash_btn_nav_ideia"
              onClick={() => onNavigate('cadastro')}
              className="bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-green-500/10 shrink-0 font-sans"
            >
              <Zap className="w-4 h-4 fill-black text-black" /> Enviar Nova Ideia
            </button>
          </motion.div>

          {/* KPI Mini grids - Corporate Premium Neon Theme */}
          <motion.div variants={cardVariants} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            
            {/* KPI 1 - Ideias Cadastradas */}
            <div className="glass-panel p-4 rounded-xl border border-zinc-900 hover:border-purple-500/40 flex items-center gap-3 bg-zinc-950/60 shadow-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-all duration-300">
              <div className="p-2 w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                <Lightbulb className="w-5 h-5 animate-pulse" />
              </div>
              <div className="text-left font-sans">
                <span className="text-[9px] text-zinc-500 block font-bold uppercase tracking-wider font-mono">Ideias Registradas</span>
                <span className="text-xl font-extrabold font-display text-white leading-none block mt-0.5">{totalIdeas}</span>
                <span className="text-[9px] text-green-400 block font-medium font-mono mt-0.5">⚡ +12% este mês</span>
              </div>
            </div>

            {/* KPI 2 - Ideias Aprovadas */}
            <div className="glass-panel p-4 rounded-xl border border-zinc-900 hover:border-green-400/40 flex items-center gap-3 bg-zinc-950/60 shadow-lg hover:shadow-[0_0_20px_rgba(34,197,94,0.1)] transition-all duration-300">
              <div className="p-2 w-10 h-10 rounded-lg bg-green-400/10 text-green-400 flex items-center justify-center border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-left font-sans">
                <span className="text-[9px] text-zinc-500 block font-bold uppercase tracking-wider font-mono">Homologadas</span>
                <span className="text-xl font-extrabold font-display text-white leading-none block mt-0.5">{approvedIdeas}</span>
                <span className="text-[9px] text-zinc-400 block font-mono mt-0.5">Taxa: {totalIdeas ? Math.round((approvedIdeas / totalIdeas) * 100) : 0}%</span>
              </div>
            </div>

            {/* KPI 3 - Economia Estimada (ROI) */}
            <div className="glass-panel p-4 rounded-xl border border-zinc-900 hover:border-purple-500/40 flex items-center gap-3 bg-zinc-950/60 shadow-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-all duration-300">
              <div className="p-2 w-10 h-10 rounded-lg bg-purple-500/10 text-purple-300 flex items-center justify-center border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                <DollarSign className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-left font-sans">
                <span className="text-[9px] text-zinc-500 block font-bold uppercase tracking-wider font-mono">Retorno ROI Est.</span>
                <span className="text-lg font-extrabold font-display text-green-400 leading-none block mt-0.5">R$ {totalSavings.toLocaleString('pt-BR')}</span>
                <span className="text-[9px] text-purple-400 block font-mono mt-0.5">Economia Est.</span>
              </div>
            </div>

            {/* KPI 4 - Desperdício Mitigado */}
            <div className="glass-panel p-4 rounded-xl border border-zinc-900 hover:border-green-400/40 flex items-center gap-3 bg-zinc-950/60 shadow-lg hover:shadow-[0_0_20px_rgba(34,197,94,0.1)] transition-all duration-300">
              <div className="p-2 w-10 h-10 rounded-lg bg-green-400/10 text-green-400 flex items-center justify-center border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-left font-sans">
                <span className="text-[9px] text-zinc-500 block font-bold uppercase tracking-wider font-mono">Desperdício Mitigado</span>
                <span className="text-lg font-extrabold font-display text-green-400 leading-none block mt-0.5">R$ {totalWasteMitigated.toLocaleString('pt-BR')}</span>
                <span className="text-[9px] text-green-500 block font-mono mt-0.5">Custo Evitado</span>
              </div>
            </div>

            {/* KPI 5 - Engajamento Interno */}
            <div className="glass-panel p-4 rounded-xl border border-zinc-900 hover:border-purple-500/40 flex items-center gap-3 bg-zinc-950/60 shadow-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-all duration-300 col-span-2 sm:col-span-1 lg:col-span-1">
              <div className="p-2 w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                <Users className="w-5 h-5 text-purple-400 animate-pulse" />
              </div>
              <div className="text-left font-sans">
                <span className="text-[9px] text-zinc-500 block font-bold uppercase tracking-wider font-mono">Adesão de Fomento</span>
                <span className="text-xl font-extrabold font-display text-white leading-none block mt-0.5">{engagementRate.toFixed(1)}%</span>
                <span className="text-[9px] text-purple-400 block font-mono mt-0.5">Participação FIRJAN</span>
              </div>
            </div>
          </motion.div>

          {/* Core Analytics charts & Department summary */}
          <motion.div variants={cardVariants} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* SVG Analytics Chart Card */}
            <div className="glass-panel p-5 rounded-xl border-zinc-850 md:col-span-2 space-y-4 text-left">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display">
                    Retorno Operacional de Fomento (ROI)
                  </h3>
                  <p className="text-[10px] text-zinc-500">Desenvolvimento de ideias aceitas e economia trimestral acumulada</p>
                </div>
                <div className="flex gap-3 text-[9px] font-mono">
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <span className="w-2 h-2 bg-purple-500 rounded-full inline-block" /> Economia (R$)
                  </span>
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full inline-block" /> Submissões
                  </span>
                </div>
              </div>

              {/* Responsive custom SVG Area Chart */}
              <div className="w-full h-48 relative bg-zinc-950/70 rounded-lg p-2.5 border border-zinc-900">
                <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.02)" />
                  <line x1="40" y1="65" x2="480" y2="65" stroke="rgba(255,255,255,0.02)" />
                  <line x1="40" y1="110" x2="480" y2="110" stroke="rgba(255,255,255,0.02)" />
                  <line x1="40" y1="155" x2="480" y2="155" stroke="rgba(255,255,255,0.04)" />

                  <defs>
                    <linearGradient id="purpleGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="greenGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Area graphs */}
                  <path d="M 40 155 Q 120 125, 200 95 T 360 55 T 480 32 L 480 155 Z" fill="url(#purpleGrad2)" />
                  <path d="M 40 155 Q 120 125, 200 95 T 360 55 T 480 32" fill="none" stroke="#a855f7" strokeWidth="2.5" />

                  <path d="M 40 155 Q 120 148, 200 130 T 360 100 T 480 75 L 480 155 Z" fill="url(#greenGrad2)" />
                  <path d="M 40 155 Q 120 148, 200 130 T 360 100 T 480 75" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3 2" />

                  {/* Intersect points */}
                  <circle cx="200" cy="95" r="3.5" fill="#a855f7" />
                  <circle cx="360" cy="55" r="3.5" fill="#a855f7" />
                  <circle cx="480" cy="32" r="4" fill="#22c55e" />

                  {/* X Axis Texts */}
                  <text x="40" y="175" fill="#52525b" fontSize="8" textAnchor="middle">Mar</text>
                  <text x="150" y="175" fill="#52525b" fontSize="8" textAnchor="middle">Abr</text>
                  <text x="280" y="175" fill="#52525b" fontSize="8" textAnchor="middle">Mai (Corrente)</text>
                  <text x="400" y="175" fill="#52525b" fontSize="8" textAnchor="middle">Junho</text>
                  <text x="480" y="175" fill="#52525b" fontSize="8" textAnchor="end">Projeção 2026</text>

                  {/* Y Axis values */}
                  <text x="32" y="24" fill="#3f3f46" fontSize="7" textAnchor="end">R$ 500k</text>
                  <text x="32" y="68" fill="#3f3f46" fontSize="7" textAnchor="end">R$ 250k</text>
                  <text x="32" y="113" fill="#3f3f46" fontSize="7" textAnchor="end">R$ 100k</text>
                  <text x="32" y="158" fill="#3f3f46" fontSize="7" textAnchor="end">0</text>
                </svg>
              </div>
            </div>

            {/* Department representation stats */}
            <div className="glass-panel p-5 rounded-xl border-zinc-850 space-y-4 text-left">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-purple-400" /> Ideias por Segmento
                </h3>
                <p className="text-[10px] text-zinc-500">Métricas setoriais da casa de fomento</p>
              </div>

              <div className="space-y-3.5 pt-1">
                {Object.keys(deptCount).map((dept) => {
                  const count = deptCount[dept];
                  const pct = totalIdeas ? Math.round((count / totalIdeas) * 100) : 0;
                  return (
                    <div key={dept} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-350 font-medium">{dept}</span>
                        <span className="text-zinc-500 font-mono text-[10px]">{count} desc. ({pct}%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
                        <div 
                          className="h-full bg-purple-500 rounded-full transition-all duration-1000" 
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Double Column: AI Alerts, insights & Leaderboard */}
          <motion.div variants={cardVariants} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* AI Automated Alerts */}
            <div className="glass-panel p-5 rounded-xl border-zinc-850 md:col-span-2 space-y-4 text-left">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display flex items-center gap-1.5 text-purple-300">
                    <Zap className="w-3.5 h-3.5 text-green-400 fill-green-450/20" /> Alertas Operacionais via Inteligência Artificial
                  </h3>
                  <p className="text-[10px] text-zinc-500">Gargalos logísticos e de pessoal auditados em tempo real</p>
                </div>
                <button
                  id="dashboard_btn_eficiencia"
                  onClick={() => onNavigate('eficiencia')}
                  className="text-[9px] font-mono text-purple-400 hover:text-white border border-zinc-850 px-2 py-0.5 rounded hover:bg-zinc-900/60 transition-all font-semibold"
                >
                  Ver Painel de Gargalos
                </button>
              </div>

              <div className="space-y-3">
                {insights.slice(0, 2).map((ins) => (
                  <div 
                    key={ins.id} 
                    className={`p-3 rounded-xl border flex gap-3 ${
                      ins.type === 'gargalo' ? 'bg-orange-950/15 border-orange-500/20' : 
                      ins.type === 'retrabalho' ? 'bg-purple-950/15 border-purple-500/20' : 
                      'bg-zinc-900/40 border-zinc-850'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      <AlertTriangle className={`w-4 h-4 ${ins.type === 'gargalo' ? 'text-orange-400' : 'text-purple-400'}`} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{ins.title}</span>
                        <span className="text-[8px] bg-black/60 text-zinc-400 px-1.5 py-0.5 rounded font-mono uppercase border border-zinc-800">{ins.area}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        {ins.description}
                      </p>
                      <div className="text-[10px] text-zinc-500 pt-0.5 font-mono flex flex-wrap gap-x-4 gap-y-1 items-center">
                        <span className="text-orange-300 font-semibold">⚠️ Nível de Gargalo: {ins.impact}</span>
                        <span className="text-green-300">💡 Solução da IA: {ins.recommendation}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gamified Leaderboard */}
            <div className="glass-panel p-5 rounded-xl border-zinc-850 space-y-4 text-left flex flex-col justify-between">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-green-400" /> Ativos & Gamificação
                </h3>
                <p className="text-[10px] text-zinc-500">Ranking corporativo de inovação Firjan</p>
              </div>

              <div className="space-y-3 pt-1 flex-1">
                {topCollaborators.slice(0, 4).map((u, i) => (
                  <div key={u.id} className="flex items-center justify-between bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-900">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="relative shrink-0">
                        <img 
                          src={u.avatar} 
                          alt={u.name} 
                          className="w-7 h-7 rounded-full border border-purple-500/30 object-cover" 
                        />
                        <span className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-zinc-900 text-[9px] font-bold text-white rounded-full flex items-center justify-center border border-purple-500/50">
                          {i + 1}
                        </span>
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-xs font-bold text-white block truncate leading-tight select-none">{u.name}</span>
                        <span className="text-[9px] text-zinc-500 block truncate">{u.unidade || 'Unidade Sede'}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-green-400 block">{u.points} pts</span>
                      <span className="text-[8px] text-purple-300 block font-display truncate uppercase font-semibold">
                        {u.badges[0] || 'Novo Membro'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* --- DASHBOARD TAB 2: INTERACTIVE REAL PHYSICAL MAPS EXPLORER --- */}
      {dashboardTab === 'maps' && (
        <div className="space-y-6 animate-in fade-in text-left">
          {/* Section banner */}
          <div className="glass-panel p-5 rounded-2xl border-zinc-800 space-y-2">
            <span className="text-[9px] bg-green-500/10 text-green-300 border border-green-500/20 font-mono px-2 py-0.5 rounded uppercase font-bold">
              MAQUEAMENTO DE ATIVOS FÍSICOS
            </span>
            <h2 className="text-lg font-bold font-display text-white">Localização Real das Unidades Firjan</h2>
            <p className="text-xs text-zinc-400">Encontre o endereço exato, contatos, horários e serviços oferecidos em cada filial regional Firjan no Rio de Janeiro.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Units list explorer */}
            <div className="glass-panel p-4 rounded-xl border-zinc-800 space-y-4 md:col-span-1">
              {/* Search and Filters */}
              <div className="space-y-2.5">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                    id="input_search_unit"
                    type="text"
                    placeholder="Buscar unidade..."
                    value={searchUnitQuery}
                    onChange={(e) => setSearchUnitQuery(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg pl-8.5 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-650 focus:outline-none focus:border-green-500"
                  />
                </div>

                <div className="flex gap-1.5">
                  {(['all', 'SENAI', 'SESI', 'Sede'] as const).map(type => (
                    <button
                      key={type}
                      id={`btn_filter_unit_${type}`}
                      onClick={() => setFilterUnitType(type)}
                      className={`flex-1 py-1 rounded text-[10px] font-semibold uppercase font-mono transition-all border ${
                        filterUnitType === type 
                          ? 'bg-green-500/10 text-green-300 border-green-500/30' 
                          : 'bg-zinc-950 text-zinc-500 border-zinc-900 hover:text-zinc-300'
                      }`}
                    >
                      {type === 'all' ? 'Ver Todos' : type}
                    </button>
                  ))}
                </div>
              </div>

              {/* List cards scroll container */}
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {filteredUnits.length > 0 ? (
                  filteredUnits.map((u) => (
                    <div
                      key={u.id}
                      id={`card_unit_select_${u.id}`}
                      onClick={() => setSelectedUnitId(u.id)}
                      className={`p-3 rounded-lg border text-left cursor-pointer transition-all space-y-1 block ${
                        selectedUnitId === u.id 
                          ? 'bg-green-950/15 border-green-500/40 shadow-md' 
                          : 'bg-zinc-900/30 border-zinc-850 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] bg-zinc-950 text-zinc-400 border border-zinc-800 px-1.5 py-0.5 rounded font-mono font-bold uppercase shrink-0">
                          {u.type}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">RJ</span>
                      </div>
                      <h4 className="text-xs font-bold text-white truncate">{u.name}</h4>
                      <p className="text-[10px] text-zinc-400 line-clamp-1">{u.address}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-xs text-zinc-600 font-mono py-10">Nenhuma unidade corresponde à busca.</p>
                )}
              </div>
            </div>

            {/* Google map iframe and Active unit specs detail info panel */}
            <div className="md:col-span-2 glass-panel p-5 rounded-xl border-zinc-800 space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-900 pb-3 gap-2">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-zinc-500 font-mono tracking-wider uppercase font-semibold">UNIDADE SELECIONADA</span>
                  <h3 className="text-sm font-bold text-green-300 font-display uppercase">{activeUnit.name}</h3>
                </div>

                <div className="text-[10px] font-mono text-zinc-500 flex gap-2">
                  <span>📞 {activeUnit.phone}</span>
                  <span>⏱️ {activeUnit.workingHours}</span>
                </div>
              </div>

              {/* Embedded Real Interactive Map frame */}
              <div className="w-full h-80 rounded-xl bg-zinc-950 border border-zinc-900 overflow-hidden relative shadow-inner">
                {/* Embedded dynamic local address mapper via Google Maps Platform simulator embed search */}
                <iframe
                  id="firjan_embedded_google_map"
                  title={`Localização Real - ${activeUnit.name}`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(activeUnit.name + ', ' + activeUnit.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="sm:col-span-2 space-y-1.5">
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase block">Atuação Estratégica</span>
                  <p className="text-zinc-300 text-xs leading-relaxed">{activeUnit.description}</p>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase block">Serviços da Unidade</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeUnit.services.map((srv, i) => (
                      <span key={i} className="bg-zinc-950 text-zinc-400 border border-zinc-900 px-2 py-0.5 text-[9px] rounded font-medium">
                        ✓ {srv}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Map guides prompt */}
              <div className="p-3 bg-zinc-950/80 rounded-lg border border-zinc-900 flex items-center justify-between text-xs text-zinc-500">
                <span className="flex items-center gap-1.5"><MapPin className="text-green-500 w-4 h-4 shrink-0" /> Local real georreferenciado verificado.</span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeUnit.name + ' ' + activeUnit.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-[11px] font-semibold"
                >
                  Abrir no Google Maps <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* --- COMPREHENSIVE DIRECTORY TABLE OF ALL 32+ FIRJAN UNITS --- */}
          <div className="glass-panel p-5 rounded-2xl border-zinc-800 space-y-4 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900/80 pb-4">
              <div className="space-y-1">
                <span className="text-[9px] bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono px-2 py-0.5 rounded uppercase font-bold tracking-widest inline-block">
                  GUIA REGIONAL INTEGRADO
                </span>
                <h3 className="text-sm font-bold font-display text-white uppercase tracking-wider flex items-center gap-2 mt-1">
                  <Building2 className="w-4 h-4 text-purple-400" /> Diretório Completo de Unidades (Sesi & Senai RJ)
                </h3>
                <p className="text-[11px] text-zinc-400">Consulte ou localize qualquer uma das {firjanUnits.length} filiais operacionais do estado do Rio de Janeiro.</p>
              </div>

              {/* Search Inside Table */}
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                <input
                  id="input_table_search"
                  type="text"
                  placeholder="Pesquisar por nome, cidade ou rua..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900/80 rounded-lg pl-8.5 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 font-sans"
                />
              </div>
            </div>

            {/* Region Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 pb-1">
              {[
                { id: 'all', name: 'Todas as Regiões' },
                { id: 'Metropolitana', name: 'Região Metropolitana' },
                { id: 'Baixada', name: 'Baixada Fluminense' },
                { id: 'Sul', name: 'Sul Fluminense' },
                { id: 'Serrana', name: 'Região Serrana' },
                { id: 'Norte', name: 'Norte Fluminense' },
                { id: 'Noroeste', name: 'Noroeste, Centro-Sul & Lagos' }
              ].map(reg => (
                <button
                  id={`btn_reg_tab_${reg.id}`}
                  key={reg.id}
                  onClick={() => setTableRegion(reg.id)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                    tableRegion === reg.id
                      ? 'bg-purple-600/20 text-purple-300 border-purple-500/40 shadow-sm'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-900/80 hover:text-white hover:bg-zinc-900/40'
                  }`}
                >
                  {reg.name}
                </button>
              ))}
            </div>

            {/* Scrollable responsive table view */}
            <div className="overflow-x-auto rounded-xl border border-zinc-900 bg-zinc-950/40 max-h-[400px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-950 border-b border-zinc-900 text-zinc-400 font-mono text-[9px] uppercase font-bold tracking-wider">
                    <th className="p-3">Unidade</th>
                    <th className="p-3">Tipo</th>
                    <th className="p-3">Região</th>
                    <th className="p-3">Endereço Completo</th>
                    <th className="p-3 text-center">Contato & Horários</th>
                    <th className="p-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60 text-zinc-200">
                  {firjanUnits
                    .map(unit => ({ ...unit, region: getUnitRegion(unit.name, unit.address) }))
                    .filter(unit => {
                      const matchesSearch = 
                        unit.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
                        unit.address.toLowerCase().includes(tableSearch.toLowerCase()) ||
                        unit.description.toLowerCase().includes(tableSearch.toLowerCase()) ||
                        unit.id.toLowerCase().includes(tableSearch.toLowerCase());
                      
                      let matchesRegion = true;
                      if (tableRegion !== 'all') {
                        if (tableRegion === 'Metropolitana') matchesRegion = unit.region.includes('Metropolitana');
                        else if (tableRegion === 'Baixada') matchesRegion = unit.region.includes('Baixada');
                        else if (tableRegion === 'Sul') matchesRegion = unit.region.includes('Sul');
                        else if (tableRegion === 'Serrana') matchesRegion = unit.region.includes('Serrana');
                        else if (tableRegion === 'Norte') matchesRegion = unit.region.includes('Norte');
                        else if (tableRegion === 'Noroeste') matchesRegion = unit.region.includes('Noroeste') || unit.region.includes('Centro-Sul') || unit.region.includes('Lagos');
                      }
                      return matchesSearch && matchesRegion;
                    })
                    .map(unit => {
                      const isSelected = selectedUnitId === unit.id;
                      return (
                        <tr 
                          key={unit.id} 
                          className={`hover:bg-zinc-900/40 transition-colors ${
                            isSelected ? 'bg-purple-650/10 font-medium' : ''
                          }`}
                        >
                          <td className="p-3">
                            <span className="font-extrabold text-white text-xs block leading-tight">{unit.name}</span>
                            <span className="text-[10px] text-zinc-500 block mt-0.5 max-w-[200px] truncate" title={unit.description}>{unit.description}</span>
                          </td>
                          <td className="p-3">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase inline-block ${
                              unit.type === 'Sede' 
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' 
                                : unit.type.includes('SESI') && unit.type.includes('SENAI')
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/25'
                                : unit.type.includes('SENAI')
                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/25'
                                : 'bg-pink-500/10 text-pink-400 border border-pink-500/25'
                            }`}>
                              {unit.type}
                            </span>
                          </td>
                          <td className="p-3 text-zinc-400 text-[11px] font-mono whitespace-nowrap">{unit.region}</td>
                          <td className="p-3 text-zinc-300 max-w-[220px] truncate text-[11px]" title={unit.address}>{unit.address}</td>
                          <td className="p-3">
                            <div className="text-[10px] text-zinc-400 space-y-0.5 leading-none">
                              <div className="flex items-center gap-1"><span className="text-zinc-600 font-bold font-mono">TEL:</span> <span className="font-mono text-zinc-300 select-all">{unit.phone}</span></div>
                              <div className="flex items-center gap-1 text-[9.5px] mt-0.5 text-zinc-500"><span className="text-zinc-600 font-bold font-mono">HOR:</span> <span>{unit.workingHours}</span></div>
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              id={`btn_locate_table_${unit.id}`}
                              onClick={() => {
                                setSelectedUnitId(unit.id);
                                document.getElementById('firjan_embedded_google_map')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              }}
                              className={`px-2 md:px-2.5 py-1 text-[10px] font-black rounded-lg uppercase cursor-pointer border transition-all flex items-center gap-1 ml-auto ${
                                isSelected
                                  ? 'bg-green-500/15 text-green-300 border-green-500/35'
                                  : 'bg-zinc-900 border-zinc-800 text-purple-400 hover:text-white hover:bg-zinc-800'
                              }`}
                            >
                              <MapPin className="w-3 h-3" /> {isSelected ? 'Inspecionada' : 'Localizar'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- DASHBOARD TAB 3: GAMIFICATION POINTS PROGRAM & PRIZE REDEMPTION --- */}
      {dashboardTab === 'rewards' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Rewards program visual overview card */}
          <div className="relative overflow-hidden p-6 rounded-2xl border-yellow-500/20 glass-panel flex flex-col md:flex-row justify-between items-start md:items-center gap-5 text-left bg-gradient-to-tr from-zinc-950 to-zinc-900/60">
            <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl -z-10" />
            
            <div className="space-y-1.5 flex-1">
              <span className="text-[9px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 font-mono px-2 py-0.5 rounded uppercase font-bold tracking-widest inline-block mb-1">
                LOJA DE PRÊMIOS FIRJAN
              </span>
              <h2 className="text-xl font-bold font-display text-white">Programa de Reconhecimento & Pontos</h2>
              <p className="text-xs text-zinc-400 max-w-xl">
                Suas contribuições corporativas valem brindes exclusivos, camisas corta-vento, mochilas e cursos oficiais! Cadastre boas ideias ou realize a trilha de onboarding para acumular pontos.
              </p>
            </div>

            {/* Big prominent points wallet */}
            <div className="p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 text-center space-y-1 min-w-44 shrink-0">
              <span className="text-[9px] text-yellow-500 font-mono uppercase tracking-widest font-semibold block">Seu Saldo Atual</span>
              <strong className="text-2xl font-bold font-mono text-yellow-400 block">{currentUser.points} pts</strong>
              <div className="flex justify-center flex-wrap gap-1">
                {currentUser.badges?.slice(0, 1).map((b, i) => (
                  <span key={i} className="text-[9px] bg-black/40 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/10 font-mono font-medium">
                    🏅 Rank: {b}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Primary Rewards Grid list */}
            <div className="md:col-span-2 space-y-4 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-yellow-400" /> Brindes e Recompensas Disponíveis
                </h3>
                <span className="text-[10px] text-zinc-500 font-mono">Dedução direta de pontos ao confirmar resgate</span>
              </div>

              {redeemErrorMessage && (
                <div id="rewards_error_box" className="p-3 bg-red-950/20 text-red-400 border border-red-500/25 rounded-xl text-xs animate-in fade-in">
                  ❌ {redeemErrorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {REWARDS.map((reward) => {
                  const hasPoints = currentUser.points >= reward.points;
                  const percentProgress = Math.min(Math.round((currentUser.points / reward.points) * 100), 100);
                  
                  return (
                    <div key={reward.id} className="p-4 rounded-xl border border-zinc-850 bg-zinc-950/40 space-y-3.5 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] bg-zinc-900 text-zinc-500 border border-zinc-800 px-1.5 py-0.5 rounded font-mono font-semibold uppercase">
                            {reward.category}
                          </span>
                          <span className="text-xl select-none">{reward.icon}</span>
                        </div>
                        <h4 className="text-xs font-bold text-white leading-snug">{reward.name}</h4>
                        <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2">{reward.desc}</p>
                      </div>

                      <div className="space-y-3 pt-1">
                        {/* Progress slider if not enough points */}
                        {!hasPoints && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                              <span>Progresso para resgate:</span>
                              <span>{currentUser.points} / {reward.points} {reward.points === 1000 ? 'pts' : 'pts'} ({percentProgress}%)</span>
                            </div>
                            <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-500/40 rounded-full" style={{ width: `${percentProgress}%` }} />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2.5">
                          <span className="text-xs font-mono font-bold text-yellow-400 shrink-0">
                            💰 {reward.points} pts
                          </span>

                          <button
                            id={`btn_redeem_prize_${reward.id}`}
                            onClick={() => handleRedeemItemClick(reward.id, reward.points, reward.name)}
                            disabled={!hasPoints || isRedeeming}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold select-none flex-1 transition-all ${
                              hasPoints 
                                ? 'bg-yellow-500 hover:bg-yellow-450 text-black border-transparent shadow-lg shadow-yellow-500/5' 
                                : 'bg-zinc-900 border border-zinc-850 text-zinc-550 cursor-not-allowed'
                            }`}
                          >
                            {isRedeeming ? 'Resgatando...' : hasPoints ? 'Resgatar' : 'Faltam Pontos'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Redeemed vouchers list and Rules policy */}
            <div className="space-y-5 text-left md:col-span-1">
              {/* How to accumulate points instruction box */}
              <div className="glass-panel p-4 rounded-xl border-zinc-800 bg-zinc-950/20 space-y-3">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Como Ganhar Pontos?</span>
                
                <div className="space-y-2.5 text-[11px] leading-snug">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center justify-center text-[9px] font-bold text-purple-300">
                      +50
                    </span>
                    <span className="text-zinc-400">Cada tarefa concluída do Onboarding</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-green-550/10 border border-green-500/20 rounded-full flex items-center justify-center text-[9px] font-bold text-green-300">
                      +45
                    </span>
                    <span className="text-zinc-400">Enviar nova ideia para aprovação</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-cyan-550/10 border border-cyan-500/20 rounded-full flex items-center justify-center text-[9px] font-bold text-cyan-300">
                      +10
                    </span>
                    <span className="text-zinc-400">Curtir ou apoiar ideias de colegas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center justify-center text-[9px] font-bold text-yellow-400">
                      +15
                    </span>
                    <span className="text-zinc-400">Registrar artigo útil na Wiki Firjan</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-900 border-dashed text-[10px] text-zinc-500 leading-normal">
                  💡 Os resgates geram cupons de autenticidade instantânea que devem ser apresentados na secretaria técnica administrativa da sua unidade para retirada física do brinde.
                </div>
              </div>

              {/* History of redeemed vouchers */}
              <div className="glass-panel p-4 rounded-xl border-zinc-800 space-y-3.5">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest block font-mono">Meus Cupons ({redeemHistory.length})</span>

                {redeemHistory.length > 0 ? (
                  <div className="space-y-2.5 max-h-48 overflow-y-auto">
                    {redeemHistory.map((item) => (
                      <div key={item.id} className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-900 text-[10px] space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-white font-semibold truncate max-w-28">{item.name}</span>
                          <span className="text-yellow-400 font-bold font-mono">-{item.points} pts</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-zinc-500">{item.date}</span>
                          <strong className="text-green-400 uppercase font-mono tracking-wider">{item.voucher}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-zinc-950/40 text-center rounded-lg border border-zinc-900 border-dashed">
                    <p className="text-[11px] text-zinc-650 leading-normal py-1">Você não efetuou resgates nesta sessão. Comece a colaborar e garanta sua caneca Firjan!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- DASHBOARD TAB 4: SIMULATED COLLABORATORS & RANKINGS --- */}
      {dashboardTab === 'colaboradores' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Main heading banner */}
          <div className="relative overflow-hidden p-6 rounded-2xl border-cyan-500/20 glass-panel flex flex-col md:flex-row justify-between items-start md:items-center gap-5 text-left bg-gradient-to-tr from-zinc-950 to-zinc-900/60">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl -z-10" />
            
            <div className="space-y-1.5 flex-1">
              <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono px-2 py-0.5 rounded uppercase font-bold tracking-widest inline-block mb-1">
                PAINEL DEMONSTRATIVO DE COLABORADORES
              </span>
              <h2 className="text-xl font-bold font-display text-white">Ecossistema de Integração & Simulação de Liderança</h2>
              <p className="text-xs text-zinc-400 max-w-2xl">
                Espaço de visualização e controle dos perfis cadastrados. Explore o engajamento de cada regional Firjan (SESI/SENAI/IEL), consulte as respectivas contribuições e realize a simulação de login para interagir na pele de qualquer colega com suas devidas licenças e pontuações de gamificação.
              </p>
            </div>

            {/* General metrics */}
            <div className="grid grid-cols-2 gap-2 shrink-0 w-full md:w-auto font-sans">
              <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-850 text-center">
                <span className="text-[8px] text-zinc-500 font-mono uppercase block">Total Ativos</span>
                <strong className="text-lg font-mono text-cyan-400 block">{users.length}</strong>
              </div>
              <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-850 text-center">
                <span className="text-[8px] text-zinc-500 font-mono uppercase block">Média Geral</span>
                <strong className="text-lg font-mono text-purple-400 block font-bold">
                  {users.length ? Math.round(users.reduce((acc, u) => acc + u.points, 0) / users.length) : 0} pts
                </strong>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* COLUMN 1: VISUAL PODIUM (Trophy Rank) & GAMIFICATION HIGHLIGHTS */}
            <div className="space-y-6 md:col-span-1 text-left">
              <div className="glass-panel p-5 rounded-2xl border-zinc-850 space-y-4">
                <div className="space-y-1 border-b border-zinc-900 pb-2.5">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-yellow-400" /> Pódio de Liderança
                  </h3>
                  <p className="text-[10px] text-zinc-500">Colaboradores com maior índice de pontos de inovação</p>
                </div>

                {/* Pedestal visual representation of Top 3 */}
                <div className="pt-4 flex items-end justify-center gap-3 h-48 select-none">
                  {/* 2º lugar */}
                  {topCollaborators[1] && (
                    <div className="flex flex-col items-center flex-1 max-w-[100px]">
                      <div 
                        className="relative group cursor-pointer" 
                        onClick={() => setSelectedColabId(topCollaborators[1].id)}
                        title="Ver ficha técnica"
                      >
                        <img 
                          src={topCollaborators[1].avatar} 
                          alt={topCollaborators[1].name} 
                          className="w-11 h-11 rounded-full border-2 border-zinc-400 object-cover hover:scale-105 duration-150 shadow-[0_0_12px_rgba(161,161,170,0.2)]" 
                        />
                        <span className="absolute -top-1 right-0 w-4 h-4 bg-zinc-400 text-[9px] font-extrabold text-black rounded-full flex items-center justify-center border border-zinc-950">
                          2
                        </span>
                      </div>
                      <span className="text-[9px] text-zinc-330 font-bold block mt-1.5 truncate max-w-[80px] text-center">{topCollaborators[1].name.split(' ')[0]}</span>
                      <span className="text-[8px] text-zinc-500 font-mono text-center leading-none mt-0.5">{topCollaborators[1].points} pts</span>
                      {/* Pedestal platform */}
                      <div className="w-full bg-zinc-800/20 border border-zinc-700/20 rounded-t-lg h-12 mt-2 flex items-center justify-center shadow-lg">
                        <span className="text-zinc-400 text-[10px] font-bold">🥈 Prata</span>
                      </div>
                    </div>
                  )}

                  {/* 1º lugar */}
                  {topCollaborators[0] && (
                    <div className="flex flex-col items-center flex-1 max-w-[110px]">
                      <div 
                        className="relative group cursor-pointer -top-2" 
                        onClick={() => setSelectedColabId(topCollaborators[0].id)}
                        title="Ver ficha técnica"
                      >
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-lg text-yellow-400 animate-bounce">👑</div>
                        <img 
                          src={topCollaborators[0].avatar} 
                          alt={topCollaborators[0].name} 
                          className="w-14 h-14 rounded-full border-2 border-yellow-500 object-cover ring-2 ring-yellow-500/10 hover:scale-105 duration-150 shadow-[0_0_15px_rgba(234,179,8,0.2)]" 
                        />
                        <span className="absolute -top-1 right-0 w-4.5 h-4.5 bg-yellow-500 text-[10px] font-extrabold text-black rounded-full flex items-center justify-center border border-zinc-950">
                          1
                        </span>
                      </div>
                      <span className="text-[10px] text-white font-extrabold block mt-0.5 truncate max-w-[90px] text-center">{topCollaborators[0].name.split(' ')[0]}</span>
                      <span className="text-[9px] text-yellow-400 font-mono font-bold text-center leading-none mt-0.5">{topCollaborators[0].points} pts</span>
                      {/* Pedestal platform */}
                      <div className="w-full bg-yellow-500/5 border border-yellow-500/15 rounded-t-lg h-20 mt-2 flex items-center justify-center shadow-lg relative">
                        <span className="text-yellow-550 text-[11px] font-bold tracking-wide text-yellow-500">🏆 Ouro</span>
                      </div>
                    </div>
                  )}

                  {/* 3º lugar */}
                  {topCollaborators[2] && (
                    <div className="flex flex-col items-center flex-1 max-w-[100px]">
                      <div 
                        className="relative group cursor-pointer" 
                        onClick={() => setSelectedColabId(topCollaborators[2].id)}
                        title="Ver ficha técnica"
                      >
                        <img 
                          src={topCollaborators[2].avatar} 
                          alt={topCollaborators[2].name} 
                          className="w-10 h-10 rounded-full border-2 border-amber-600/60 object-cover hover:scale-105 duration-150 shadow-[0_0_12px_rgba(217,119,6,0.15)]" 
                        />
                        <span className="absolute -top-1 right-0 w-4 h-4 bg-amber-700 text-[9px] font-extrabold text-white rounded-full flex items-center justify-center border border-zinc-950">
                          3
                        </span>
                      </div>
                      <span className="text-[9px] text-zinc-330 font-bold block mt-1.5 truncate max-w-[80px] text-center">{topCollaborators[2].name.split(' ')[0]}</span>
                      <span className="text-[8px] text-zinc-500 font-mono text-center leading-none mt-0.5">{topCollaborators[2].points} pts</span>
                      {/* Pedestal platform */}
                      <div className="w-full bg-orange-950/10 border border-orange-900/15 rounded-t-lg h-9 mt-2 flex items-center justify-center shadow-lg">
                        <span className="text-amber-600 text-[10px] font-bold">🥉 Bronze</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sub ranking items table (from 4º place downwards) */}
                <div className="space-y-2 pt-3 border-t border-zinc-900">
                  <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest font-semibold block">Outros Integrantes</span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {topCollaborators.slice(3).map((u, i) => (
                      <div 
                        key={u.id} 
                        onClick={() => setSelectedColabId(u.id)}
                        className={`flex items-center justify-between p-2 rounded-lg bg-zinc-950/40 hover:bg-zinc-900/60 border cursor-pointer hover:border-zinc-800 transition-all ${
                          selectedColabId === u.id ? 'bg-zinc-900 border-purple-500/20' : 'border-zinc-900/70'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="text-[10px] font-mono text-zinc-500 font-bold w-4">{i + 4}º</span>
                          <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover border border-zinc-800/80 pointer-events-none" />
                          <span className="text-xs text-zinc-300 truncate font-semibold">{u.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400 font-semibold shrink-0">{u.points} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 2 & 3: EXHAUSTIVE DIRECTORY OF COLLABORATORS */}
            <div className="md:col-span-2 space-y-6 text-left">
              <div className="glass-panel p-5 rounded-2xl border-zinc-850 space-y-4">
                
                {/* Search / Filters for list */}
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center font-sans">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-cyan-400" /> Diretório Corporativo de Colaboradores
                    </h3>
                    <p className="text-[10px] text-zinc-500">Membros ativos do ecossistema Firjan Connect</p>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500 animate-pulse" />
                    <input
                      id="input_search_colab"
                      type="text"
                      placeholder="Pesquise por nome, e-mail ou matrícula..."
                      value={searchColabQuery}
                      onChange={(e) => setSearchColabQuery(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:border-cyan-500 font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[500px] overflow-y-auto pr-1 font-sans">
                  {filteredColabs.map((colab) => {
                    const isSelf = colab.id === currentUser.id;
                    const isSelected = selectedColabId === colab.id;
                    return (
                      <div 
                        key={colab.id}
                        onClick={() => setSelectedColabId(colab.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all space-y-3 relative group overflow-hidden cursor-pointer ${
                          isSelected 
                            ? 'bg-purple-950/5 border-purple-500/45 shadow-md ring-1 ring-purple-500/10' 
                            : 'bg-zinc-950/40 border-zinc-900/80 hover:border-zinc-800'
                        }`}
                      >
                        {isSelf && (
                          <span className="absolute top-2 right-2 text-[8px] bg-purple-900/40 text-purple-300 px-1.5 py-0.5 rounded uppercase tracking-widest font-extrabold border border-purple-500/20">
                            VOCÊ
                          </span>
                        )}

                        <div className="flex items-center gap-2.5">
                          <img 
                            src={colab.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
                            alt={colab.name} 
                            className="w-9 h-9 rounded-full border border-zinc-800 object-cover shrink-0 pointer-events-none" 
                          />
                          <div className="overflow-hidden">
                            <h4 className="text-xs font-bold text-white truncate block leading-tight">{colab.name}</h4>
                            <span className="text-[10px] text-zinc-500 font-mono truncate block leading-none mt-0.5">{colab.email}</span>
                            <span className="text-[8px] text-cyan-300 font-mono block uppercase font-bold mt-1 tracking-wider">{colab.role}</span>
                          </div>
                        </div>

                        {/* Metrics specs tags */}
                        <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-zinc-900/80 text-[10px] font-sans">
                          <div>
                            <span className="text-[9px] text-zinc-500 block uppercase font-mono">Unidade / Setor</span>
                            <strong className="text-zinc-355 block truncate leading-tight mt-0.5 text-zinc-300">{colab.unidade || 'Sede Botafogo'}</strong>
                            <span className="text-[9px] text-zinc-400 block font-semibold">{colab.setor || 'Corporativo'}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-zinc-500 block uppercase font-mono">Pontos de Inovação</span>
                            <strong className="text-green-400 block font-mono font-bold text-xs mt-0.5">{colab.points} pts</strong>
                            <span className="text-[9px] text-purple-300 block font-semibold truncate">{(colab.badges && colab.badges[0]) || 'Colaborador'}</span>
                          </div>
                        </div>

                        {/* Interactive Dossier card button */}
                        <div className="flex gap-2 pt-1 font-sans">
                          <button
                            id={`btn_view_dossier_${colab.id}`}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedColabId(colab.id);
                            }}
                            className="flex-1 py-1 px-2.5 rounded bg-zinc-900 hover:bg-zinc-850 text-zinc-350 hover:text-white border border-zinc-800 transition-all font-semibold text-[10px] cursor-pointer"
                          >
                            Ver Ficha Técnica
                          </button>

                          {onSimulateUser && !isSelf && (
                            <button
                              id={`btn_simulate_colab_switch_${colab.id}`}
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (window.confirm(`Gostaria de simular sessão e navegar no sistema como ${colab.name}?`)) {
                                  await onSimulateUser(colab.id);
                                }
                              }}
                              className="py-1 px-2.5 rounded bg-purple-900/25 hover:bg-purple-900/40 text-purple-300 hover:text-white border border-purple-500/25 transition-all font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                              title="Substituir sessão logada pela identidade deste colaborador simulado"
                            >
                              <Sparkles className="w-3 h-3 text-purple-400" /> Simular
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {filteredColabs.length === 0 && (
                    <div className="col-span-2 text-center py-10 font-mono text-zinc-500 text-xs text-center border border-zinc-900/50 rounded-xl">
                      Nenhum colaborador corresponde à pesquisa.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* DETAILED ACTIVE DOSSIER DRAWER PANEL (For selected collaborator) */}
          {activeColab && (
            <div className="glass-panel p-5 rounded-2xl border-purple-500/20 bg-zinc-950/60 text-left space-y-4 animate-in slide-in-from-bottom duration-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-900 pb-3 gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-0.5 rounded-full border border-purple-500/40">
                    <img 
                      src={activeColab.avatar} 
                      alt={activeColab.name} 
                      className="w-11 h-11 rounded-full object-cover border border-zinc-900"
                    />
                  </div>
                  <div>
                    <span className="text-[8px] bg-purple-900/35 text-purple-300 px-2 py-0.5 rounded uppercase font-mono tracking-widest font-bold">
                      Ficha de Atuação Corporativa • {activeColab.role}
                    </span>
                    <h3 className="text-sm font-bold text-white font-display mt-0.5 flex flex-wrap items-center gap-2">
                      {activeColab.name} 
                      <span className="text-[10px] text-zinc-550 font-mono font-medium">({activeColab.email})</span>
                    </h3>
                  </div>
                </div>

                <div className="flex gap-2 font-sans w-full sm:w-auto overflow-hidden">
                  {onSimulateUser && activeColab.id !== currentUser.id && (
                    <button
                      id={`btn_simulate_colab_dossier_switch_${activeColab.id}`}
                      type="button"
                      onClick={async () => {
                        if (window.confirm(`Confirmar simulação de sessão sob identidade de ${activeColab.name}? Isso substituirá o login corrente.`)) {
                          await onSimulateUser(activeColab.id);
                        }
                      }}
                      className="flex-1 sm:flex-initial py-1.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/10 cursor-pointer whitespace-nowrap min-w-0"
                    >
                      <Sparkles className="w-3.5 h-3.5 shrink-0" /> Entrar como {activeColab.name.split(' ')[0]}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedColabId('')}
                    className="py-1.5 px-4 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all text-xs font-bold cursor-pointer"
                  >
                    Fechar Ficha
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-sans">
                
                {/* 1. Cadastral filled-out specifications */}
                <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl space-y-3.5 text-left">
                  <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest font-bold block border-b border-zinc-900 pb-1.5">Dados Cadastrais Preenchidos</span>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 font-sans">
                      <div>
                        <span className="text-zinc-500 block text-[8px] uppercase font-mono">Registro (Matrícula)</span>
                        <strong className="text-zinc-300 font-mono text-[11px]">{activeColab.matricula || '0192837'}</strong>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[8px] uppercase font-mono font-mono">Segmento / Setor</span>
                        <strong className="text-zinc-300 text-[11px]">{activeColab.setor || 'SENAI (Educação)'}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 font-sans">
                      <div>
                        <span className="text-zinc-500 block text-[8px] uppercase font-mono font-mono">Cidade</span>
                        <strong className="text-zinc-300 text-[11px]">{activeColab.cidade || 'Rio de Janeiro'}</strong>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[8px] uppercase font-mono font-mono">UF de Lotação</span>
                        <strong className="text-zinc-300 text-[11px]">{activeColab.estado || 'RJ'}</strong>
                      </div>
                    </div>

                    <div>
                      <span className="text-zinc-500 block text-[8px] uppercase font-mono">Unidade Executiva Firjan</span>
                      <strong className="text-green-400 font-bold block truncate text-xs mt-0.5">
                        🏢 {activeColab.unidade || 'Unidade Sede Botafogo'}
                      </strong>
                    </div>

                    <div className="pt-2 border-t border-zinc-910 border-zinc-900/60 font-sans">
                      <span className="text-zinc-500 block text-[8px] uppercase font-mono">Resgate em Loja</span>
                      <strong className="text-yellow-400 block font-mono text-sm font-bold mt-0.5">💰 {activeColab.points} pontos de fomento</strong>
                    </div>
                  </div>
                </div>

                {/* 2. List of completed ideas submittals */}
                <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl space-y-3 text-left md:col-span-1">
                  <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest font-bold block border-b border-zinc-900 pb-1.5">
                    Ideias e Contribuições ({colabIdeas.length})
                  </span>

                  {colabIdeas.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {colabIdeas.map((idea) => (
                        <div key={idea.id} className="p-2.5 bg-zinc-900 rounded-lg border border-zinc-850 space-y-1 block">
                          <div className="flex justify-between items-start gap-1">
                            <strong className="text-zinc-200 font-semibold text-[11px] truncate leading-tight max-w-[150px]" title={idea.title}>
                              {idea.title}
                            </strong>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-mono shrink-0 ${
                              idea.status === 'Aprovado' || idea.status === 'Finalizado' ? 'bg-green-950/40 text-green-300 border border-green-500/20' :
                              idea.status === 'Em implementação' ? 'bg-blue-950/40 text-blue-300 border border-blue-500/20' :
                              idea.status === 'Em análise' ? 'bg-purple-950/40 text-purple-300 border border-purple-500/20' :
                              'bg-zinc-900 text-zinc-400 border border-zinc-800'
                            }`}>
                              {idea.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-450 line-clamp-2 leading-tight text-zinc-400">{idea.description}</p>
                          <div className="flex justify-between text-[8px] text-zinc-500 pt-1 font-mono">
                            <span>❤️ {idea.likes || 0} curtidas</span>
                            <span>📅 {new Date(idea.createdAt || '').toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-zinc-600 font-mono text-xs">
                      Nenhuma ideia submetida ainda por este autor.
                    </div>
                  )}
                </div>

                {/* 3. Medalhas Conquistadas e Adicionais */}
                <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl space-y-3 text-left">
                  <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest font-bold block border-b border-zinc-900 pb-1.5">Conquistas & Medalhas</span>
                  
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-0.5">
                    {activeColab.badges && activeColab.badges.map((badge, idx) => (
                      <span 
                        key={idx} 
                        className="bg-purple-950/20 text-purple-300 border border-purple-500/15 px-2 py-0.5 text-[9px] rounded-md font-bold flex items-center gap-1 shrink-0"
                      >
                        🏅 {badge}
                      </span>
                    ))}
                    {(!activeColab.badges || activeColab.badges.length === 0) && (
                      <span className="text-zinc-650 font-mono text-[10px] block py-4 text-center w-full">Nenhuma insígnia conquistada.</span>
                    )}
                  </div>

                  <div className="bg-zinc-900/30 border border-zinc-850 p-2.5 rounded-lg text-[9px] text-zinc-500 font-mono leading-normal pt-2">
                    🔑 <strong>Status do Onboarding:</strong>
                    <div className="space-y-1 mt-1.5 font-semibold">
                      <div className="flex justify-between text-[9px] text-zinc-400 font-sans">
                        <span>Aulas de Integração:</span>
                        <span className="text-green-400">Concluído (+50pt)</span>
                      </div>
                      <div className="flex justify-between text-[9px] text-zinc-400 font-sans">
                        <span>Políticas LGPD Firjan:</span>
                        <span className="text-green-400">Homologado (+50pt)</span>
                      </div>
                      <div className="flex justify-between text-[9px] text-zinc-400 font-sans">
                        <span>Manual de Marcas SENAI:</span>
                        <span className="text-zinc-500">Pendente</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {/* Embedded Voucher modal to showcase generated credentials */}
      {activeVoucher && (
        <div id="rewards_voucher_modal" className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="relative bg-zinc-950 border-2 border-yellow-500/30 rounded-2xl p-6 md:p-8 max-w-md w-full text-center space-y-5 shadow-2x">
            <div className="absolute inset-1.5 border border-zinc-850 rounded-xl -z-10 pointer-events-none" />
            
            <div className="space-y-1.5">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto border border-yellow-500/20 text-yellow-400 text-xl font-bold animate-pulse">
                ✓
              </div>
              <h3 className="text-base font-bold font-display text-white uppercase tracking-wider pt-1">RECOMPENSA LIBERADA COM SUCESSO!</h3>
              <p className="text-xs text-zinc-400 font-sans">Seu saldo de pontos foi atualizado. Tire print ou salve o código abaixo:</p>
            </div>

            <div className="p-3.5 bg-zinc-900 rounded-xl border border-yellow-500/20 text-center space-y-1">
              <span className="text-[9px] text-zinc-500 tracking-widest font-mono uppercase font-bold block">Código do Cupom de Retirada</span>
              <strong className="text-lg font-mono text-green-400 tracking-widest block uppercase font-bold">{activeVoucher.code}</strong>
              <span className="text-[10px] text-zinc-400 font-sans block pt-1 font-semibold">{activeVoucher.name}</span>
            </div>

            <div className="text-[11px] text-zinc-500 font-sans leading-relaxed text-left bg-zinc-950 p-3 rounded-lg border border-zinc-900 space-y-1">
              <p>📍 <strong>Onde Retirar:</strong> Dirija-se à sala de Recursos Humanos ou Secretaria Escolar de sua Unidade (no seu caso: <strong>{currentUser.unidade || 'Botafogo Sede'}</strong>).</p>
              <p>🔑 <strong>Apresentação:</strong> Forneça este código e seu número de matrícula (<strong>{currentUser.matricula || '0000000'}</strong>) ao agente para liberação imediata do pacote.</p>
            </div>

            <button
              id="btn_close_voucher_modal"
              onClick={() => setActiveVoucher(null)}
              className="w-full bg-yellow-500 hover:bg-yellow-450 text-black py-2 rounded-xl text-xs font-semibold shadow-md transition-all select-none"
            >
              Concluir e Voltar para a Vitrine
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
