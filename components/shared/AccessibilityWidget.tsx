"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Accessibility,
  AlignLeft,
  ArrowLeftRight,
  Baseline,
  Brain,
  Contrast,
  Droplet,
  EyeOff,
  ImageOff,
  Info,
  Link2,
  ListTree,
  MousePointer2,
  MoveHorizontal,
  Palette,
  PauseCircle,
  RotateCcw,
  SpellCheck2,
  SunMoon,
  Target,
  Type,
  Volume2,
  VolumeX,
  X,
  ZapOff,
  ZoomIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  A11Y_PROFILES,
  DEFAULT_A11Y_SETTINGS,
  TEXT_SIZE_STEPS,
  applyA11ySettings,
  isProfileActive,
  loadA11ySettings,
  resetA11yDom,
  saveA11ySettings,
  type A11ySettings,
} from "@/lib/accessibility";

const PROFILE_ICONS: Record<string, typeof Accessibility> = {
  motora: Accessibility,
  ceguera: EyeOff,
  daltonismo: Palette,
  dislexia: SpellCheck2,
  vision_baja: ZoomIn,
  cognitivo: Brain,
  convulsiones: ZapOff,
  tdah: Target,
};

type ToggleKey = keyof Pick<
  A11ySettings,
  | "contrastPlus"
  | "smartContrast"
  | "highlightLinks"
  | "textSpacing"
  | "stopAnimations"
  | "hideImages"
  | "dyslexiaFont"
  | "bigCursor"
  | "infoTooltips"
  | "lineHeight"
  | "textAlignLeft"
  | "saturationLow"
>;

interface FeatureTile {
  key: ToggleKey;
  icon: typeof Accessibility;
  label: string;
}

const FEATURES: FeatureTile[] = [
  { key: "contrastPlus", icon: Contrast, label: "Contraste +" },
  { key: "smartContrast", icon: SunMoon, label: "Contraste inteligente" },
  { key: "highlightLinks", icon: Link2, label: "Resaltar enlaces" },
  { key: "textSpacing", icon: MoveHorizontal, label: "Espaciado de texto" },
  { key: "stopAnimations", icon: PauseCircle, label: "Detener animaciones" },
  { key: "hideImages", icon: ImageOff, label: "Ocultar imágenes" },
  { key: "dyslexiaFont", icon: SpellCheck2, label: "Apto para dislexia" },
  { key: "bigCursor", icon: MousePointer2, label: "Cursor grande" },
  { key: "infoTooltips", icon: Info, label: "Información" },
  { key: "lineHeight", icon: Baseline, label: "Altura de línea" },
  { key: "textAlignLeft", icon: AlignLeft, label: "Texto alineado" },
  { key: "saturationLow", icon: Droplet, label: "Saturación" },
];

function getAccessibleName(el: Element): string {
  const aria = el.getAttribute("aria-label");
  if (aria) return aria;
  if (el instanceof HTMLImageElement && el.alt) return el.alt;
  const title = el.getAttribute("title");
  if (title) return title;
  const text = (el as HTMLElement).innerText?.trim();
  return text ? text.slice(0, 80) : "";
}

function slugifyHeading(text: string, index: number) {
  const base = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `a11y-heading-${base || "seccion"}-${index}`;
}

