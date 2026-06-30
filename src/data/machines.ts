// FONTE ÚNICA das 7 máquinas (DRY): alimenta o card E a página de detalhe.
// Specs da pesquisa de domínio (páginas de origem). Ver PRD §4.
import type { ImageMetadata } from 'astro';

// Resolve imagens de src/assets/machines/<slug>/... em ImageMetadata (otimizável
// por <Image/>). NÃO usar public/ p/ fotos (perde otimização do astro:assets).
const _images = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/machines/**/*.{jpg,jpeg,png,webp,avif}',
  { eager: true }
);

/** Acha a imagem <slug>/<base>.<qualquer-ext> (desacopla do formato do arquivo). */
function img(slug: string, base: string): ImageMetadata {
  const entry = Object.entries(_images).find(([key]) =>
    key.includes(`/machines/${slug}/${base}.`)
  );
  if (!entry) throw new Error(`Imagem da máquina não encontrada: ${slug}/${base}.*`);
  return entry[1].default;
}

/** Galeria opcional: pega g1,g2,g3... que existirem (na ordem). */
function gallery(slug: string, bases: string[]): ImageMetadata[] {
  return bases
    .map((b) => {
      const entry = Object.entries(_images).find(([key]) =>
        key.includes(`/machines/${slug}/${b}.`)
      );
      return entry?.[1].default;
    })
    .filter((x): x is ImageMetadata => Boolean(x));
}

export type MachineLine = 'textile' | 'uv';
export type MachineTier =
  | 'iniciante'
  | 'compacta'
  | 'profissional'
  | 'profissional-plus'
  | 'industrial'
  | 'uv';

export interface MachineSpec {
  label: string;
  value: string;
}

export interface MachinePrice {
  /** Preço de venda atual, em reais (BRL), como número (ex.: 14980 = R$ 14.980). */
  current: number;
  /** Preço "de" (riscado) quando há promoção. Omitir se não houver. */
  original?: number;
}

/** Formata um valor em reais no padrão pt-BR: 14980 → "R$ 14.980,00". */
const _brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
export const formatBRL = (value: number): string => _brl.format(value);

export interface Machine {
  slug: string;
  name: string;
  shortName: string;
  line: MachineLine;
  tier: MachineTier;
  /** true só na impressora adaptada (L8180, entrada R$ 14.980) → rótulo "ADAPTADA". */
  adapted?: boolean;
  badge: string;
  tagline: string;
  target: string;
  heads: string;
  width: string;
  topSpeed: string | null;
  /** Preço de venda em R$. Opcional: máquina sem preço definido não exibe valor. */
  price?: MachinePrice;
  highlights: string[];
  specs: MachineSpec[];
  whatsappMessage: string;
  image: ImageMetadata;
  gallery?: ImageMetadata[];
  sourceUrl: string;
}

const waMsg = (name: string) =>
  `Olá! Tenho interesse na ${name}. Pode me passar mais informações?`;

