// Data helpers for Brazilian States, Cities and FIRJAN Units.
// This separates large static datasets from the view code to keep it clean and performant.

export interface StateInfo {
  uf: string;
  name: string;
  cities: string[];
}

export const ESTADOS: StateInfo[] = [
  {
    uf: 'RJ',
    name: 'Rio de Janeiro',
    cities: [
      'Rio de Janeiro', 'Angra dos Reis', 'Aperibé', 'Araruama', 'Areal', 'Armação dos Búzios', 
      'Arraial do Cabo', 'Barra do Piraí', 'Barra Mansa', 'Belford Roxo', 'Bom Jardim', 
      'Bom Jesus do Itabapoana', 'Cabo Frio', 'Cachoeiras de Macacu', 'Cambuci', 
      'Campos dos Goytacazes', 'Cantagalo', 'Carapebus', 'Cardoso Moreira', 'Carmo', 
      'Casimiro de Abreu', 'Comendador Levy Gasparian', 'Conceição de Macabu', 'Cordeiro', 
      'Duas Barras', 'Duque de Caxias', 'Engenheiro Paulo de Frontin', 'Guapimirim', 
      'Iguaba Grande', 'Itaboraí', 'Itaguaí', 'Italva', 'Itaocara', 'Itaperuna', 'Itatiaia', 
      'Japeri', 'Laje do Muriaé', 'Macaé', 'Macuco', 'Magé', 'Mangaratiba', 'Maricá', 'Mendes', 
      'Mesquita', 'Miguel Pereira', 'Miracema', 'Natividade', 'Nilópolis', 'Niterói', 
      'Nova Friburgo', 'Nova Iguaçu', 'Paracambi', 'Paraíba do Sul', 'Paraty', 'Paty do Alferes', 
      'Petrópolis', 'Pinheiral', 'Piraí', 'Porciúncula', 'Porto Real', 'Quatis', 'Queimados', 
      'Quissamã', 'Resende', 'Rio Bonito', 'Rio das Flores', 'Rio das Ostras', 'Santa Maria Madalena', 
      'Santo Antônio de Pádua', 'São Fidélis', 'São Francisco de Itabapoana', 'São Gonçalo', 
      'São João da Barra', 'São João de Meriti', 'São José de Ubá', 'São José do Vale do Rio Preto', 
      'São Pedro da Aldeia', 'São Sebastião do Alto', 'Sapucaia', 'Saquarema', 'Seropédica', 
      'Silva Jardim', 'Sumidouro', 'Tanguá', 'Teresópolis', 'Trajano de Moraes', 'Três Rios', 
      'Valença', 'Vassouras', 'Volta Redonda'
    ]
  },
  {
    uf: 'AC',
    name: 'Acre',
    cities: ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira', 'Tarauacá', 'Feijó', 'Plácido de Castro', 'Brasiléia', 'Epitaciolândia']
  },
  {
    uf: 'AL',
    name: 'Alagoas',
    cities: ['Maceió', 'Arapiraca', 'Palmeira dos Índios', 'Rio Largo', 'Penedo', 'União dos Palmares', 'São Miguel dos Campos', 'Delmiro Gouveia']
  },
  {
    uf: 'AP',
    name: 'Amapá',
    cities: ['Macapá', 'Santana', 'Laranjal do Jari', 'Oiapoque', 'Porto Grande', 'Mazagão']
  },
  {
    uf: 'AM',
    name: 'Amazonas',
    cities: ['Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru', 'Coari', 'Tabatinga', 'Maués', 'Tefé', 'Humaitá']
  },
  {
    uf: 'BA',
    name: 'Bahia',
    cities: ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Juazeiro', 'Itabuna', 'Lauro de Freitas', 'Ilhéus', 'Jequié', 'Teixeira de Freitas', 'Alagoinhas', 'Porto Seguro', 'Barreiras']
  },
  {
    uf: 'CE',
    name: 'Ceará',
    cities: ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral', 'Crato', 'Itapipoca', 'Maranguape', 'Quixadá', 'Iguatu']
  },
  {
    uf: 'DF',
    name: 'Distrito Federal',
    cities: ['Brasília', 'Ceilândia', 'Samambaia', 'Taguatinga', 'Plano Piloto', 'Gama', 'Guará', 'Santa Maria', 'Sobradinho']
  },
  {
    uf: 'ES',
    name: 'Espírito Santo',
    cities: ['Vitória', 'Serra', 'Vila Velha', 'Cariacica', 'Cachoeiro de Itapemirim', 'Linhares', 'Colatina', 'Guarapari', 'São Mateus', 'Aracruz']
  },
  {
    uf: 'GO',
    name: 'Goiás',
    cities: ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia', 'Águas Lindas de Goiás', 'Valparaíso de Goiás', 'Trindade', 'Formosa', 'Itumbiara', 'Catalão', 'Jataí']
  },
  {
    uf: 'MA',
    name: 'Maranhão',
    cities: ['São Luís', 'Imperatriz', 'São José de Ribamar', 'Timon', 'Caxias', 'Codó', 'Paço do Lumiar', 'Açailândia', 'Bacabal']
  },
  {
    uf: 'MT',
    name: 'Mato Grosso',
    cities: ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Tangará da Serra', 'Sorriso', 'Cáceres', 'Primavera do Leste', 'Lucas do Rio Verde', 'Barra do Garças']
  },
  {
    uf: 'MS',
    name: 'Mato Grosso do Sul',
    cities: ['Campo Grande', 'Dourados', 'Três Lagoas', 'Corumbá', 'Ponta Porã', 'Sidrolândia', 'Naviraí', 'Aquidauana']
  },
  {
    uf: 'MG',
    name: 'Minas Gerais',
    cities: ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros', 'Ribeirão das Neves', 'Uberaba', 'Governador Valadares', 'Ipatinga', 'Sete Lagoas', 'Divinópolis', 'Poços de Caldas', 'Patos de Minas']
  },
  {
    uf: 'PA',
    name: 'Pará',
    cities: ['Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Parauapebas', 'Castanhal', 'Abaetetuba', 'Cametá', 'Marituba', 'Bragança']
  },
  {
    uf: 'PB',
    name: 'Paraíba',
    cities: ['João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos', 'Bayeux', 'Sousa', 'Cabedelo', 'Cajazeiras']
  },
  {
    uf: 'PR',
    name: 'Paraná',
    cities: ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'São José dos Pinhais', 'Foz do Iguaçu', 'Colombo', 'Guarapuava', 'Paranaguá', 'Toledo', 'Apucarana']
  },
  {
    uf: 'PE',
    name: 'Pernambuco',
    cities: ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina', 'Paulista', 'Cabo de Santo Agostinho', 'Camaragibe', 'Garanhuns', 'Vitória de Santo Antão']
  },
  {
    uf: 'PI',
    name: 'Piauí',
    cities: ['Teresina', 'Parnaíba', 'Picos', 'Floriano', 'Piripiri', 'Campo Maior']
  },
  {
    uf: 'RN',
    name: 'Rio Grande do Norte',
    cities: ['Natal', 'Mossoró', 'Parnamirim', 'São Gonçalo do Amarante', 'Macaíba', 'Caicó', 'Assu', 'Currais Novos']
  },
  {
    uf: 'RS',
    name: 'Rio Grande do Sul',
    cities: ['Porto Alegre', 'Caxias do Sul', 'Canoas', 'Pelotas', 'Santa Maria', 'Gravataí', 'Viamão', 'Novo Hamburgo', 'São Leopoldo', 'Rio Grande', 'Alvorada', 'Passo Fundo', 'Uruguaiana', 'Bento Gonçalves', 'Santa Cruz do Sul']
  },
  {
    uf: 'RO',
    name: 'Rondônia',
    cities: ['Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Cacoal', 'Vilhena', 'Guajará-Mirim', 'Rolim de Moura']
  },
  {
    uf: 'RR',
    name: 'Roraima',
    cities: ['Boa Vista', 'Rorainópolis', 'Caracaraí', 'Mucajaí', 'Cantá']
  },
  {
    uf: 'SC',
    name: 'Santa Catarina',
    cities: ['Florianópolis', 'Joinville', 'Blumenau', 'São José', 'Chapecó', 'Criciúma', 'Itajaí', 'Jaraguá do Sul', 'Palhoça', 'Lages', 'Balneário Camboriú', 'Brusque', 'Tubarão']
  },
  {
    uf: 'SP',
    name: 'São Paulo',
    cities: ['São Paulo', 'Guarulhos', 'Campinas', 'São Bernardo do Campo', 'Santo André', 'São José dos Campos', 'Osasco', 'Ribeirão Preto', 'Sorocaba', 'Mauá', 'São José do Rio Preto', 'Mogi das Cruzes', 'Santos', 'Diadema', 'Jundiaí', 'Piracicaba', 'Bauru', 'Itaquaquecetuba', 'Franca']
  },
  {
    uf: 'SE',
    name: 'Sergipe',
    cities: ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana', 'São Cristóvão', 'Estância', 'Tobias Barreto']
  },
  {
    uf: 'TO',
    name: 'Tocantins',
    cities: ['Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional', 'Paraíso do Tocantins', 'Colinas do Tocantins']
  }
];

