# Milo — Guía de Sistema de Diseño Frontend

> Documento de referencia auto-contenido para replicar la identidad visual y las convenciones de frontend de **Milo** en cualquier proyecto nuevo (Next.js / React / Tailwind). No incluye paleta de colores a propósito — solo la _arquitectura_ de cómo se usan los colores, para que cada proyecto defina su propia marca sobre esta misma estructura.

---

## 0. Filosofía de diseño

- **Marca "friendly-SaaS"**: esquinas muy redondeadas, mucho aire (whitespace), tipografía semibold con tracking negativo en headings, un único color de acento usado con moderación (CTAs, hover states, focus rings) sobre una base neutra blanco/negro/gris.
- **Dos capas de componentes conviven a propósito**:
  1. **Capa "sistema" (shadcn/ui, radix)** — componentes utilitarios, cuadrados/semi-redondeados (`rounded-md`, `rounded-lg`), usados en dashboards, tablas, formularios administrativos. Priorizan función sobre expresión.
  2. **Capa "marca" (hand-rolled)** — botones tipo píldora, cards con radios de 24–32px, navbar flotante, animaciones de entrada con motion. Usada en landing, marketing, componentes orientados al cliente final (exploración, reservas, perfiles).

  Un proyecto Milo nuevo debe mantener esta dualidad: no todo necesita ser "bonito"; los paneles de datos usan la capa sistema, las superficies de cara al usuario usan la capa marca.

- **Motion como default, no como extra**: casi ningún elemento por encima del fold aparece sin una transición de entrada (fade + translateY + a veces blur). El movimiento comunica jerarquía y calidad percibida.
- **Mobile-first con puntos de quiebre a medida**: además de los breakpoints estándar de Tailwind (`sm/md/lg/xl`), se usan breakpoints arbitrarios en píxeles exactos (`max-[850px]:`, `min-[850px]:`, `max-[1200px]:`) cuando el diseño necesita un punto de colapso específico que no coincide con la grilla estándar (típicamente donde el navbar deja de caber).

---

## 1. Stack tecnológico de referencia

| Capa                      | Librería                                                                                                                   | Uso                                            |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Framework                 | Next.js (App Router)                                                                                                       | SSR/RSC, `app/` dir                            |
| Estilos                   | Tailwind CSS 3 + `tailwindcss-animate`                                                                                     | utility-first, variables CSS para tokens       |
| Componentes base          | shadcn/ui, estilo **"new-york"**, base color **neutral**, `cssVariables: true`                                             | primitives accesibles                          |
| Primitives headless       | Radix UI (`@radix-ui/react-*`: dialog, dropdown-menu, select, popover, tooltip, tabs, checkbox, avatar, toggle, separator) | accesibilidad + comportamiento                 |
| Variantes de componente   | `class-variance-authority` (cva)                                                                                           | variants/sizes tipados                         |
| Merge de clases           | `clsx` + `tailwind-merge` vía helper `cn()`                                                                                | evitar colisión de clases Tailwind             |
| Animación UI              | `framer-motion`                                                                                                            | entradas, stagger, layout transitions, drag    |
| Animación avanzada/scroll | `gsap` + `@gsap/react`                                                                                                     | timelines complejas, split-text, scroll-driven |
| Scroll suave              | `lenis`                                                                                                                    | smooth-scroll en landing                       |
| Iconos                    | `lucide-react`                                                                                                             | set de iconos único en todo el proyecto        |
| Formularios               | `react-hook-form` + `@hookform/resolvers` + `zod`                                                                          | validación tipada                              |
| Toasts                    | `react-hot-toast` (global) + componentes propios `SuccessToast`/`ErrorToast` (casos puntuales)                             | feedback                                       |
| Confetti                  | `canvas-confetti`                                                                                                          | micro-celebraciones en éxito                   |
| Fecha                     | `date-fns`, `react-day-picker`                                                                                             | calendarios/formateo                           |
| Tablas                    | `@tanstack/react-table`                                                                                                    | tablas complejas con sort/paginación           |
| Gráficos                  | `recharts`                                                                                                                 | analíticas/dashboards                          |

**Setup de un proyecto Milo desde cero:**

```bash
npx create-next-app@latest --typescript --tailwind --app
npx shadcn@latest init   # style: new-york, base color: neutral, css variables: yes
npm i framer-motion gsap @gsap/react lenis lucide-react class-variance-authority clsx tailwind-merge react-hot-toast react-hook-form @hookform/resolvers zod canvas-confetti date-fns
```

---

## 2. Tipografía

### 2.1 Familias tipográficas

Tres variables de fuente conviven, cargadas vía `next/font`:

```ts
// app/layout.tsx
const bodyFont = Poppins({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const displayBold = localFont({
  src: "../public/fonts/<Familia>/Fonts/OTF/<Familia>-Extrabold.otf",
  variable: "--font-display",
  weight: "800",
  display: "swap",
});

const displayLight = localFont({
  src: "../public/fonts/<Familia>/Fonts/OTF/<Familia>-Light.otf",
  variable: "--font-display-light",
  weight: "300",
  display: "swap",
});
```

```ts
// tailwind.config.ts
fontFamily: {
  sans: ['var(--font-body)', 'sans-serif'],       // default global (body, h1-h4)
  body: ['var(--font-body)', 'sans-serif'],
  display: ['var(--font-display)', 'sans-serif'],       // uso puntual/expresivo (peso 800)
  'display-light': ['var(--font-display-light)', 'sans-serif'], // uso puntual (peso 300)
}
```