export const machines: Machine[] = [
  {
    slug: 'l8180-xp600',
    name: 'Impressora DTF L8180 XP600 — Kit Completo',
    shortName: 'L8180 XP600',
    line: 'textile',
    tier: 'iniciante',
    adapted: true,
    badge: 'Iniciante • A3',
    tagline: 'O jeito mais barato e completo de começar no DTF.',
    target: 'Quem está começando o primeiro negócio.',
    heads: '1× Epson XP600',
    width: 'A3 (~32 cm)',
    topSpeed: null,
    price: { current: 10000 },
    highlights: [
      'Kit turnkey: forno de poliamida e mesa a vácuo inclusos — pronto pra produzir no dia 1.',
      'Acompanha tintas (100 ml por cor), 30 folhas de filme A3, 200 g de pó de poliamida e o RIP Acrorip 11.2.',
      'Garantia de 3 meses e treinamento incluso.',
      'Suporte em português pelo WhatsApp.',
    ],
    specs: [
      { label: 'Cabeça de impressão', value: '1× Epson XP600' },
      { label: 'Largura de impressão', value: 'A3 (~32 cm)' },
      { label: 'Cores', value: 'CMYK + Branco' },
      { label: 'Forno', value: 'Poliamida (manual) incluso' },
      { label: 'Mesa a vácuo', value: 'Inclusa' },
      { label: 'Insumos inclusos', value: 'Tintas, filme A3, pó de poliamida, Acrorip 11.2' },
      { label: 'Garantia', value: '3 meses + treinamento' },
    ],
    whatsappMessage: waMsg('Impressora DTF L8180 XP600 — Kit Completo'),
    image: img('l8180-xp600', 'hero'),
    gallery: gallery('l8180-xp600', ['g1', 'g2', 'g3']),
    sourceUrl:
      'https://brasildtf.com.br/products/impressora-dtf-textil-l8180-xp600-forno-kit-insumos',
  },
  {
    slug: 'xf-400pro-a2',
    name: 'XF-400PRO A2 — Dual F1080 All-in-One',
    shortName: 'XF-400PRO A2',
    line: 'textile',
    tier: 'compacta',
    badge: 'Compacta • 40cm',
    tagline: 'All-in-one compacta: imprime, aplica pó e cura num equipamento só.',
    target: 'Pequeno negócio ou quem quer subir do A3.',
    heads: '2× Epson F1080-A1',
    width: '40 cm (16,5")',
    topSpeed: '3,5 m²/h',
    price: { current: 50000, original: 60000 },
    highlights: [
      'Impressão, aplicação de pó e cura integradas — solução all-in-one num corpo compacto.',
      'Circulação de tinta branca: menos entupimento, menos manutenção.',
      'Túneis de secagem em dois estágios com pré-aquecimento.',
      'Cabeça dupla F1080-A1 para cores vivas e bordas nítidas.',
    ],
    specs: [
      { label: 'Cabeças de impressão', value: '2× Epson F1080-A1' },
      { label: 'Largura de impressão', value: '40 cm (16,5")' },
      { label: 'Velocidade', value: '3,5 m²/h (6 pass) · 2,5 m²/h (8 pass)' },
      { label: 'Cores', value: 'CMYK + Branco' },
      { label: 'Resolução', value: '180 dpi (1 coluna) · 360 dpi (2 colunas)' },
      { label: 'Mídia', value: 'Filme PET para DTF' },
      { label: 'Consumo', value: '3,5 kW · 220V/110V' },
      { label: 'Peso', value: '170 kg' },
      { label: 'Dimensões', value: 'L1735 × P1080 × A1330 mm' },
    ],
    whatsappMessage: waMsg('XF-400PRO A2'),
    image: img('xf-400pro-a2', 'hero'),
    gallery: gallery('xf-400pro-a2', ['g1', 'g2', 'g3']),
    sourceUrl:
      'https://xinflyinggroup.com/product/xf-400pro-a2-dual-f1080-printheads-all-in-one-dtf-printer/',
  },
  {
    slug: '702e-c650sc',
    name: '702E + C650SC — 60cm Dual i3200',
    shortName: '702E C650SC',
    line: 'textile',
    tier: 'profissional',
    badge: 'Profissional • 60cm',
    tagline: 'Entrada no formato 60 cm com pó e cura automáticos.',
    target: 'Produção têxtil em crescimento.',
    heads: '2× Epson i3200-A1',
    width: '60 cm (24")',
    topSpeed: '8 m²/h',
    price: { current: 70000, original: 80000 },
    highlights: [
      'Cabeça dupla i3200-A1 com circulação automática de tinta branca.',
      'Agitador de pó integrado com take-up por sensor.',
      'Sistema térmico infravermelho + resfriamento para cura estável.',
      'Trilho HIWIN importado e placa de controle Hoson para precisão e estabilidade.',
    ],
    specs: [
      { label: 'Cabeças de impressão', value: '2× Epson i3200-A1' },
      { label: 'Largura de impressão', value: '60 cm (24")' },
      { label: 'Velocidade', value: '10 m²/h (6p) · 8 m²/h (8p) · 5 m²/h (12p)' },
      { label: 'Cores', value: 'CMYK + Branco (base água)' },
      { label: 'Mídia', value: 'Filme PET para DTF' },
      { label: 'Consumo', value: '0,8 kW · 220V/110V' },
      { label: 'Peso', value: '158 kg' },
      { label: 'Dimensões', value: 'L1700 × P850 × A1350 mm' },
    ],
    whatsappMessage: waMsg('702E + C650SC (60cm Dual i3200)'),
    image: img('702e-c650sc', 'hero'),
    gallery: gallery('702e-c650sc', ['g1', 'g2', 'g3']),
    sourceUrl:
      'https://xinflyinggroup.com/product/700ec650d-24-inch-dual-i3200-a1-heads-dtf-printer/',
  },
  {
    slug: '702e-z650-2',
    name: '702E + Z650-2 — 60cm Dual i3200 (Alta Velocidade)',
    shortName: '702E Z650-2',
    line: 'textile',
    tier: 'profissional-plus',
    badge: 'Profissional+ • 60cm',
    tagline: 'A 60 cm mais rápida para quem já produz em escala.',
    target: 'Confecção e produção em volume.',
    heads: '2× Epson i3200-A1',
    width: '60 cm (24")',
    topSpeed: '10 m²/h',
    price: { current: 70000, original: 80000 },
    highlights: [
      'Até 10 m²/h com branco estável — feita para produção contínua.',
      'Levantamento elétrico do rolo de pressão para ajuste fino.',
      'Agitador de pó inteligente + esteira mesh + take-up por sensor.',
      'Circulação e agitação de tinta branca com alarmes de tinta/resíduo.',
    ],
    specs: [
      { label: 'Cabeças de impressão', value: '2× Epson i3200-A1' },
      { label: 'Largura de impressão', value: '60 cm (24")' },
      { label: 'Velocidade', value: '10 m²/h (6p) · 8 m²/h (8p) · 5 m²/h (12p)' },
      { label: 'Cores', value: 'CMYK + Branco (base água)' },
      { label: 'Mídia', value: 'Filme PET para DTF' },
      { label: 'Consumo', value: '0,8 kW · 220V/110V' },
      { label: 'Peso', value: '158 kg' },
      { label: 'Dimensões', value: 'L1700 × P850 × A1350 mm' },
    ],
    whatsappMessage: waMsg('702E + Z650-2 (60cm Dual i3200, alta velocidade)'),
    image: img('702e-z650-2', 'hero'),
    gallery: gallery('702e-z650-2', ['g1', 'g2', 'g3']),
    sourceUrl: 'https://xinflyinggroup.com/product/epson-i3200-a1-printheads-dtf-printer-2/',
  },
  {
    slug: 'c605-h6502',
    name: 'C605 + H6502 — Industrial 5 Cabeças 60cm',
    shortName: 'C605 H6502',
    line: 'textile',
    tier: 'industrial',
    badge: 'Industrial • 5 cabeças',
    tagline: 'Máquina industrial de 5 cabeças para alto volume.',
    target: 'Operação de médio e grande porte.',
    heads: '5× Epson i3200-A1',
    width: '60 cm (24")',
    topSpeed: '28 m²/h',
    highlights: [
      'Cinco cabeças i3200-A1: produção de alto volume em formato largo.',
      'Pó, cura, reciclagem e resfriamento totalmente automáticos.',
      'Grau industrial: trilho prata, anti-colisão e alimentação/take-up tensionados.',
      'Proteção contra superaquecimento, alarmes e garantia de 1 ano + suporte vitalício.',
    ],
    specs: [
      { label: 'Cabeças de impressão', value: '5× Epson i3200-A1' },
      { label: 'Largura de impressão', value: '60 cm (24")' },
      { label: 'Velocidade', value: '28 m²/h (6 pass)' },
      { label: 'Bicos / passo', value: '3200 bicos por cabeça · passo 1/300"' },
      { label: 'Mídia', value: 'Filme PET para DTF' },
      { label: 'Consumo', value: '1,6 kW' },
      { label: 'Peso', value: '223 kg' },
      { label: 'Dimensões', value: 'L1670 × P815 × A1600 mm' },
      { label: 'Garantia', value: '1 ano + suporte técnico vitalício' },
    ],
    whatsappMessage: waMsg('C605 + H6502 (industrial 5 cabeças 60cm)'),
    image: img('c605-h6502', 'hero'),
    gallery: gallery('c605-h6502', ['g1', 'g2', 'g3']),
    sourceUrl: 'https://xinflyinggroup.com/product/c605h6502-5-head-24-inch-dtf-printer/',
  },
  {
    slug: 'xf-420s',
    name: 'XF-420S — UV-DTF + Bordado 3D',
    shortName: 'XF-420S',
    line: 'uv',
    tier: 'uv',
    badge: 'UV-DTF + Bordado 3D',
    tagline: 'UV-DTF e bordado 3D no mesmo equipamento.',
    target: 'Quem quer rótulos e adesivos premium com efeito 3D.',
    heads: '4× Epson i1600-U1',
    width: '42 cm (16,5")',
    topSpeed: '3,5 m²/h',
    highlights: [
      'Híbrida UV-DTF + bordado 3D em um só corpo.',
      'Laminação por rolo de borracha de alta aderência — acabamento de alto brilho.',
      'Tela touch de 7", descolamento automático do filme e mesa a vácuo.',
      'Lâmpadas UV com resfriamento a ar, aquecimento inteligente da base e anti-colisão.',
    ],
    specs: [
      { label: 'Cabeças de impressão', value: '4× Epson i1600-U1' },
      { label: 'Largura de impressão', value: '42 cm (16,5")' },
      { label: 'Velocidade', value: '3,5 m²/h (8 pass)' },
      { label: 'Resolução', value: '300 npi' },
      { label: 'Tinta', value: 'UV (CMYK + Branco + Branco)' },
      { label: 'Consumo', value: '2,5 kW · 220V/110V' },
      { label: 'Peso', value: '160 kg' },
      { label: 'Dimensões', value: 'L1460 × P850 × A1320 mm' },
    ],
    whatsappMessage: waMsg('XF-420S (UV-DTF + Bordado 3D)'),
    image: img('xf-420s', 'hero'),
    gallery: gallery('xf-420s', ['g1', 'g2', 'g3']),
    sourceUrl:
      'https://xinflyinggroup.com/product/xf-420s-i1600-u1-print-heads-3d-embroidery-uv-dtf-integrated-printer/',
  },
  {
    slug: 'xf-450s-uv',
    name: 'XF-450S UV — Crystal Label',
    shortName: 'XF-450S UV',
    line: 'uv',
    tier: 'uv',
    badge: 'UV-DTF • Crystal Label',
    tagline: 'Imprime e lamina rótulos crystal numa passada.',
    target: 'Estúdios e PMEs de rótulos e superfícies rígidas.',
    heads: '1× i3200U1-HD + 2× i1600-U1',
    width: '30 cm (12")',
    topSpeed: '2,75 m²/h',
    highlights: [
      'Imprime e lamina crystal labels em uma única passada.',
      'Aderência durável em vidro, metal, plástico, acrílico, madeira e superfícies revestidas.',
      'Cura UV rápida com lâmpadas a ar e movimento linear de alta precisão.',
      'Anti-colisão da cabeça e alarme de tinta baixa. Garantia de 1 ano + suporte vitalício.',
    ],
    specs: [
      { label: 'Cabeças de impressão', value: '1× Epson i3200U1-HD + 2× Epson i1600-U1' },
      { label: 'Largura de impressão', value: '30 cm (12")' },
      { label: 'Velocidade', value: '2,75 m²/h (8 pass)' },
      { label: 'Resolução', value: '300 npi' },
      { label: 'Tinta', value: 'UV (CMYK + Branco + cores opcionais)' },
      { label: 'Mídia', value: 'Filme UV PET (A+B)' },
      { label: 'Consumo', value: '1 kW · 220V/110V' },
      { label: 'Peso', value: '120 kg' },
      { label: 'Dimensões', value: 'L1300 × P1000 × A1450 mm' },
    ],
    whatsappMessage: waMsg('XF-450S UV (Crystal Label)'),
    image: img('xf-450s-uv', 'hero'),
    gallery: gallery('xf-450s-uv', ['g1', 'g2', 'g3']),
    sourceUrl:
      'https://xinflyinggroup.com/product/xf-450s-uv-3pc-epson-print-head-uv-dtf-printer/',
  },
];

export function getMachine(slug: string): Machine | undefined {
  return machines.find((m) => m.slug === slug);
}

export const textileMachines = machines.filter((m) => m.line === 'textile');
export const uvMachines = machines.filter((m) => m.line === 'uv');

export const lineLabel: Record<MachineLine, string> = {
  textile: 'Têxtil',
  uv: 'UV-DTF',
};

/** Rótulo de categoria exibido acima do nome (card e detalhe). Ex.:
 *  "IMPRESSORA INDUSTRIAL DTF TÊXTIL" · "IMPRESSORA INDUSTRIAL DTF UV" ·
 *  "IMPRESSORA ADAPTADA DTF TÊXTIL" (só a L8180, de entrada). */
export function machineCategory(m: Machine): string {
  const line = m.line === 'uv' ? 'UV' : 'TÊXTIL';
  const type = m.adapted ? 'ADAPTADA' : 'INDUSTRIAL';
  return `IMPRESSORA ${type} DTF ${line}`;
}