export const UNIDADES_SENAI = [
  'SENAI Maracanã',
  'SENAI Vicente de Carvalho',
  'SENAI Jacarepaguá',
  'SENAI Laranjeiras',
  'SENAI Tijuca',
  'SENAI Santa Cruz',
  'SENAI Benfica',
  'SENAI Duque de Caxias',
  'SENAI Nova Iguaçu',
  'SENAI São Gonçalo',
  'SENAI Niterói',
  'SENAI Petrópolis',
  'SENAI Teresópolis',
  'SENAI Nova Friburgo',
  'SENAI Nova Friburgo (Espaço da Moda)',
  'SENAI Campos dos Goytacazes',
  'SENAI Macaé',
  'SENAI Itaperuna',
  'SENAI Resende',
  'SENAI Barra Mansa',
  'SENAI Volta Redonda',
  'SENAI Angra dos Reis',
  'SENAI Três Rios',
  'SENAI Santo Antônio de Pádua',
  'SENAI Vassouras',
  'SENAI Cabo Frio',
  'SENAI Valença',
  'SENAI Barra do Piraí',
  'Sede Firjan Botafogo',
  'IST Solda (Benfica)',
  'IST Automação e Simulação (Benfica)',
  'IST Química e Meio Ambiente (Vila Isabel)'
];