- **Regla de oro**: el 95% de la interfaz usa la fuente "body" (geométrica, sans-serif, tipo Poppins/Inter). Las fuentes "display" (bold 800 / light 300) son un layer secundario reservado para acentos puntuales — no se documentó un uso masivo de ellas en el código auditado, así que en un proyecto nuevo son opcionales; lo indispensable es la fuente body con pesos 300 a 800 disponibles.
- Aplicar la fuente body también a headings explícitamente (`h1,h2,h3,h4 { font-family: var(--font-body) }`) para que no hereden fuentes del navegador antes de la hidratación.

### 2.2 Escala y tratamiento de texto

| Contexto                                 | Clases típicas                                                                   |
| ---------------------------------------- | -------------------------------------------------------------------------------- |
| Hero H1 (landing)                        | `text-[clamp(2.5rem,6vw,80px)] font-bold tracking-tight leading-[1.05]`          |
| H2 de sección                            | `text-[clamp(32px,5vw,48px)] font-semibold tracking-[-0.02em] leading-tight`     |
| H2 de sección (más chico)                | `text-[clamp(28px,4vw,40px)] font-semibold tracking-[-0.02em]`                   |
| H3 dentro de card                        | `text-xl md:text-2xl font-semibold leading-tight`                                |
| Eyebrow / kicker (label sobre un título) | `text-[11px] font-medium uppercase tracking-widest text-{muted}`                 |
| Body / párrafo                           | `text-sm` o `text-base`, `leading-relaxed`, color muted (`text-neutral-500/600`) |
| Micro-label (badges, meta info)          | `text-[10px]`–`text-[12px] font-bold uppercase tracking-wide`                    |
| Números destacados (stats)               | `text-3xl md:text-4xl font-semibold tracking-[-0.02em]`                          |

**Convenciones:**

- `tracking-tight` / `tracking-[-0.02em]` en todos los headings grandes — nunca tracking normal en display type.
- `tracking-widest` + `uppercase` + tamaño diminuto (`text-[11px]`) para labels de categoría/kicker — es el recurso #1 para introducir una sección o dar contexto sin competir con el heading.
- Usar `clamp()` en vez de solo breakpoints para headings hero — tipografía verdaderamente fluida entre mobile y desktop.
- `text-balance` (utilidad custom vía `text-wrap: balance`) disponible para evitar huérfanas en headings centrados.
- Inputs: forzar `font-size: 16px !important` en `input, select, textarea` bajo `@media (max-width: 767px)` — evita el auto-zoom de iOS en focus.

---

## 3. Sistema de bordes y radios

Dos sistemas de radio conviven, cada uno con su rol:

### 3.1 Radio "sistema" (tokens shadcn)

```css
:root {
  --radius: 0.5rem;
} /* 8px */
```

```ts
borderRadius: {
  lg: 'var(--radius)',            // 8px
  md: 'calc(var(--radius) - 2px)',// 6px
  sm: 'calc(var(--radius) - 4px)',// 4px
}
```

Usado en: inputs, selects, botones de dashboard, dropdowns, popovers, tooltips, tablas, badges. Da una sensación "de aplicación", precisa y funcional.

### 3.2 Radio "de marca" (valores arbitrarios grandes)

Usado en: cards de marketing, modales, navbar, imágenes, chips/píldoras.

| Elemento                              | Radio                                                                        |
| ------------------------------------- | ---------------------------------------------------------------------------- |
| Botón/CTA/badge tipo píldora          | `rounded-full`                                                               |
| Input de búsqueda tipo pill (desktop) | `rounded-full` (colapsa a `rounded-3xl` en mobile apilado)                   |
| Card de feature grande (landing)      | `rounded-[32px]`                                                             |
| Card de pricing / mini-stat           | `rounded-[20px]` a `rounded-[24px]`                                          |
| Modal / dialog / dropdown flotante    | `rounded-2xl` (16px)                                                         |
| Imagen de card de listado (thumbnail) | `rounded-[16px]`                                                             |
| Avatar / badge circular               | `rounded-full`                                                               |
| Navbar flotante (contenedor)          | `rounded-b-[2rem]` (solo esquinas inferiores, "cae" desde el borde superior) |
| Panel de menú mobile full-screen      | sin radio (ocupa 100dvh)                                                     |

**Regla práctica**: cuanto más "de marca"/marketing es la superficie, mayor el radio (24–32px o `rounded-full`). Cuanto más "utilitaria"/densa en datos, menor el radio (`rounded-md`/`rounded-lg`, 6–8px).

### 3.3 Bordes

- Borde sutil por defecto: `border border-neutral-100` o `border-neutral-200` (nunca bordes oscuros/gruesos salvo estados de error).
- Divisores internos de menús/dropdowns: `border-t border-neutral-100`.
- Acento de estado en cards de datos (stat cards): **borde izquierdo grueso de 4px** como indicador de categoría/estado — `border-l-4 border-l-{color-semantico}` — mientras el resto de bordes del card permanecen por defecto (heredados de shadcn `border`).
- Buscador tipo Airbnb: separadores internos con `divide-x`/`divide-y` en vez de bordes por celda.

---

## 4. Sombras y efectos

### 4.1 Sombras utilitarias (Tailwind estándar)

`shadow-sm` (cards de dashboard) → `shadow-md` (hover) → `shadow-lg`/`shadow-xl` (dropdowns, botones CTA) → `shadow-2xl` (modales, mockups flotantes).

### 4.2 Sombras custom inline (cuando Tailwind no alcanza)

Para navbars y paneles flotantes se usa `style={{ boxShadow: "..." }}` con sombras muy difusas y de opacidad baja, en vez de las utilidades estándar:

