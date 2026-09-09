export interface A11ySettings {
  contrastPlus: boolean;
  smartContrast: boolean;
  highlightLinks: boolean;
  textSize: 0 | 1 | 2;
  textSpacing: boolean;
  lineHeight: boolean;
  textAlignLeft: boolean;
  stopAnimations: boolean;
  hideImages: boolean;
  dyslexiaFont: boolean;
  bigCursor: boolean;
  saturationLow: boolean;
  readingGuide: boolean;
  infoTooltips: boolean;
  largeTargets: boolean;
  position: "left" | "right";
  panelLarge: boolean;
  hidden: boolean;
}

export const DEFAULT_A11Y_SETTINGS: A11ySettings = {
  contrastPlus: false,
  smartContrast: false,
  highlightLinks: false,
  textSize: 0,
  textSpacing: false,
  lineHeight: false,
  textAlignLeft: false,
  stopAnimations: false,
  hideImages: false,
  dyslexiaFont: false,
  bigCursor: false,
  saturationLow: false,
  readingGuide: false,
  infoTooltips: false,
  largeTargets: false,
  position: "left",
  panelLarge: false,
  hidden: false,
};

export const A11Y_STORAGE_KEY = "itesa-a11y-settings-v1";

export const TEXT_SIZE_STEPS = ["100%", "113%", "128%"] as const;

type TogglableKey = Exclude<keyof A11ySettings, "textSize" | "position" | "panelLarge">;

export interface A11yProfile {
  id: string;
  label: string;
  patch: Partial<Record<TogglableKey, boolean>> & { textSize?: 0 | 1 | 2 };
}

export const A11Y_PROFILES: A11yProfile[] = [
  {
    id: "motora",
    label: "Discapacidad motora",
    patch: { bigCursor: true, largeTargets: true, textSize: 1 },
  },
  {
    id: "ceguera",
    label: "Ceguera",
    patch: { infoTooltips: true, highlightLinks: true },
  },
  {
    id: "daltonismo",
    label: "Daltonismo",
    patch: { contrastPlus: true, highlightLinks: true },
  },
  {
    id: "dislexia",
    label: "Dislexia",
    patch: { dyslexiaFont: true, textSpacing: true, lineHeight: true, textAlignLeft: true },
  },
  {
    id: "vision_baja",
    label: "Visión baja",
    patch: { textSize: 2, bigCursor: true, contrastPlus: true },
  },
  {
    id: "cognitivo",
    label: "Cognitivo y aprendizaje",
    patch: { stopAnimations: true, textAlignLeft: true, readingGuide: true },
  },
  {
    id: "convulsiones",
    label: "Convulsiones y epilépticos",
    patch: { stopAnimations: true, saturationLow: true },
  },
  {
    id: "tdah",
    label: "TDAH",
    patch: { readingGuide: true, stopAnimations: true },
  },
];

export function isProfileActive(settings: A11ySettings, profile: A11yProfile): boolean {
  return Object.entries(profile.patch).every(([key, value]) => settings[key as keyof A11ySettings] === value);
}

export function loadA11ySettings(): A11ySettings {
  if (typeof window === "undefined") return DEFAULT_A11Y_SETTINGS;
  try {
    const raw = window.localStorage.getItem(A11Y_STORAGE_KEY);
    if (!raw) return DEFAULT_A11Y_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_A11Y_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_A11Y_SETTINGS;
  }
}

export function saveA11ySettings(settings: A11ySettings) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // almacenamiento no disponible (modo privado, cuota llena) — degrada sin persistir
  }
}

export function applyA11ySettings(settings: A11ySettings) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;

  const classMap: Record<string, boolean> = {
    "a11y-highlight-links": settings.highlightLinks,
    "a11y-text-spacing": settings.textSpacing,
    "a11y-line-height": settings.lineHeight,
    "a11y-text-align-left": settings.textAlignLeft,
    "a11y-stop-animations": settings.stopAnimations,
    "a11y-hide-images": settings.hideImages,
    "a11y-dyslexia-font": settings.dyslexiaFont,
    "a11y-big-cursor": settings.bigCursor,
    "a11y-smart-contrast": settings.smartContrast,
    "a11y-large-targets": settings.largeTargets,
  };
  for (const [cls, on] of Object.entries(classMap)) {
    html.classList.toggle(cls, on);
  }

  const filters: string[] = [];
  if (settings.contrastPlus) filters.push("contrast(1.3) saturate(1.15)");
  if (settings.saturationLow) filters.push("saturate(0.35)");
  if (settings.smartContrast) filters.push("invert(1) hue-rotate(180deg)");
  html.style.filter = filters.join(" ");

  html.style.fontSize = TEXT_SIZE_STEPS[settings.textSize];
}

export function resetA11yDom() {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.style.filter = "";
  html.style.fontSize = "";
  [
    "a11y-highlight-links",
    "a11y-text-spacing",
    "a11y-line-height",
    "a11y-text-align-left",
    "a11y-stop-animations",
    "a11y-hide-images",
    "a11y-dyslexia-font",
    "a11y-big-cursor",
    "a11y-smart-contrast",
    "a11y-large-targets",
  ].forEach((cls) => html.classList.remove(cls));
}
