/**
 * VIVERO VERDE — CATÁLOGO OFICIAL DE PRODUCTOS Y CONFIGURACIÓN COMERCIAL
 *
 * Configuración centralizada del negocio y catálogo de 28 flores y plantas ornamentales
 * comercializadas en Paraguay, respetando exactamente los nombres y precios oficiales.
 *
 * Criterio de ordenación y filtrado:
 * Para productos con variantes de precio, se toma el precio mínimo (minPrice)
 * como valor base para los filtros de rango y ordenamiento ascendente/descendente.
 */

'use strict';

/**
 * Configuración comercial del vivero.
 * Todos los datos comerciales están centralizados aquí para facilitar su actualización.
 */
const VIVERO_CONFIG = {
  businessName: 'Vivero Verde',
  tagline: 'Flores & Plantas Ornamentales',
  slogan: 'Cultivamos belleza para cada rincón de tu hogar',
  location: 'Asunción, Paraguay',
  // Número de WhatsApp en formato internacional sin signos ni espacios (Paraguay: 595 + 9XX...)
  whatsappNumber: '595981000000',
  whatsappDisplay: '+595 981 000 000',
  address: 'Avda. Santa Teresa c/ Denis Roa, Asunción',
  scheduleWeekdays: 'Lunes a Viernes: 07:30 a 18:00 hs',
  scheduleSaturday: 'Sábados: 08:00 a 16:30 hs',
  scheduleSunday: 'Domingos: 08:30 a 13:00 hs',
  socialInstagram: 'https://instagram.com/viveroverde_py',
  socialFacebook: 'https://facebook.com/viveroverde_py',
  currencySymbol: '₲',
  storageKey: 'vivero_verde_cart_v1'
};

/**
 * Función generadora de SVG placeholder elegante en caso de fallo de red o imagen no disponible.
 * Respeta la paleta botánica del vivero (#234B3A, #F8F6F0, #A8BFA3).
 *
 * @param {string} name - Nombre de la planta
 * @returns {string} Data URI con el SVG codificado
 */
function generateBotanicalPlaceholder(name) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450">
    <rect width="600" height="450" fill="#F8F6F0"/>
    <circle cx="300" cy="180" r="110" fill="#E9B7BD" opacity="0.25"/>
    <circle cx="300" cy="180" r="75" fill="#A8BFA3" opacity="0.35"/>
    <g transform="translate(300, 180)">
      <path d="M0,50 C0,10 20,-30 40,-50 C15,-35 -15,-35 -40,-50 C-20,-30 0,10 0,50 Z" fill="#234B3A"/>
      <path d="M0,10 C18,-5 35,-3 45,15 C28,15 12,8 0,10 Z" fill="#A8BFA3"/>
      <path d="M0,20 C-18,5 -35,7 -45,25 C-28,25 -12,18 0,20 Z" fill="#A8BFA3"/>
      <circle cx="0" cy="-25" r="7" fill="#E9B7BD"/>
    </g>
    <text x="300" y="320" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-size="22" font-weight="600" fill="#234B3A" text-anchor="middle" letter-spacing="0.5">${name}</text>
    <text x="300" y="350" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-size="13" font-weight="400" fill="#5F7567" text-anchor="middle" letter-spacing="1.5">VIVERO VERDE BOTÁNICA</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Formatea un monto numérico al estándar paraguayo de guaraníes (ej. 15000 -> "₲ 15.000").
 * Utiliza reemplazo explícito con puntos como separador de miles para garantizar consistencia
 * exacta en cualquier navegador y sistema operativo.
 *
 * @param {number} amount
 * @param {string} [unitLabel] - Etiqueta especial como "la docena"
 * @returns {string}
 */
function formatGuaranies(amount, unitLabel = '') {
  const num = Math.round(Number(amount) || 0);
  const formattedNumber = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  if (unitLabel) {
    return `${VIVERO_CONFIG.currencySymbol} ${formattedNumber} ${unitLabel}`;
  }
  return `${VIVERO_CONFIG.currencySymbol} ${formattedNumber}`;
}