```
boxShadow: "0 8px 30px rgba(0,0,0,0.06)"   /* navbar en reposo */
boxShadow: "0 8px 24px rgba(0,0,0,0.08)"   /* dropdown pequeño */
boxShadow: "0 8px 30px rgba(0,0,0,0.12)"   /* dropdown de perfil (más presencia) */
```

Para "notification cards" flotantes (mockups de landing), sombra de dos capas (una muy difusa + una de contacto muy fina):

```
box-shadow: 0px 4px 20px 10px rgba(0,0,0,0.04), 0px 1.4px 0.65px 1.08px rgba(0,0,0,0.04);
```

**Regla**: las sombras de marca son siempre negras a opacidad baja (4–12%), muy difusas (blur alto, spread bajo o nulo) — nunca sombras duras ni de color. Comunican "flotar", no "recortar".

### 4.3 Blur / glass

- Overlay de modal: `bg-black/60 backdrop-blur-sm`.
- Overlay de dialog (radix) responsivo: fondo sólido blanco en mobile (`bg-white`), semitransparente + blur en desktop (`sm:bg-black/50 sm:backdrop-blur-sm`) — el blur es un lujo de escritorio, en mobile se prioriza rendimiento/legibilidad con fondo sólido.
- Badges "flotando sobre imagen" (p. ej. "Última reserva" sobre una foto): `bg-white/90 backdrop-blur-md shadow-sm`.

### 4.4 Micro-interacciones de hover

- Cards de feature: el contenido interno escala levemente en hover del contenedor padre — `group` en el contenedor + `group-hover:scale-105` (o `scale-[1.02]`) en los hijos, con `transition-transform duration-500 ease-out`. El card en sí no se mueve; su contenido "respira".
- Stat cards (dashboard): el card completo se eleva — `transition-transform duration-300 hover:-translate-y-1 hover:shadow-md`.
- Imágenes dentro de cards de listado: `transition-transform duration-500 ease-out group-hover:scale-105` sobre un contenedor `overflow-hidden`.
- Botones icon-only: `hover:scale-110 active:scale-95 transition-transform`.
- Links de nav: fondo de acento muy tenue en hover — `hover:bg-{accent}/10 transition-colors rounded-full`.

### 4.5 Efectos decorativos de marca

- **Marco de viewport ("site frame")**: 4 barras fijas blancas de 10px pegadas a cada borde de la ventana (`position: fixed`, `z-index` muy alto, `pointer-events: none`) + 4 SVGs de esquina cóncava (un cuarto de círculo invertido) rotados 0/90/180/270° en cada vértice. Da la sensación de que el contenido "vive dentro de una tarjeta redondeada" del tamaño del viewport. Usado en landing.
- **Placeholder de imagen ausente**: gradiente radial de marca sobre fondo neutro — `bg-[radial-gradient(ellipse_100%_80%_at_50%_0%,{acento},transparent)] opacity-40`.
- **Fades de borde (marquee/scroll horizontal)**: `mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent)` (+ prefijo `-webkit-`) para que el contenido se desvanezca en los extremos en vez de cortarse abruptamente.
- **Círculos concéntricos decorativos** alrededor de un mockup: 2-3 `div` absolutos, `border rounded-full`, tamaños crecientes, opacidad decreciente hacia afuera (`border-{acento}/80`, `/55`, `/30`).
- **"Ear" del navbar**: dos SVGs de cuarto de círculo pegados a los costados superiores del navbar flotante, rellenos del color de fondo de la página, para fingir que el navbar "recorta" una esquina del contenido detrás — solo visible en desktop.

---

## 5. Espaciado, contenedores y layout

### 5.1 Contenedores por contexto

| Contexto                       | Ancho máximo                                                                          | Padding horizontal     |
| ------------------------------ | ------------------------------------------------------------------------------------- | ---------------------- |
| Sección de landing (marketing) | `max-w-5xl` (1024px) o `max-w-2xl` para contenido de lectura (FAQ)                    | `px-6`                 |
| Navbar flotante                | `max-w-5xl` (colapsa a `max-w-2xl` en pantallas medianas antes del breakpoint mobile) | `px-4`                 |
| Contenido de dashboard/admin   | `max-w-[1600px]`                                                                      | `px-4 sm:px-6 lg:px-8` |
| Modal                          | `max-w-lg` a `max-w-2xl`                                                              | `px-4 sm:px-6`         |

### 5.2 Padding vertical de secciones

- Sección de landing estándar: `py-24`.
- Secciones consecutivas que se "superponen" visualmente (para permitir que una forma decorativa de la sección anterior se meta debajo): usar margin-top negativo en la siguiente, ej. `-mt-12 md:-mt-32 pt-16`.

### 5.3 Padding interno de componentes

| Componente                                 | Padding                                                              |
| ------------------------------------------ | -------------------------------------------------------------------- |
| Card grande de marketing                   | `p-8` (a veces `p-8 pb-0` si un mockup se "sale" del borde inferior) |
| Card de dashboard (shadcn)                 | header `p-6`, content `p-6 pt-0`, footer `p-6 pt-0`                  |
| Mini stat-card (dentro de una card grande) | `p-5`                                                                |
| Modal (custom)                             | header `px-6 py-4`, body `px-6 py-6`                                 |
| Dialog (shadcn)                            | `p-6 px-4 sm:px-6`                                                   |
| Input                                      | `px-3 py-2`, altura `h-10` (o `h-9` en variante compacta)            |
| Botón default                              | `px-4 py-2`, altura `h-9`                                            |
| Botón CTA tipo píldora (marca)             | `px-8 py-4`                                                          |
| Buscador tipo pill (segmento individual)   | `px-8 py-4`                                                          |
| Badge/chip                                 | `px-2.5 py-0.5` (shadcn) o `px-3 py-1` (marca)                       |

