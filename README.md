# Vivero Verde — Landing Page Comercial de Vivero y Floristería

Landing page comercial, moderna, elegante y totalmente responsive desarrollada para un vivero boutique y floristería en Paraguay. Diseñada con estándares de desarrollo frontend senior, estética botánica refinada, catálogo interactivo con las 28 especies oficiales, variantes de precios seleccionables en Guaraníes (₲), carrito con persistencia en LocalStorage y generación automática de solicitudes de pedido para WhatsApp.

---

## 🌿 Características Principales

1. **Estética Botánica Boutique**:
   - Paleta cromática oficial: Verde bosque (`#234B3A`), Verde salvia (`#A8BFA3`), Crema (`#F8F6F0`), Blanco cálido (`#FFFDF9`), Rosa floral (`#E9B7BD`) y Texto oscuro (`#26352C`).
   - Tipografía editorial con *Playfair Display* y *Plus Jakarta Sans*.
   - Iconografía SVG profesional personalizada y libre de emojis o gradientes genéricos.

2. **Catálogo Oficial de 28 Productos**:
   - Lista oficial íntegra y sin alteraciones en nombres botánicos ni precios.
   - Formato en Guaraníes: `₲ 15.000`.
   - Soporte para productos con variantes de precio (por ejemplo *Azalea*, *Santa Rita*, *Coco brasilero*, etc.) con botones de selección directa por precio.
   - Manejo del producto *Botoncito* a ₲ 20.000 la docena.
   - Criterio de ordenamiento y filtrado documentado: utiliza el precio mínimo (`minPrice`) como valor de referencia.

3. **Buscador en Tiempo Real y Filtros**:
   - Búsqueda instantánea por nombre con tolerancia a mayúsculas y acentos.
   - Ordenamiento por: Predeterminado, Menor a mayor precio, Mayor a menor precio, y Alfabético (A-Z y Z-A).
   - Filtros rápidos por chips de precio y rango numérico personalizado (mínimo / máximo).
   - Estado vacío visualmente atractivo con botón para restablecer filtros.

4. **Carrito de Pedidos y WhatsApp Checkout**:
   - Persistencia automática en el navegador mediante `localStorage`.
   - Soporte para agregar diferentes variantes de precio de una misma flor como renglones independientes.
   - Control de cantidades (+ / -) y eliminación individual o vaciado completo.
   - Generación de mensaje formal con codificación segura (`encodeURIComponent` y `wa.me`).
   - Formato de mensaje oficial:
     ```text
     Hola, quisiera consultar por el siguiente pedido:

     - 2 × Rosa (₲ 10.000): ₲ 20.000
     - 1 × Dipladenia (₲ 35.000): ₲ 35.000

     Total estimado: ₲ 55.000

     ¿Podrían confirmarme la disponibilidad?
     ```
   - Panel lateral accesible (drawer) en escritorio y optimizado para pantallas táctiles.

5. **Rendimiento, SEO y Accesibilidad (A11y)**:
   - Cero frameworks externos pesados: 100% HTML5 semántico, CSS3 moderno y JavaScript ES6+ vanilla.
   - Carga diferida (`loading="lazy"`) y dimensiones explícitas en imágenes para evitar desplazamientos de diseño (CLS).
   - Generador fallback en SVG embebido en caso de desconexión o bloqueo de red.
   - Animaciones con `IntersectionObserver` respetando la preferencia del sistema `prefers-reduced-motion`.
   - Atributos ARIA (`aria-expanded`, `aria-label`, `aria-modal`), soporte de tecla `ESC` y control de foco.
   - Datos estructurados JSON-LD (`Schema.org/Florist`) y etiquetas Open Graph para redes sociales.

---

## 📁 Estructura del Proyecto

```text
vivero_verde_lp/
├── index.html              # Estructura semántica principal y metadatos SEO
├── favicon.svg             # Favicon vectorial original botánico
├── README.md               # Documentación y guía de despliegue
├── css/
│   ├── styles.css          # Variables de diseño, reset, tipografía y componentes
│   ├── responsive.css      # Adaptación mobile-first (320px a 1440px)
│   └── animations.css      # Animaciones de scroll, keyframes y a11y
├── js/
│   ├── products.js         # Configuración comercial y arreglo de los 28 productos
│   ├── cart.js             # Lógica del carrito, LocalStorage y checkout WhatsApp
│   ├── filters.js          # Buscador, ordenamientos y renderizado del catálogo
│   └── app.js              # Inicialización, header inteligente y observador de scroll
└── assets/
    ├── icons/              # Iconos SVG modulares del proyecto
    └── images/             # Directorio de recursos gráficos locales
```