/**
 * Lista oficial de 28 productos ornamentales del vivero.
 * Los nombres y precios corresponden estrictamente a la lista oficial provista.
 */
const PRODUCTS = [
  {
    id: 'cinecia',
    name: 'Cinecia',
    prices: [20000],
    unitLabel: '',
    image: 'https://images.unsplash.com/photo-1596724817796-fbcfd23d8c1c?auto=format&fit=crop&w=700&q=80',
    alt: 'Flores de Cinecia en plena floración'
  },
  {
    id: 'dipladenia',
    name: 'Dipladenia',
    prices: [35000],
    unitLabel: '',
    image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=700&q=80',
    alt: 'Planta ornamental Dipladenia con flores acampanadas'
  },
  {
    id: 'gladiolo',
    name: 'Gladiolo',
    prices: [15000],
    unitLabel: '',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=700&q=80',
    alt: 'Espigas florales de Gladiolo en tonos vibrantes'
  },
  {
    id: 'clavel-de-onza',
    name: 'Clavel de onza',
    prices: [15000],
    unitLabel: '',
    image: 'https://images.unsplash.com/photo-1589244159943-460088ed5c92?auto=format&fit=crop&w=700&q=80',
    alt: 'Delicado Clavel de onza con pétalos festoneados'
  },
  {
    id: 'clavel-pompon',
    name: 'Clavel pompón',
    prices: [10000],
    unitLabel: '',
    image: 'https://images.unsplash.com/photo-1567696911980-2eed69a46042?auto=format&fit=crop&w=700&q=80',
    alt: 'Clavel pompón de pétalos tupidos y compactos'
  },
  {
    id: 'alegria-del-hogar',
    name: 'Alegría del hogar',
    prices: [15000],
    unitLabel: '',
    image: 'https://images.unsplash.com/photo-1533616688419-b7a585564566?auto=format&fit=crop&w=700&q=80',
    alt: 'Alegría del hogar con flores vivas ideales para semisombra'
  },
  {
    id: 'lavio-de-senorita',
    name: 'Lavio de señorita',
    prices: [5000, 10000],
    unitLabel: '',
    image: 'https://images.unsplash.com/photo-1586968293593-3fa84c31168b?auto=format&fit=crop&w=700&q=80',
    alt: 'Flores tubulares de Lavio de señorita'
  },
  {
    id: 'kalanchoe',
    name: 'Kalanchoe',
    prices: [10000],
    unitLabel: '',
    image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=700&q=80',
    alt: 'Ramilletes florales de Kalanchoe en maceta'
  },
  {
    id: 'azalea',
    name: 'Azalea',
    prices: [15000, 30000, 60000, 80000],
    unitLabel: '',
    image: 'https://images.unsplash.com/photo-1587637885131-8b08567433d6?auto=format&fit=crop&w=700&q=80',
    alt: 'Arbusto de Azalea cargado de flores radiantes'
  },
  {
    id: 'verbena',
    name: 'Verbena',
    prices: [15000],
    unitLabel: '',
    image: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=700&q=80',
    alt: 'Inflorescencias de Verbena en tonos púrpuras y rosas'
  },
  {
    id: 'lirio-perfumado',
    name: 'Lirio perfumado',
    prices: [20000, 60000],
    unitLabel: '',
    image: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&w=700&q=80',
    alt: 'Elegante flor de Lirio perfumado de gran aroma'
  },
  {
    id: 'rosa',
    name: 'Rosa',
    prices: [8000, 10000],
    unitLabel: '',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=700&q=80',
    alt: 'Clásica flor de Rosa de pétalos aterciopelados'
  },
  {
    id: 'begonia',
    name: 'Begonia',
    prices: [10000],
    unitLabel: '',
    image: 'https://images.unsplash.com/photo-1616690710400-a16d146927c5?auto=format&fit=crop&w=700&q=80',
    alt: 'Begonia ornamental con follaje decorativo y flores'
  },
  {
    id: 'girasol',
    name: 'Girasol',
    prices: [10000],
    unitLabel: '',
    image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=700&q=80',
    alt: 'Girasol vibrante con sus pétalos dorados al sol'
  },
  {
    id: 'santa-rita',
    name: 'Santa Rita',
    prices: [15000, 20000, 40000],
    unitLabel: '',
    image: 'https://images.unsplash.com/photo-1558236714-911a2f30894f?auto=format&fit=crop&w=700&q=80',
    alt: 'Enredadera de Santa Rita con brácteas color fucsia intenso'
  },
  {
    id: 'dalia',
    name: 'Dalia',
    prices: [10000],
    unitLabel: '',
    image: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=700&q=80',
    alt: 'Flor de Dalia simétrica con pétalos geométrica y delicadamente dispuestos'
  },
  {
    id: 'flor-de-dura-nacional',
    name: 'Flor de dura nacional',
    prices: [10000],
    unitLabel: '',
    image: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&w=700&q=80',
    alt: 'Flor de dura nacional resistente al sol con pétalos rosados'
  },
  {
    id: 'flor-de-dura-brasilera',
    name: 'Flor de dura brasilera',
    prices: [15000],
    unitLabel: '',
    image: 'https://images.unsplash.com/photo-1590452366185-3e284004944b?auto=format&fit=crop&w=700&q=80',
    alt: 'Flor de dura brasilera de floración abundante y brillante'
  },
  {
    id: 'jazmin-de-leche',
    name: 'Jazmín de leche',
    prices: [15000],
    unitLabel: '',
    image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=700&q=80',
    alt: 'Jazmín de leche trepador con flores blancas estrelladas y perfume dulce'
  },
  {
    id: 'joya-del-jardin',
    name: 'Joya del jardín',
    prices: [10000],
    unitLabel: '',
    image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=700&q=80',
    alt: 'Flores multicolores de Joya del jardín'
  },
  {
    id: 'hortensia',
    name: 'Hortensia',
    prices: [15000, 20000],
    unitLabel: '',
    image: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=700&q=80',
    alt: 'Inflorescencia esférica de Hortensia'
  },
  {
    id: 'arandano',
    name: 'Arándano',
    prices: [70000],
    unitLabel: '',
    image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=700&q=80',
    alt: 'Planta de Arándano con frutos frescos y hojas verdes'
  },
  {
    id: 'coco-brasilero',
    name: 'Coco brasilero',
    prices: [70000, 200000],
    unitLabel: '',
    image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=700&q=80',
    alt: 'Palmera de Coco brasilero con frondas plumosas'
  },
  {
    id: 'gardenia',
    name: 'Gardenia',
    prices: [8000],
    unitLabel: '',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=700&q=80',
    alt: 'Flor de Gardenia blanca de intensa y exquisita fragancia'
  },
  {
    id: 'pensamiento',
    name: 'Pensamiento',
    prices: [5000],
    unitLabel: '',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=700&q=80',
    alt: 'Flores de Pensamiento de pétalos aterciopelados bicolores'
  },
  {
    id: 'clavelina',
    name: 'Clavelina',
    prices: [5000],
    unitLabel: '',
    image: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=700&q=80',
    alt: 'Flores de Clavelina con orlas dentadas'
  },
  {
    id: 'conejito',
    name: 'Conejito',
    prices: [5000],
    unitLabel: '',
    image: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=700&q=80',
    alt: 'Espigas de flores de Conejito en floración'
  },
  {
    id: 'botoncito',
    name: 'Botoncito',
    prices: [20000],
    unitLabel: 'la docena',
    image: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=700&q=80',
    alt: 'Flores de Botoncito vendidas por docena'
  }
];

// Asignar minPrice y maxPrice precalculados a cada producto para optimizar búsquedas y ordenamiento
PRODUCTS.forEach((product) => {
  product.minPrice = Math.min(...product.prices);
  product.maxPrice = Math.max(...product.prices);
  product.hasVariants = product.prices.length > 1;
});

// Congelar el catálogo para evitar modificaciones accidentales en tiempo de ejecución
Object.freeze(PRODUCTS);
