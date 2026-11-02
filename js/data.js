/* Dados iniciais do protótipo.
   Peças, nomes, descrições e fotos vêm das publicações do @ativaa.store (out/2026).
   Onde o post não informa algo, o campo fica vazio ou marcado como exemplo. */
window.SEED = {
  v: 1,
  settings: {
    nome: 'Ativa Store',
    instagram: 'ativaa.store',
    whatsapp: '5531990004933',
    endereco: 'R. Governador Milton Campos, 352 — Centro',
    cidade: '',
    horarios: '',
    mapa: '',
    mostrarPrecos: true,
    frase1: 'Seu melhor pré-treino é um look novo!',
    frase2: 'Para mulheres que vivem em movimento.',
    sobre: 'Loja física no Centro, com atendimento pelo WhatsApp. Venha provar as peças pessoalmente.',
    privacidade: 'Este site não usa cookies de rastreamento nem pede cadastro. Ao clicar em "Consultar no WhatsApp", você abre uma conversa direta com a loja.'
  },
  home: {
    heroTitulo1: 'Vista o seu',
    heroTitulo2: 'movimento',
    heroSub: 'Seu melhor pré-treino é um look novo.',
    heroCta: 'Explorar coleção',
    heroCta2: 'Conheça a loja',
    heroImg: 'img/shorts-verao-1.jpg',
    blocos: [
      { id: 'manifesto', nome: 'Manifesto', ativo: true },
      { id: 'categorias', nome: 'Categorias', ativo: true },
      { id: 'lancamentos', nome: 'Lançamentos', ativo: true },
      { id: 'catalogo', nome: 'Catálogo', ativo: true },
      { id: 'looks', nome: 'Looks', ativo: true },
      { id: 'colecoes', nome: 'Coleções', ativo: true },
      { id: 'loja', nome: 'A loja', ativo: true }
    ]
  },
  categorias: [
    { id: 'c1', nome: 'Conjuntos', slug: 'conjuntos', img: 'img/shorts-verao-1-sm.jpg', ativa: true },
    { id: 'c2', nome: 'Macacões', slug: 'macacoes', img: 'img/macacao-poliamida-sm.jpg', ativa: true },
    { id: 'c3', nome: 'Shorts', slug: 'shorts', img: 'img/shorts-trio-sm.jpg', ativa: true },
    { id: 'c4', nome: 'Calças', slug: 'calcas', img: 'img/spoiler-2-sm.jpg', ativa: true },
    { id: 'c5', nome: 'Regatas', slug: 'regatas', img: 'img/alerta-news-sm.jpg', ativa: true },
    { id: 'c6', nome: 'Moda praia', slug: 'moda-praia', img: 'img/lancamento-verao-sm.jpg', ativa: true }
  ],
  produtos: [
    {
      id: 'p1', nome: 'Conjunto Malibu', slug: 'conjunto-malibu', cat: 'c1',
      desc: 'Delicado e a cara do verão, a proposta é chique e elegante para o seu treino.',
      carac: 'Tecido microcanelado premium, com leve brilho',
      cores: [{ id: 'k1', nome: 'Azul', hex: '#9EC3E6' }],
      tamanhos: ['P', 'M', 'G'], preco: null, disp: 'consultar', lanc: true, dest: true,
      imgs: [{ src: 'img/conjunto-malibu.jpg', sm: 'img/conjunto-malibu-sm.jpg', alt: 'Conjunto Malibu azul usado no parque', cor: 'k1' }],
      status: 'publicado', fonte: 'post de 29/09/2026'
    },
    {
      id: 'p2', nome: 'Macacão poliamida', slug: 'macacao-poliamida', cat: 'c2',
      desc: 'Todo no poliamida, trazendo conforto e segurança para treinar com total liberdade nos movimentos! E esse decote nas costas é um charme!',
      carac: 'Poliamida · decote nas costas',
      cores: [{ id: 'k1', nome: 'Amarelo', hex: '#F2E28B' }],
      tamanhos: ['P', 'M', 'G'], preco: null, disp: 'consultar', lanc: false, dest: true,
      imgs: [
        { src: 'img/macacao-poliamida-sm.jpg', sm: 'img/macacao-poliamida-sm.jpg', alt: 'Macacão amarelo na entrada da loja', cor: 'k1' },
        { src: 'img/spoiler-1-sm.jpg', sm: 'img/spoiler-1-sm.jpg', alt: 'Macacão amarelo no manequim da loja', cor: 'k1' }
      ],
      status: 'publicado', fonte: 'reel de 07/10/2026'
    },
    {
      id: 'p3', nome: 'Conjunto top + shorts', slug: 'conjunto-top-shorts-vermelho', cat: 'c1',
      desc: 'O verão pede um shortinho.',
      carac: '',
      cores: [{ id: 'k1', nome: 'Vermelho', hex: '#B8233F' }],
      tamanhos: ['P', 'M', 'G'], preco: null, disp: 'consultar', lanc: true, dest: true,
      imgs: [
        { src: 'img/shorts-verao-1.jpg', sm: 'img/shorts-verao-1-sm.jpg', alt: 'Conjunto vermelho de top e shorts, de frente, na porta da loja', cor: 'k1' },
        { src: 'img/shorts-verao-2.jpg', sm: 'img/shorts-verao-2-sm.jpg', alt: 'Conjunto vermelho de top e shorts, de costas', cor: 'k1' }
      ],
      status: 'publicado', fonte: 'post de 19/10/2026'
    },
    {
      id: 'p4', nome: 'Shorts com viés', slug: 'shorts-com-vies', cat: 'c3',
      desc: 'Shorts soltinho com acabamento em viés contrastante e cordão na cintura. Um de cada, por favor, né?',
      carac: '',
      cores: [
        { id: 'k1', nome: 'Azul', hex: '#8FB4E8' },
        { id: 'k2', nome: 'Verde', hex: '#8DBA84' },
        { id: 'k3', nome: 'Branco', hex: '#F4F4F0' }
      ],
      tamanhos: ['P', 'M', 'G'], preco: null, disp: 'consultar', lanc: false, dest: false,
      imgs: [
        { src: 'img/shorts-trio.jpg', sm: 'img/shorts-trio-sm.jpg', alt: 'Shorts com viés nas cores verde, azul e branco', cor: 'k2' },
        { src: 'img/alerta-news-sm.jpg', sm: 'img/alerta-news-sm.jpg', alt: 'Shorts azul com regata branca na porta da loja', cor: 'k1' }
      ],
      status: 'publicado', fonte: 'post de 08/10/2026'
    },
    {
      id: 'p5', nome: 'Conjunto Atena', slug: 'conjunto-atena', cat: 'c1',
      desc: 'Leve, fresco e lindo para acompanhar seus dias de calor! Une o conforto do short duplo com a leveza do top. Perfeito para treinar, caminhar ou simplesmente curtir o dia!',
      carac: 'Short duplo',
      cores: [{ id: 'k1', nome: 'Preto', hex: '#1B1B1D' }],
      tamanhos: ['P', 'M', 'G'], preco: null, disp: 'consultar', lanc: true, dest: false,
      imgs: [{ src: 'img/conjunto-atena-sm.jpg', sm: 'img/conjunto-atena-sm.jpg', alt: 'Conjunto Atena preto em treino na academia', cor: 'k1' }],
      status: 'publicado', fonte: 'reel de 30/09/2026'
    },
    {
      id: 'p6', nome: 'Conjunto top + saia-short plissada', slug: 'conjunto-saia-plissada', cat: 'c1',
      desc: 'Top e saia-short plissada com elástico listrado na cintura.',
      carac: '',
      cores: [{ id: 'k1', nome: 'Verde-oliva', hex: '#8C9A63' }],
      tamanhos: ['P', 'M', 'G'], preco: null, disp: 'consultar', lanc: false, dest: true,
      imgs: [{ src: 'img/meme-energia.jpg', sm: 'img/meme-energia-sm.jpg', alt: 'Conjunto verde-oliva de top e saia plissada no vestiário', cor: 'k1' }],
      status: 'publicado', fonte: 'post de 06/10/2026'
    },
    {
      id: 'p7', nome: 'Conjunto cropped + shorts', slug: 'conjunto-cropped-shorts-amarelo', cat: 'c1',
      desc: 'Cropped e shorts soltinho, chegada nova na loja.',
      carac: '',
      cores: [{ id: 'k1', nome: 'Amarelo', hex: '#F2E28B' }],
      tamanhos: ['P', 'M', 'G'], preco: null, disp: 'consultar', lanc: true, dest: false,
      imgs: [{ src: 'img/spoiler-1-sm.jpg', sm: 'img/spoiler-1-sm.jpg', alt: 'Conjunto amarelo de cropped e shorts na entrada da loja', cor: 'k1' }],
      status: 'publicado', fonte: 'reel de 03/10/2026'
    },
    {
      id: 'p8', nome: 'Calça flare com brilho', slug: 'calca-flare-brilho', cat: 'c4',
      desc: 'Calça flare de cintura alta, com acabamento brilhante.',
      carac: '',
      cores: [{ id: 'k1', nome: 'Azul', hex: '#8FB4E8' }],
      tamanhos: ['P', 'M', 'G'], preco: null, disp: 'consultar', lanc: true, dest: false,
      imgs: [{ src: 'img/spoiler-2-sm.jpg', sm: 'img/spoiler-2-sm.jpg', alt: 'Calça flare azul com top na loja', cor: 'k1' }],
      status: 'publicado', fonte: 'reel de 03/10/2026'
    },
    {
      id: 'p9', nome: 'Regata', slug: 'regata-branca', cat: 'c5',
      desc: 'Regata de alcinha nadador.',
      carac: '',
      cores: [{ id: 'k1', nome: 'Branco', hex: '#F4F4F0' }],
      tamanhos: ['P', 'M', 'G'], preco: null, disp: 'consultar', lanc: false, dest: false,
      imgs: [{ src: 'img/alerta-news-sm.jpg', sm: 'img/alerta-news-sm.jpg', alt: 'Regata branca com shorts azul na porta da loja', cor: 'k1' }],
      status: 'publicado', fonte: 'reel de 08/10/2026'
    },
    {
      id: 'p10', nome: 'Biquíni + canga', slug: 'biquini-canga-amarelo', cat: 'c6',
      desc: 'Lançamento na Ativa Store. Vem, verão!',
      carac: '',
      cores: [{ id: 'k1', nome: 'Amarelo', hex: '#F2C230' }],
      tamanhos: ['P', 'M', 'G'], preco: 4990, disp: 'consultar', lanc: true, dest: false,
      imgs: [{ src: 'img/lancamento-verao-sm.jpg', sm: 'img/lancamento-verao-sm.jpg', alt: 'Biquíni amarelo com canga na praia', cor: 'k1' }],
      status: 'publicado', fonte: 'reel de 15/10/2026 (preço do post)'
    }
  ],
  looks: [
    { id: 'l1', nome: 'Energia pra treinar', slug: 'energia-pra-treinar', desc: 'Conjunto verde-oliva com saia plissada para os dias de academia.', img: 'img/meme-energia.jpg', produtos: ['p6'], status: 'publicado' },
    { id: 'l2', nome: 'Direto da porta da loja', slug: 'porta-da-loja', desc: 'Regata branca com o shorts com viés azul.', img: 'img/alerta-news-sm.jpg', produtos: ['p9', 'p4'], status: 'publicado' },
    { id: 'l3', nome: 'Malibu no parque', slug: 'malibu-no-parque', desc: 'O Conjunto Malibu para treinar ao ar livre.', img: 'img/conjunto-malibu.jpg', produtos: ['p1'], status: 'publicado' }
  ],
  colecoes: [
    { id: 'o1', nome: 'Vem, verão', slug: 'vem-verao', desc: 'Peças leves e coloridas para os dias de calor.', img: 'img/lancamento-verao-sm.jpg', produtos: ['p10', 'p3', 'p5', 'p4'], status: 'publicado' },
    { id: 'o2', nome: 'Spoilers da semana', slug: 'spoilers', desc: 'O que acabou de chegar na loja.', img: 'img/spoiler-2-sm.jpg', produtos: ['p7', 'p8', 'p2'], status: 'publicado' }
  ],
  log: []
};