### 5.4 Gaps

- Grillas de cards: `gap-4`.
- Botones/acciones en fila: `gap-2` a `gap-4` según densidad.
- Stack vertical de texto (label + valor): `gap-0.5` a `gap-1`.
- Iconos + texto: `gap-2` (inline pequeño) o `gap-3` (más presencia).

### 5.5 Breakpoints

Estándar Tailwind (`sm:640 md:768 lg:1024 xl:1280`) **más** breakpoints arbitrarios en píxel exacto cuando el punto de colapso real de un componente no cae en la grilla estándar:

```
max-[850px]:   // por debajo de esto, el navbar pasa a modo mobile
min-[850px]:   // inverso, para mostrar el elemento solo en desktop
max-[1200px]:  // punto intermedio para compactar paddings/gaps antes del colapso total
```

**Regla**: no fuerces un diseño a los breakpoints estándar si el contenido real (ej. ancho del navbar con su contenido) rompe antes/después. Mide el punto de quiebre real y usa un breakpoint arbitrario ahí.

### 5.6 Grillas de cards

```
grid grid-cols-1 md:grid-cols-2 gap-4        /* features bento */
grid grid-cols-1 md:grid-cols-3 gap-4        /* pricing */
```

Patrón "bento": un card puede ocupar más espacio con `md:row-span-2` o `md:col-span-2` para romper la monotonía de la grilla — no todos los cards del mismo grid tienen que pesar igual.

---

## 6. Sistema de color — arquitectura (sin paleta)

> Se documenta la **estructura**, no los valores. Cada proyecto Milo define su propia paleta sobre estos mismos tokens.

### 6.1 Tokens semánticos (formato shadcn, HSL vía CSS variables)

```css
:root {
  --background: <h s% l%>;
  --foreground: <h s% l%>;
  --card: <h s% l%>; --card-foreground: <h s% l%>;
  --popover: <h s% l%>; --popover-foreground: <h s% l%>;
  --primary: <h s% l%>; --primary-foreground: <h s% l%>;
  --secondary: <h s% l%>; --secondary-foreground: <h s% l%>;
  --muted: <h s% l%>; --muted-foreground: <h s% l%>;
  --accent: <h s% l%>; --accent-foreground: <h s% l%>;
  --destructive: <h s% l%>; --destructive-foreground: <h s% l%>;
  --border: <h s% l%>; --input: <h s% l%>; --ring: <h s% l%>;
  --chart-1..5: <h s% l%>;
  --sidebar-background / -foreground / -primary / -accent / -border / -ring: <h s% l%>;
}
.dark { /* mismo set de variables, valores invertidos */ }
```

Estas variables alimentan `tailwind.config.ts` (`colors.background: 'hsl(var(--background))'`, etc.) y dan soporte automático a dark mode (`darkMode: ["class"]`) en toda la capa "sistema" (shadcn).

### 6.2 Color de marca / acento

- **Un único color de acento** se usa en toda la capa "marca": CTAs primarios, focus rings de inputs custom, estado activo de tabs/toggles, iconos destacados, hover de links de nav, borde de plan destacado en pricing.
- Se referencia como valor hexadecimal directo en componentes de marca (no como variable CSS) — patrón pragmático: `bg-[--brand-accent]` o simplemente una constante hex reusada. Recomendado para un proyecto nuevo: definir `--brand-accent` como variable CSS única y referenciarla igual que los demás tokens, en vez de hardcodear el hex repetidamente.
- El acento se usa **con moderación**: la interfaz es predominantemente blanco/negro/gris, y el acento aparece solo donde se quiere dirigir la atención (1-2 elementos por vista).

### 6.3 Escala neutra

- Base de toda la interfaz: escala `neutral` de Tailwind (no `gray` ni `slate`) — `neutral-50` a `neutral-950`.
- Texto principal: `neutral-950` (headings) / `neutral-900` (body fuerte).
- Texto secundario/muted: `neutral-500` / `neutral-600`.
- Texto terciario/deshabilitado: `neutral-400`.
- Fondos alternos de sección: `neutral-100`.
- Fondo de página: blanco puro.

### 6.4 Colores semánticos de estado

- Éxito: verde (fondo muy claro + texto/borde saturado, ej. patrón "pill" `bg-{verde-50} text-{verde-600} border-{verde-200}`).
- Error/destructivo: rojo, siempre con fallback accesible (`role="alert"` en mensajes de error de formularios).
- Advertencia/pendiente: ámbar/naranja distinto del acento de marca (para no confundir "pendiente" con "marca").
- Estos tres son los únicos colores "con significado" fuera del acento — se mantienen consistentes en toda la app (badges de estado de reserva/pago, alerts, banners).

### 6.5 Selección de texto

```css
::selection { background-color: {acento al 50% de opacidad}; color: white; }
```

---

## 7. Componentes base

### 7.1 Convención de nomenclatura (muy importante para mantener el sistema)