export function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [profilesOpen, setProfilesOpen] = useState(true);
  const [structureOpen, setStructureOpen] = useState(false);
  const [settings, setSettings] = useState<A11ySettings>(DEFAULT_A11Y_SETTINGS);
  const [speaking, setSpeaking] = useState(false);
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
  const [guideY, setGuideY] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const mounted = useRef(false);

  useEffect(() => {
    setSettings(loadA11ySettings());
    mounted.current = true;
  }, []);

  useEffect(() => {
    if (!mounted.current) return;
    applyA11ySettings(settings);
    saveA11ySettings(settings);
  }, [settings]);

  useEffect(() => {
    return () => resetA11yDom();
  }, []);

  // Atajo global Alt+A para abrir/cerrar, Escape para cerrar
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.altKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      panelRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    } else {
      triggerRef.current?.focus();
    }
  }, [open]);

  // Guía de lectura: barra horizontal que sigue el cursor
  useEffect(() => {
    if (!settings.readingGuide) {
      setGuideY(null);
      return;
    }
    let raf = 0;
    function onMove(e: MouseEvent) {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setGuideY(e.clientY));
    }
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [settings.readingGuide]);

  // Tooltips de información accesible bajo el cursor
  useEffect(() => {
    if (!settings.infoTooltips) {
      setTooltip(null);
      return;
    }
    function onMove(e: MouseEvent) {
      const target = (e.target as Element)?.closest?.(
        "a, button, [role='button'], input, select, textarea, img",
      );
      if (!target || target.closest("#a11y-widget-root")) {
        setTooltip(null);
        return;
      }
      const text = getAccessibleName(target);
      if (!text) {
        setTooltip(null);
        return;
      }
      setTooltip({ x: e.clientX, y: e.clientY, text });
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [settings.infoTooltips]);

  // Detener el habla si se cierra/recarga el widget
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  function toggle(key: ToggleKey) {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  }

  function cycleTextSize() {
    setSettings((s) => ({ ...s, textSize: ((s.textSize + 1) % 3) as 0 | 1 | 2 }));
  }

  function toggleProfile(profileId: string) {
    const profile = A11Y_PROFILES.find((p) => p.id === profileId);
    if (!profile) return;
    const active = isProfileActive(settings, profile);
    setSettings((s) => {
      const next = { ...s };
      (Object.keys(profile.patch) as (keyof typeof profile.patch)[]).forEach((key) => {
        if (key === "textSize") {
          next.textSize = active ? 0 : profile.patch.textSize ?? 0;
          return;
        }
        next[key as ToggleKey] = !active;
      });
      return next;
    });
  }

  function handleReset() {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setSettings(DEFAULT_A11Y_SETTINGS);
  }

  function toggleReadPage() {
    if (speaking) {
      window.speechSynthesis?.cancel();
      setSpeaking(false);
      return;
    }
    const text = document.querySelector("main")?.textContent || document.body.textContent || "";
    if (!text.trim() || typeof window.speechSynthesis === "undefined") return;
    const utterance = new SpeechSynthesisUtterance(text.replace(/\s+/g, " ").trim());
    utterance.lang = "es-ES";
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  function toggleStructure() {
    const next = !structureOpen;
    setStructureOpen(next);
    if (next) {
      const nodes = Array.from(document.querySelectorAll<HTMLElement>("main h1, main h2, main h3"));
      setHeadings(
        nodes.map((node, i) => {
          if (!node.id) node.id = slugifyHeading(node.textContent || "", i);
          return { id: node.id, text: (node.textContent || "").trim(), level: Number(node.tagName[1]) };
        }),
      );
    }
  }

  function jumpToHeading(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setOpen(false);
  }

  const activeCount = useMemo(
    () =>
      FEATURES.filter((f) => settings[f.key]).length +
      (settings.textSize > 0 ? 1 : 0) +
      (settings.readingGuide ? 1 : 0),
    [settings],
  );

  const positionSide = settings.position;
  const sideClass = positionSide === "left" ? "left-4" : "right-4";
  const panelSideClass = positionSide === "left" ? "left-4" : "right-4";

  return (
    <div id="a11y-widget-root">
      {settings.readingGuide && guideY !== null && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 z-[9997]"
          style={{
            top: guideY - 22,
            height: 44,
            background: "rgba(192, 57, 43, 0.10)",
            borderTop: "2px solid rgba(192, 57, 43, 0.55)",
            borderBottom: "2px solid rgba(192, 57, 43, 0.55)",
          }}
        />
      )}

      {tooltip && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-[9997] max-w-[240px] rounded-lg bg-neutral-900 px-3 py-1.5 text-xs text-white shadow-lg"
          style={{ left: tooltip.x + 14, top: tooltip.y + 14 }}
        >
          {tooltip.text}
        </div>
      )}

      {!open && settings.hidden && (
        <button
          type="button"
          onClick={() => setSettings((s) => ({ ...s, hidden: false }))}
          aria-label="Mostrar el widget de accesibilidad"
          title="Mostrar el widget de accesibilidad"
          className={cn(
            "fixed bottom-4 z-[9998] flex h-9 w-9 items-center justify-center rounded-full text-white opacity-60 shadow-md transition-opacity hover:opacity-100",
            sideClass,
          )}
          style={{ background: "linear-gradient(135deg, #c0392b, #7f0000)" }}
        >
          <Accessibility className="h-4 w-4" aria-hidden="true" />
        </button>
      )}

      {!open && !settings.hidden && (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú de accesibilidad"
          title="Menú de accesibilidad (Alt+A)"
          className={cn(
            "fixed bottom-4 z-[9998] flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
            sideClass,
          )}
          style={{ background: "linear-gradient(135deg, #c0392b, #7f0000)" }}
        >
          <Accessibility className="h-7 w-7" aria-hidden="true" />
          {activeCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-950 text-[10px] font-bold text-white ring-2 ring-white dark:ring-neutral-950">
              {activeCount}
            </span>
          )}
        </button>
      )}

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label="Menú de accesibilidad"
          className={cn(
            "fixed bottom-4 z-[9998] flex max-h-[85vh] w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-neutral-900",
            panelSideClass,
            settings.panelLarge && "text-[15px]",
          )}
        >
          <div
            className="flex shrink-0 items-center justify-between px-5 py-4 text-white"
            style={{ background: "linear-gradient(135deg, #c0392b, #7f0000)" }}
          >
            <div>
              <p className="text-sm font-semibold">Menú de accesibilidad</p>
              <p className="text-[11px] text-white/75">Atajo: Alt + A</p>
            </div>
            <button
              type="button"
              data-autofocus
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú de accesibilidad"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/25"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <label className="mb-4 flex items-center justify-between rounded-2xl bg-neutral-50 px-4 py-3 dark:bg-neutral-800">
              <span className="text-sm font-medium text-neutral-700 dark:text-gray-200">Widget de gran tamaño</span>
              <MiniSwitch
                checked={settings.panelLarge}
                onChange={(v) => setSettings((s) => ({ ...s, panelLarge: v }))}
              />
            </label>

            <button
              type="button"
              onClick={() => setProfilesOpen((v) => !v)}
              className="mb-2 flex w-full items-center justify-between text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-gray-400"
            >
              Perfiles de accesibilidad
              <span className={cn("transition-transform", profilesOpen && "rotate-180")}>⌄</span>
            </button>

            {profilesOpen && (
              <div className="mb-4 grid grid-cols-2 gap-2">
                {A11Y_PROFILES.map((profile) => {
                  const Icon = PROFILE_ICONS[profile.id] ?? Accessibility;
                  const active = isProfileActive(settings, profile);
                  return (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => toggleProfile(profile.id)}
                      aria-pressed={active}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-colors",
                        active
                          ? "border-brand bg-brand/10 text-brand"
                          : "border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:text-gray-300",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {profile.label}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mb-2 h-px bg-neutral-100 dark:bg-neutral-800" />

            <div className="grid grid-cols-3 gap-2 py-3">
              <FeatureButton
                icon={speaking ? VolumeX : Volume2}
                label={speaking ? "Detener lectura" : "Leer página"}
                active={speaking}
                onClick={toggleReadPage}
              />
              <FeatureButton
                icon={Type}
                label="Agrandar texto"
                active={settings.textSize > 0}
                badge={settings.textSize > 0 ? TEXT_SIZE_STEPS[settings.textSize] : undefined}
                onClick={cycleTextSize}
              />
              <FeatureButton
                icon={ListTree}
                label="Estructura de página"
                active={structureOpen}
                onClick={toggleStructure}
              />
              {FEATURES.map((f) => (
                <FeatureButton
                  key={f.key}
                  icon={f.icon}
                  label={f.label}
                  active={settings[f.key]}
                  onClick={() => toggle(f.key)}
                />
              ))}
            </div>

            {structureOpen && (
              <div className="mb-3 rounded-2xl border border-neutral-100 p-3 dark:border-neutral-800">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-gray-500">
                  Ir a una sección
                </p>
                {headings.length === 0 ? (
                  <p className="text-xs text-neutral-400 dark:text-gray-500">No se encontraron títulos en esta página.</p>
                ) : (
                  <ul className="max-h-40 space-y-1 overflow-y-auto">
                    {headings.map((h) => (
                      <li key={h.id}>
                        <button
                          type="button"
                          onClick={() => jumpToHeading(h.id)}
                          className="w-full truncate rounded-lg px-2 py-1.5 text-left text-xs text-neutral-600 hover:bg-neutral-50 dark:text-gray-300 dark:hover:bg-neutral-800"
                          style={{ paddingLeft: `${(h.level - 1) * 10 + 8}px` }}
                        >
                          {h.text}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="shrink-0 space-y-2 border-t border-neutral-100 px-4 py-3 dark:border-neutral-800">
            <button
              type="button"
              onClick={handleReset}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:border-brand hover:text-brand dark:border-neutral-700 dark:text-gray-300"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Restablecer configuración
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSettings((s) => ({ ...s, position: s.position === "left" ? "right" : "left" }))}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-medium text-neutral-500 hover:bg-neutral-50 dark:text-gray-400 dark:hover:bg-neutral-800"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden="true" />
                Cambiar posición
              </button>
              <button
                type="button"
                onClick={() => {
                  setSettings((s) => ({ ...s, hidden: true }));
                  setOpen(false);
                }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-medium text-neutral-500 hover:bg-neutral-50 dark:text-gray-400 dark:hover:bg-neutral-800"
              >
                <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                Ocultar widget
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureButton({
  icon: Icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: typeof Accessibility;
  label: string;
  active: boolean;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "relative flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-center text-[11px] font-medium leading-tight transition-colors",
        active
          ? "border-brand bg-brand text-white"
          : "border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-800",
      )}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      {label}
      {badge && (
        <span className="absolute right-1 top-1 rounded-full bg-neutral-950 px-1.5 py-0.5 text-[9px] font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  );
}

function MiniSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        checked ? "bg-brand" : "bg-neutral-200 dark:bg-neutral-700",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