---

## ⚙️ Configuración Comercial

Todos los datos de contacto y comerciales se modifican en un único lugar dentro de [`js/products.js`](file:///c:/Users/abelg/OneDrive/Documentos/vivero_verde_lp/js/products.js):

```javascript
const VIVERO_CONFIG = {
  businessName: 'Vivero Verde',
  tagline: 'Flores & Plantas Ornamentales',
  slogan: 'Cultivamos belleza para cada rincón de tu hogar',
  location: 'Asunción, Paraguay',
  whatsappNumber: '595981000000', // Modificar con el número oficial (código país 595 + número)
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
```

---

## 🚀 Cómo Ejecutar Localmente

Al no utilizar dependencias externas ni procesos de compilación (build), se puede correr inmediatamente con cualquier servidor estático local:

### Opción 1: Con Python (incluido por defecto en la mayoría de sistemas)
```bash
# Python 3
python -m http.server 8000
```
Luego abrir en el navegador: `http://localhost:8000`

### Opción 2: Con Node.js / npx
```bash
npx serve .
```

### Opción 3: Con la extensión Live Server de VS Code
1. Abrir la carpeta del proyecto en VS Code.
2. Hacer clic derecho sobre `index.html`.
3. Seleccionar **"Open with Live Server"**.

---

## 🌐 Cómo Publicar en Hosting Estático

### 1. Vercel
1. Instalar la CLI de Vercel con `npm i -g vercel` o vincular el repositorio en [vercel.com](https://vercel.com).
2. Ejecutar `vercel` en la raíz del proyecto.
3. El proyecto se desplegará en segundos sin necesidad de configurar ningún paso de construcción (*zero-config*).

### 2. Netlify
1. Ingresar a [netlify.com](https://www.netlify.com).
2. Arrastrar y soltar la carpeta del proyecto en el panel de despliegue ("Drag and Drop").
3. O mediante Netlify CLI: `npx netlify deploy --prod --dir=.`.

### 3. GitHub Pages
1. Subir los archivos a un repositorio en GitHub.
2. Ir a **Settings > Pages**.
3. En **Source**, seleccionar la rama `main` y la carpeta `/ (root)`.
4. Guardar los cambios. El sitio estará disponible en `https://<usuario>.github.io/<repositorio>/`.

---

## 📋 Lista Oficial de Productos y Precios

| # | Producto | Precio oficial en Guaraníes (₲) |
|---|---|---|
| 1 | Cinecia | ₲ 20.000 |
| 2 | Dipladenia | ₲ 35.000 |
| 3 | Gladiolo | ₲ 15.000 |
| 4 | Clavel de onza | ₲ 15.000 |
| 5 | Clavel pompón | ₲ 10.000 |
| 6 | Alegría del hogar | ₲ 15.000 |
| 7 | Lavio de señorita | ₲ 5.000 / ₲ 10.000 |
| 8 | Kalanchoe | ₲ 10.000 |
| 9 | Azalea | ₲ 15.000 / ₲ 30.000 / ₲ 60.000 / ₲ 80.000 |
| 10 | Verbena | ₲ 15.000 |
| 11 | Lirio perfumado | ₲ 20.000 / ₲ 60.000 |
| 12 | Rosa | ₲ 8.000 / ₲ 10.000 |
| 13 | Begonia | ₲ 10.000 |
| 14 | Girasol | ₲ 10.000 |
| 15 | Santa Rita | ₲ 15.000 / ₲ 20.000 / ₲ 40.000 |
| 16 | Dalia | ₲ 10.000 |
| 17 | Flor de dura nacional | ₲ 10.000 |
| 18 | Flor de dura brasilera | ₲ 15.000 |
| 19 | Jazmín de leche | ₲ 15.000 |
| 20 | Joya del jardín | ₲ 10.000 |
| 21 | Hortensia | ₲ 15.000 / ₲ 20.000 |
| 22 | Arándano | ₲ 70.000 |
| 23 | Coco brasilero | ₲ 70.000 / ₲ 200.000 |
| 24 | Gardenia | ₲ 8.000 |
| 25 | Pensamiento | ₲ 5.000 |
| 26 | Clavelina | ₲ 5.000 |
| 27 | Conejito | ₲ 5.000 |
| 28 | Botoncito | ₲ 20.000 la docena |

---

## 🔒 Licencia y Créditos

Desarrollado como solución comercial profesional para viveros y floristerías. Las imágenes empleadas son de fuentes públicas con fines demostrativos de especies ornamentales.