- **`PascalCase.tsx`** en `components/ui/` = componente de marca hecho a medida o wrapper enriquecido sobre un primitivo (`Button.tsx`, `Input.tsx`, `Modal.tsx`, `Switch.tsx`, `Tooltip.tsx`, `SlideToConfirm.tsx`, `Loading.tsx`, `FadeIn.tsx`, `PageTransition.tsx`).
- **`kebab-case.tsx` / `lowercase.tsx`** en `components/ui/` = primitivo shadcn/ui sin modificar o mínimamente tocado (`card.tsx`, `badge.tsx`, `dialog.tsx`, `select.tsx`, `dropdown-menu.tsx`, `table.tsx`, `pagination.tsx`, `checkbox.tsx`, `popover.tsx`, `chart.tsx`).
- Esta convención permite saber, con solo mirar el nombre del archivo, si un componente sigue el patrón "vanilla shadcn" (puedes regenerarlo con el CLI de shadcn sin miedo) o si tiene lógica/estilo propietario (no lo sobrescribas).

### 7.2 Botón

Dos sabores conviven:

**a) Botón "sistema" (cva + shadcn)** — usado en dashboards/formularios:

```
base: inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:ring-1 disabled:opacity-50 [&_svg]:size-4
variants: default | destructive | outline | secondary | ghost | link
sizes: default(h-9 px-4 py-2) | sm(h-8 px-3 text-xs) | lg(h-10 px-8) | icon(h-9 w-9)
```

**b) Botón CTA "marca"** — píldora con capa de acento desfasada detrás (efecto de "doble borde"), usado en navbar/hero/CTAs principales:

```html
<a class="group relative inline-flex items-center">
  <span
    class="absolute right-0 inset-y-0 w-[calc(100%-1.5rem)] rounded-xl bg-{acento}"
  />
  <span
    class="relative z-10 px-5 py-3 rounded-xl bg-neutral-950 text-white text-sm font-medium"
  >
    Texto del CTA
  </span>
  <span
    class="relative -left-px z-10 w-10 h-10 rounded-xl flex items-center justify-center text-black"
  >
    <ArrowIcon
      class="transition-transform duration-300 group-hover:-rotate-45"
    />
  </span>
</a>
```

El acento asoma solo por detrás del chip circular del ícono, dando la sensación de una "sombra de color" desplazada — es la firma visual más distintiva de los CTAs de marca.

**c) Botón pill simple** (secciones, pricing): `rounded-full py-3 px-8 text-sm font-semibold transition-colors` sobre fondo sólido (oscuro por defecto, acento si es el plan/opción destacada).

### 7.3 Card (base shadcn)

```
Card:        rounded-lg border bg-card text-card-foreground shadow-sm
CardHeader:  flex flex-col space-y-1.5 p-6
CardTitle:   text-2xl font-semibold leading-none tracking-tight
CardDesc:    text-sm text-muted-foreground
CardContent: p-6 pt-0
CardFooter:  flex items-center p-6 pt-0
```

Ver §8 para las variantes de card "de marca" (mucho más grandes/expresivas).

### 7.4 Input

```
h-10 w-full rounded-md border border-{border-color} bg-white px-3 py-2
text-[16px] md:text-sm  /* 16px en mobile evita zoom automático de iOS */
placeholder:text-{muted}
focus:outline-none focus:ring-0 focus:border-{border-color}  /* SIN ring de foco visible — el proyecto prioriza un look limpio sobre el foco por defecto del navegador; en un proyecto nuevo, considera reforzar accesibilidad con un focus-visible ring perceptible si el target incluye navegación por teclado intensiva */
transition-colors duration-200
```

- Label opcional arriba: `text-sm font-medium mb-1.5 block`.
- Error opcional abajo: `text-sm text-{error} mt-1.5`, con `role="alert"`.
- Estado error en el borde: `border-{error} focus:border-{error}`.

### 7.5 Switch (toggle)

Construido a mano sobre un `<input type="checkbox">` oculto (`peer sr-only`) + un track (`h-6 w-11 rounded-full bg-neutral-200`) + un thumb (`after:` pseudo-elemento circular blanco con borde, `after:transition-all`, se traduce con `peer-checked:after:translate-x-full`). El track cambia a color de acento con `peer-checked:bg-{acento}`.

### 7.6 Select / Dropdown / Popover / Tooltip

Todos vía Radix primitives + estilos shadcn estándar:

- Trigger: `h-9 rounded-md border px-3 py-2 text-sm shadow-sm`, chevron a la derecha (`ChevronDown` opacity-50).
- Content flotante: `rounded-md border bg-popover shadow-md`, animaciones de entrada/salida con `data-[state=open]:animate-in fade-in-0 zoom-in-95` + slide direccional según `data-[side]`.
- Tooltip: `bg-primary text-primary-foreground px-3 py-1.5 text-xs rounded-md`, mismas animaciones in/out.

### 7.7 Modal (custom, no-Radix)

Para modales de marca (más control visual que Radix Dialog):

- `createPortal` a `document.body`.
- Overlay: `fixed inset-0 bg-black/60 backdrop-blur-sm`, fade `opacity 0→1` en 0.2s.
- Panel: `max-w-2xl max-h-[90vh] rounded-2xl border shadow-2xl bg-white`, entrada `scale 0.96→1, y 10→0, opacity 0→1` con easing custom `[0.22, 1, 0.36, 1]` en 0.25s.
- Body con scroll interno: `overflow-y-auto max-h-[calc(90vh-80px)]`.
- Cierre con `Escape`, click en overlay, y botón `X` (`rounded-lg p-1 hover:bg-neutral-100`).
- Al abrir: lock de scroll del body (`overflow: hidden`) + compensación del ancho de scrollbar (`padding-right`) para que el layout no salte.
- Bonus PWA: cambia el `meta[theme-color]` y el `background-color` del body/html al color del overlay mientras el modal está abierto (para que la barra de estado del navegador mobile combine).

### 7.8 Dialog (Radix, shadcn)

Variante responsiva: **bottom-sheet/full-screen en mobile, modal centrado en desktop**.

