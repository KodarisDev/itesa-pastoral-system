"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AlertTriangle, ArrowRight, Check, Loader2, Search, Upload } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { validarRosterCuarto, ejecutarPromocion } from "@/lib/actions/students.actions";
import type { Estudiante } from "@/types";

interface PromocionManagerProps {
  estudiantes: Estudiante[];
}

function iniciales(e: Estudiante) {
  return `${e.nombre?.[0] ?? ""}${e.apellido?.[0] ?? ""}`.toUpperCase() || "?";
}

function colorPorGrado(curso: string | null) {
  if (curso?.startsWith("4")) return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
  if (curso?.startsWith("5")) return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
  if (curso?.startsWith("6")) return "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300";
  return "bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-300";
}

export function PromocionManager({ estudiantes }: PromocionManagerProps) {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const [validating, setValidating] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [validated, setValidated] = useState(false);
  const [idsNoPasaron, setIdsNoPasaron] = useState<Set<number>>(new Set());
  const [confirmStep, setConfirmStep] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "success" | "error"; texto: string } | null>(null);

  const estudiantesFiltrados = useMemo(() => {
    const term = busqueda.toLowerCase();
    return estudiantes.filter(
      (e) =>
        `${e.nombre} ${e.apellido}`.toLowerCase().includes(term) ||
        e.matricula.toLowerCase().includes(term) ||
        (e.curso ?? "").toLowerCase().includes(term),
    );
  }, [busqueda, estudiantes]);

  const agrupados = useMemo(() => {
    return estudiantesFiltrados.reduce<Record<string, Estudiante[]>>((acc, e) => {
      const grado = e.curso?.[0] ?? "?";
      (acc[grado] ??= []).push(e);
      return acc;
    }, {});
  }, [estudiantesFiltrados]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSelectedFile(e.target.files?.[0] ?? null);
    setValidated(false);
    setIdsNoPasaron(new Set());
    setMensaje(null);
  }

  function handleValidate() {
    if (!selectedFile) {
      setMensaje({ tipo: "error", texto: "Selecciona primero un archivo .xlsx con los 7 cursos de 4to." });
      return;
    }
    setValidating(true);
    setMensaje(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("archivo", selectedFile);
      const res = await validarRosterCuarto(formData);
      setValidating(false);
      if (!res.ok) {
        setValidated(false);
        setMensaje({ tipo: "error", texto: res.error });
        return;
      }
      setValidated(true);
      const avisoDuplicadas =
        res.data.duplicadas.length > 0
          ? ` Atención: ${res.data.duplicadas.length} matrícula(s) repetida(s) en el archivo (se usó solo la primera aparición) — revísalas: ${res.data.duplicadas.slice(0, 5).join(", ")}.`
          : "";
      setMensaje({
        tipo: "success",
        texto: `Archivo validado: ${res.data.filas.length} estudiante(s) nuevo(s) de 4to. Ahora marca abajo quiénes no pasan antes de ejecutar la promoción.${avisoDuplicadas}`,
      });
    });
  }

  function toggleNoPasa(id: number) {
    setIdsNoPasaron((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openConfirmation() {
    if (!validated || !selectedFile) {
      setMensaje({ tipo: "error", texto: "Primero valida el archivo antes de ejecutar la promoción." });
      return;
    }
    setConfirmStep(0);
    setConfirmOpen(true);
  }

  function handleConfirmNext() {
    if (confirmStep < 2) {
      setConfirmStep((s) => s + 1);
      return;
    }
    handleExecute();
  }

  function handleExecute() {
    if (!selectedFile) return;
    setProcessing(true);
    setMensaje(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("archivo", selectedFile);
      idsNoPasaron.forEach((id) => formData.append("idsNoPasaron", String(id)));

      const res = await ejecutarPromocion(formData);
      setProcessing(false);
      if (!res.ok) {
        toast.error(res.error);
        setConfirmOpen(false);
        return;
      }
      const avisoDuplicadas =
        res.data.duplicadas.length > 0
          ? ` Matrículas repetidas ignoradas (solo se cargó la primera): ${res.data.duplicadas.join(", ")}.`
          : "";
      setMensaje({
        tipo: "success",
        texto: `Promoción completada: ${res.data.promovidos} estudiante(s) promovido(s), ${res.data.desactivados} desactivado(s), ${res.data.procesados} estudiante(s) de 4to procesado(s).${avisoDuplicadas}`,
      });
      setValidated(false);
      setSelectedFile(null);
      setIdsNoPasaron(new Set());
      setConfirmOpen(false);
      setConfirmStep(0);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {mensaje && (
        <div
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
            mensaje.tipo === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200"
          }`}
        >
          {mensaje.tipo === "success" ? (
            <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          <span className="font-medium">{mensaje.texto}</span>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white">1. Validar listado de 4to nuevo</h2>
        <p className="mb-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
          Sube el Excel oficial con las 7 hojas (4A a 4G, formato de la lista del instituto). Solo se aceptan archivos{" "}
          <code>.xlsx</code>.
        </p>

        <label className="flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/70 p-5 dark:border-neutral-700 dark:bg-neutral-950/40">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-500">
            <Upload className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-gray-800 dark:text-gray-100">Archivo Excel</span>
            <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
              {selectedFile ? selectedFile.name : "Todavía no has seleccionado un archivo."}
            </span>
          </div>
          <input type="file" accept=".xlsx" onChange={handleFileChange} className="hidden" />
          <span
            className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #c0392b, #922b21)" }}
          >
            Elegir
          </span>
        </label>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Button onClick={handleValidate} disabled={validating || isPending || !selectedFile} variant="outline">
            {validating && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Validar archivo
          </Button>
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-600 dark:border-neutral-700 dark:bg-neutral-800/70 dark:text-gray-300">
            {validated ? <Check className="h-4 w-4" aria-hidden="true" /> : <AlertTriangle className="h-4 w-4" aria-hidden="true" />}
            {validated ? "Archivo validado y listo para ejecutar." : "Aún no hay un archivo validado."}
          </div>
        </div>
      </div>

      {validated && (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex flex-col gap-3 border-b border-gray-100 p-4 dark:border-neutral-800 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">2. Marcar quiénes ya no estudian</h2>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                Estudiantes activos actuales (4to, 5to y 6to). Marca a quienes deben quedar inactivos en vez de promoverse.
              </p>
            </div>
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800 lg:ml-auto lg:max-w-sm">
              <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, matrícula o curso..."
                className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400 dark:text-gray-200 dark:placeholder-gray-500"
              />
            </div>
            <Badge variant="destructive" className="shrink-0">
              {idsNoPasaron.size} marcado(s) para inactivar
            </Badge>
          </div>

          <div className="max-h-[520px] space-y-4 overflow-y-auto p-4">
            {Object.entries(agrupados)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([grado, lista]) => (
                <div key={grado}>
                  <div className="mb-2 px-1 text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                    {grado}to
                  </div>
                  <div className="space-y-2">
                    {lista
                      .slice()
                      .sort((a, b) => (a.numero ?? 0) - (b.numero ?? 0))
                      .map((e) => {
                        const selected = idsNoPasaron.has(e.id_estudiante);
                        return (
                          <button
                            key={e.id_estudiante}
                            type="button"
                            onClick={() => toggleNoPasa(e.id_estudiante)}
                            className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                              selected
                                ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                                : "border-gray-100 bg-gray-50/70 hover:border-red-200 dark:border-neutral-800 dark:bg-neutral-950/40 dark:hover:border-red-900"
                            }`}
                          >
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className={colorPorGrado(e.curso)}>{iniciales(e)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p
                                className={`truncate text-sm font-semibold ${selected ? "text-red-700 dark:text-red-400" : "text-gray-800 dark:text-gray-200"}`}
                              >
                                {e.apellido}, {e.nombre}
                              </p>
                              <p className="truncate text-xs text-gray-400 dark:text-gray-500">{e.matricula}</p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-xs font-bold text-red-600 dark:text-red-400">{e.curso}</p>
                              {e.numero != null && <p className="text-[11px] text-gray-400 dark:text-gray-500">#{e.numero}</p>}
                            </div>
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                selected ? "border-red-600 bg-red-600" : "border-gray-300 dark:border-neutral-700"
                              }`}
                            >
                              {selected && <span className="h-2 w-2 rounded-full bg-white" />}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={openConfirmation} disabled={processing || !validated}>
          {processing && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Ejecutar promoción
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={(v) => !processing && setConfirmOpen(v)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar promoción — paso {confirmStep + 1} de 3</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((step) => (
                    <div key={step} className={`h-1.5 rounded-full ${step <= confirmStep ? "bg-red-600" : "bg-gray-200 dark:bg-neutral-800"}`} />
                  ))}
                </div>

                {confirmStep === 0 && (
                  <p>
                    Se ejecutará la promoción general: primero se promueven o desactivan los estudiantes actuales de 4to/5to/6to, luego
                    se carga el Excel de 4to nuevo validado.
                  </p>
                )}
                {confirmStep === 1 && (
                  <p>
                    Estudiantes marcados para inactivar: <strong>{idsNoPasaron.size}</strong>. Estos NO se promueven, quedan inactivos en
                    su curso actual. Revisa la selección si este número no coincide con lo esperado.
                  </p>
                )}
                {confirmStep === 2 && (
                  <p className="font-semibold text-red-700 dark:text-red-400">
                    Acción permanente: esta operación actualiza estudiantes existentes y procesa &quot;{selectedFile?.name}&quot;. No hay
                    deshacer automático desde esta pantalla.
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmNext();
              }}
              disabled={processing}
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {processing ? "Ejecutando..." : confirmStep < 2 ? "Continuar" : "Ejecutar definitivamente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