export const UNIDADES_SESI = [
  'SESI Duque de Caxias',
  'SESI Jacarepaguá',
  'SESI Santa Cruz',
  'SESI Resende',
  'SESI Volta Redonda',
  'SESI Nova Iguaçu',
  'SESI Campos dos Goytacazes',
  'SESI Macaé',
  'SESI Barra Mansa',
  'SESI São Gonçalo',
  'SESI Itaperuna',
  'SESI Cabo Frio',
  'SESI Petrópolis',
  'SESI Nova Friburgo',
  'SESI Três Rios',
  'SESI Sede Botafogo'
];

export const CARGOS_FUNCIONAIS = [
  'INSTRUTOR(A) MULTIDISCIPLINAR',
  'INSTRUTOR(A) CAD',
  'INSTRUTOR(A) DE CURSOS ESPECIAIS A',
  'INSTRUTOR(A) DE CURSOS ESPECIAIS B',
  'INSTRUTOR(A) DE EDUCAÇÃO PROFISSIONAL TÉCNICA',
  'INSTRUTOR(A) DE FORMAÇÃO INICIAL E CONTINUADA A',
  'INSTRUTOR(A) DE FORMAÇÃO INICIAL E CONTINUADA B',
  'INSTRUTOR(A) CAM/CNC/ROBÓTICA',
  'Colaborador Comum',
  'Líder/Gestor',
  'Gerente Geral',
  'Comissão Avaliadora',
  'Administrador'
];