```
mobile:  fixed inset-0, sin bordes, sin sombra, bg-white, overflow-y-auto
desktop: sm:centrado con translate -50%/-50%, sm:max-w-lg, sm:rounded-2xl,
         sm:border sm:shadow-lg
overlay: bg-white en mobile (sólido) → sm:bg-black/50 sm:backdrop-blur-sm en desktop
```

Botón de cierre: círculo `rounded-full p-1.5`, esquina superior derecha, opacidad 70%→100% en hover.

### 7.9 Tabla

Wrapper `overflow-auto`, `text-sm`, filas con `border-b` (excepto la última), footer con `bg-muted/50 font-medium`. Minimalista — la densidad de datos manda, no la decoración.

---

## 8. Tipología de cards

Milo usa **cinco tipos de card** claramente diferenciados por contexto:

### 8.1 Data card / Stat card (dashboard)

Base shadcn `Card` + acento de **borde izquierdo de 4px** con color semántico + icono de tendencia en la esquina superior derecha del header + hover-lift (`hover:-translate-y-1 hover:shadow-md`, transición 300ms). Título en `text-sm uppercase tracking-widest` sobre el valor grande.

### 8.2 Feature card (marketing, tipo "bento")

`rounded-[32px] p-8`, sin borde, fondo sólido (puede ser oscuro, de acento o blanco según el peso visual deseado — alternar tonos entre cards del mismo grid para crear ritmo). Contenido interno con `group-hover:scale-105` para dar sensación de profundidad sin mover el card. Puede incluir mockups de producto (SVG/imagen de un dispositivo), gráficos decorativos SVG de fondo, o iconografía flotante con animación propia (`y: [0,-6,0]` infinito).

### 8.3 Pricing card

`rounded-[24px] p-6`, fondo `neutral-100` (plan estándar) o `neutral-950 + ring-2 ring-{acento}` (plan destacado) con badge flotante centrado en el borde superior (`-top-3`, `rounded-full px-3 py-1 text-[10px]`). Lista de features con icono `Check` + texto, precio en `text-4xl font-semibold` + periodo en texto muted pequeño al lado. CTA al fondo, siempre `rounded-full`.

### 8.4 List-item card (listado tipo Airbnb — negocio/producto/entidad)

Sin fondo ni borde propio — la "card" es solo la composición de imagen + texto, `flex flex-col gap-3`. Imagen: `aspect-square rounded-[16px] overflow-hidden`, con `group-hover:scale-105` en la imagen (nunca en el texto). Badges flotantes sobre la imagen (favorito, "última visita") con `absolute top-3 right-3` / `left-3`, fondo `white/90 backdrop-blur-md rounded-full`. Debajo: título `font-semibold text-[15px]` + rating con icono inline SVG + subtítulos en `text-[#717171]`-equivalente (gris medio) truncados a una línea.

### 8.5 Floating notification card (decorativo, mockups de hero)

`absolute`, `bg-white rounded-xl p-2`, sombra de dos capas (ver §4.2), animación de flotación infinita (`y: [0,-6,0]`, 3.5s, delay escalonado entre cards), aparece después del contenido principal (`delay` alto, ~1.2s) para no competir con la entrada del hero.

**Regla de decisión rápida**: ¿el card vive en un dashboard/panel de datos? → tipo 8.1. ¿Vende una capacidad del producto? → 8.2. ¿Vende un plan/precio? → 8.3. ¿Es un ítem de una grilla de resultados/listado? → 8.4. ¿Es puramente decorativo/ilustrativo? → 8.5.

---

## 9. Navegación

### 9.1 Navbar de escritorio — "flotante"

- No ocupa el ancho completo ni está pegado al borde superior: `fixed top-2.5 left-0 right-0 mx-auto w-full max-w-5xl`, contenedor `bg-white rounded-b-[2rem]` con sombra difusa custom (§4.2).
- Altura fija `h-20`.
- Logo a la izquierda, nav central (links + un dropdown "Más" para los que no caben), zona de auth/perfil a la derecha.
- Estado de carga: skeletons pill (`h-8 rounded-full bg-neutral-100 animate-pulse`) en vez de spinners, del mismo tamaño aproximado que el contenido final — evita layout shift y da sensación de continuidad.
- Dropdown de perfil: panel `w-64 rounded-2xl border py-3`, secciones separadas por `border-t border-neutral-100`, header con nombre + email enmascarado (`ej***@dominio.com` — nunca mostrar el email completo en UI de navegación).
- Por debajo del breakpoint de colapso (`max-[850px]`), la navbar pasa a ancho completo sin márgenes (`rounded-none` salvo la esquina inferior) y el nav central se reemplaza por un botón hamburguesa animado (☰ ↔ ✕ con `AnimatePresence mode="wait"` y rotación).

### 9.2 Menú mobile — panel full-screen (no drawer lateral)

- Ocupa **toda la pantalla** (`fixed inset-0 bg-white`), entra deslizando desde arriba (`y: "-100%" → 0`, 0.45s, easing `[0.22,1,0.36,1]`) — no es un drawer lateral ni un dropdown pequeño.
- Header con avatar/saludo personalizado + botón de cierre.
- Secciones agrupadas por encabezados `text-base font-extrabold uppercase tracking-wider` (ej. "Mi Perfil", "Panel Administrativo"), separadas por `border-t border-neutral-100 mt-6 pt-6`.
- Cada item de nav es una fila `flex justify-between py-3 text-lg font-medium`, con un `ChevronRight` a la derecha únicamente si está activo (indicador de "estás aquí" en vez de highlight de fondo).
- Items entran con stagger (`delay: 0.16 + i * 0.06`) para dar sensación de lista "cayendo" en cascada.
- CTA de conversión al final para usuarios sin sesión (mismo patrón de píldora con acento desfasado que en desktop).

### 9.3 Sidebar de administración (dashboard)

- Layout de dos columnas en desktop (`flex md:flex-row`), sidebar + `main` con `max-w-[1600px] mx-auto`.
- En mobile, el sidebar se sustituye por la navbar global superior (mismo componente que landing, versión compacta) — no hay dos sistemas de navegación distintos, uno se oculta cuando el otro está visible (`min-[850px]:hidden` / opuesto).
- Banner de estado de cuenta/plan (si aplica) como franja horizontal encima del contenido, antes del sidebar+main.

---

## 10. Motion / animación

### 10.1 Curva de easing "firma"

```
ease: [0.22, 1, 0.36, 1]   // "salida rápida, llegada suave" — usar en CASI TODO
ease: [0.25, 0.1, 0.25, 1] // alternativa para headers/hero (variante equivalente)
```

Reutilizar esta curva en el 90% de las transiciones da coherencia perceptual al motion de toda la app, incluso entre componentes hechos por distintas personas/momentos.

### 10.2 Patrones estándar de entrada

**Fade + slide-up al hacer scroll (reveal)**:

```js
initial={{ opacity: 0, y: 20-24 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
transition={{ duration: 0.5-1.2, ease: [0.22,1,0.36,1] }}
```

**Stagger de children (hero, listas)**:

```js
const container = { hidden: {}, show: { transition: { staggerChildren: 0.14, delayChildren: 0.25 } } };
const item = { hidden: { opacity: 0, filter: "blur(12px)", y: 16 }, show: { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.65, ease: [...] } } };
```

El uso de `filter: blur()` animado (no solo opacity/y) en el hero es un detalle distintivo — el texto "enfoca" al aparecer, no solo se desliza.

**Modal/dialog (scale + fade + y)**:

```js
initial={{ opacity: 0, scale: 0.96, y: 10 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.96, y: 10 }}
transition={{ duration: 0.25, ease: [0.22,1,0.36,1] }}
```

**Dropdown/menú pequeño (scale + y corto)**:

```js
initial={{ opacity: 0, y: -8, scale: 0.97 }}
animate={{ opacity: 1, y: 0, scale: 1 }}
transition={{ duration: 0.16 }}
```

**Acordeón (FAQ)**: animar `height: 0→"auto"` + `opacity` juntos, `AnimatePresence initial={false}`, 0.22s.

**Page transition (cambio de ruta)**: `opacity 0→1`, `y: 20→0` al entrar / `y: 0→-20` al salir, 0.4s.

**Flotación infinita (elementos decorativos)**: `y: [0,-6,0]`, `duration: 3.5`, `repeat: Infinity`, `ease: "easeInOut"`, con `delay` distinto por elemento para que no floten sincronizados.

**Marquee infinito (logos/badges)**: contenido duplicado 3-4 veces en el DOM + `animate={{ x: ["0%","-25%"] }}` (el porcentaje = `1/n_copias`), `repeat: Infinity`, `duration: 20`, `ease: "linear"`, envuelto en un contenedor con `mask-image` de fade en los bordes.

**Slide-to-confirm** (confirmación de acción crítica, ej. reservar/pagar): track `h-14 rounded-full bg-neutral-100`, thumb circular arrastrable con `drag="x"` + `dragConstraints` medidos dinámicamente por `ResizeObserver`/`offsetWidth`, snap-back con física de resorte (`type: "spring", stiffness: 400, damping: 40`) si no llega al final, ícono de check con rotación de entrada al completarse. Patrón reservado para acciones irreversibles/de alto compromiso — no usar para toggles comunes.

### 10.3 Cuándo usar GSAP en vez de Framer Motion

Framer Motion cubre el 90% de los casos (declarativo, integrado con React). Reservar GSAP + `@gsap/react` (`useGSAP` hook) para: timelines con múltiples fases encadenadas con control fino de scrubbing, animaciones ligadas a scroll (ScrollTrigger), o split-text/carácter-por-carácter. Lenis se usa junto a GSAP para smooth-scroll cuando hay animaciones ligadas a la posición de scroll.

### 10.4 Keyframes CSS custom (para lo que framer-motion no cubre bien: loops de fondo, toasts imperativos)

```css
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
@keyframes marquee {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-50%);
  }
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes enter {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
@keyframes leave {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
}
@keyframes fall {
  /* partículas cayendo en fondos de auth: translate3d + rotate, opacity in/out en los extremos */
}
```

### 10.5 Loading global

Overlay de pantalla completa (`fixed inset-0 z-[9999] bg-white`) con el **logo de marca en SVG animado**: escala pulsante (`scale: [1,1.05,1]`, `opacity: [.8,1,.8]`, loop infinito 2s) en el contenedor, y las piezas internas del logo (paths SVG) entrando con su propio desplazamiento/opacidad escalonados — el logo "se arma" en vez de solo girar como un spinner genérico. Usar esto en vez de un spinner circular estándar siempre que el tiempo de carga sea perceptible (auth, transición inicial de la app).

---

## 11. Iconografía

- **Una sola librería en todo el proyecto**: `lucide-react`. No mezclar con otro set de iconos salvo casos imposibles de cubrir (ver excepción abajo).
- Tamaños estándar: `h-4 w-4` (inline con texto pequeño/botones), `h-5 w-5` (botones normales/nav), `h-3.5 w-3.5` (badges/meta chico).
- Excepción: logos de marca de terceros (WhatsApp, Gmail, tarjetas de pago) y el ícono de estrella de rating se implementan como **SVG inline a medida**, porque lucide no tiene wordmarks de terceros ni el path exacto de estrella deseado. Mantener estos SVGs como componentes pequeños dedicados (`<WhatsAppIcon/>`, `<GmailIcon/>`), no inline repetido.
- Iconos siempre `aria-hidden="true"` cuando son puramente decorativos junto a texto que ya describe la acción.

---

## 12. Estados de carga

- **Skeletons "de forma"**: en vez de spinners genéricos, renderizar placeholders del mismo tamaño/forma que el contenido final (`bg-neutral-100 rounded-full animate-pulse` del ancho aproximado de un botón/avatar). Reduce el layout shift percibido y comunica qué está por aparecer.
- **Loading global de pantalla completa**: ver §10.5 — reservado para transiciones de app completa (auth, primer render).
- **Loading local/inline**: `Loader2` de lucide con `animate-spin`, para acciones puntuales dentro de un botón o componente pequeño (ej. slide-to-confirm mientras procesa).

---

## 13. Feedback (toasts / confirmaciones)

- Toast global del sistema: `react-hot-toast`, posicionado `top-center`.
- Toasts custom puntuales (éxito/error contextual, ej. favoritos): componente propio vía `createPortal` a `document.body`, **pill flotante en la parte inferior** (`fixed bottom-[max(2rem,env(safe-area-inset-bottom))]`, respeta el safe-area de iOS), `bg-zinc-900 text-white rounded-full px-6 py-3`, icono de estado (`CheckCircle` verde para éxito) + mensaje, entrada `y:50→0 scale:.9→1`, salida `y:0→20 scale:1→.9`.
- Confetti (`canvas-confetti`) para micro-celebraciones en confirmaciones de alto valor (reserva/pago completado) — usar con moderación, solo en el paso final de un flujo importante.

---

## 14. Accesibilidad

- `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2` en elementos interactivos custom clave (ej. cards clicables completas vía `<Link>`).
- `aria-label` en todo botón icon-only (menú, cerrar, favoritos).
- `aria-expanded` en triggers de menús/acordeones.
- `role="alert"` en mensajes de error de formulario.
- `aria-hidden="true"` en SVGs/iconos decorativos junto a texto redundante.
- Nota de mejora para un proyecto nuevo: varios inputs custom suprimen el ring de foco nativo (`focus:ring-0`) por estética — si el público objetivo depende fuertemente de navegación por teclado, sustituir por un estado de foco visible pero estilizado (ej. cambio de `border-color` + sombra sutil) en vez de eliminarlo por completo.
- Reducción de movimiento: no se detectó manejo explícito de `prefers-reduced-motion`; se recomienda añadirlo en un proyecto nuevo dado el uso extensivo de motion.

---

## 15. Meta / viewport / PWA-like touches

```ts
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "{fondo-marca}",
};
```

- `userScalable: false` + `maximumScale: 1` — la app se comporta como una app nativa, sin zoom por pinch (coherente con el resto de decisiones "app-like": navbar flotante, menú full-screen, safe-area insets en toasts).
- `viewportFit: "cover"` + uso de `env(safe-area-inset-bottom)` — soporte explícito para notch/home-indicator de iOS.
- El color de `theme-color` se actualiza dinámicamente (ver Modal §7.7) para que la barra de estado del navegador combine con overlays oscuros mientras hay un modal abierto.

---

## 16. Checklist para levantar un proyecto Milo desde cero

1. Next.js App Router + Tailwind + shadcn (`style: new-york`, `baseColor: neutral`, `cssVariables: true`).
2. Definir tokens de color en `:root`/`.dark` (HSL) siguiendo §6.1, más una variable propia `--brand-accent` para el acento único de marca.
3. Cargar fuente body vía `next/font/google` (pesos 300–800) + registrar `font-sans` = body en `tailwind.config.ts`; aplicar a `body` y `h1-h4` en globals.css.
4. Configurar `borderRadius` con `--radius: 0.5rem` (capa sistema) y usar valores arbitrarios (`rounded-[32px]`, `rounded-full`, etc.) libremente en componentes de marca (capa marca) — no intentar forzar todo a la escala de tokens.
5. Instalar `framer-motion`; crear helpers reutilizables `FadeIn`, `PageTransition` con la curva de easing firma `[0.22,1,0.36,1]`.
6. Construir el `Button` con `cva` (variantes sistema) + un segundo patrón de CTA "píldora con acento desfasado" para marketing (§7.2b).
7. Construir `Modal` custom (portal + framer-motion + scroll-lock) para superficies de marca, y mantener `Dialog` de shadcn/Radix para formularios/utilidad.
8. Definir las 5 tipologías de card (§8) como componentes o al menos como convención documentada de clases.
9. Armar navbar flotante + menú mobile full-screen (§9) como el esqueleto de navegación principal.
10. Instalar `lucide-react` como única librería de iconos; crear una carpeta `icons/` solo para wordmarks de terceros que lucide no cubre.
11. Configurar `react-hot-toast` global + (opcional) toast pill custom para casos puntuales.
12. Añadir keyframes custom de §10.4 a `tailwind.config.ts`/`globals.css` según se necesiten (shimmer, marquee, enter/leave, fadeInUp).
13. Aplicar meta viewport "app-like" de §15 si el producto se navega mayormente desde mobile.
14. Revisar accesibilidad de foco antes de replicar `focus:ring-0` en inputs custom — decidir conscientemente, no por copiar-pegar.
