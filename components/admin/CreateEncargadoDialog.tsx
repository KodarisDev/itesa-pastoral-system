"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Plus, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usuarioEncargadoSchema } from "@/lib/validations/usuario.schema";
import { createUsuarioEncargado, buscarEstudianteParaEncargado } from "@/lib/actions/users.actions";
import { cn } from "@/lib/utils";
import type { Club } from "@/types";

const FORMATO_MATRICULA = /^\d{4}-\d{4}$/;

type TipoEncargado = "maestro" | "estudiante";

export function CreateEncargadoDialog({ clubes, idRolEncargado }: { clubes: Club[]; idRolEncargado: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [tipo, setTipo] = useState<TipoEncargado>("maestro");
  const [clubId, setClubId] = useState("");
  const [matricula, setMatricula] = useState("");
  const [principal, setPrincipal] = useState(true);
  const [password, setPassword] = useState("");
  const [nombreManual, setNombreManual] = useState("");
  const [estudianteEncontrado, setEstudianteEncontrado] = useState<{ nombre: string; apellido: string } | null>(null);
  const [buscandoMatricula, setBuscandoMatricula] = useState(false);
  const [matriculaError, setMatriculaError] = useState<string | null>(null);

  function reset() {
    setFieldErrors({});
    setTipo("maestro");
    setClubId("");
    setMatricula("");
    setPrincipal(true);
    setPassword("");
    setNombreManual("");
    setEstudianteEncontrado(null);
    setBuscandoMatricula(false);
    setMatriculaError(null);
  }

  // Autocompleta el nombre buscando la matrícula en vivo mientras el admin escribe.
  useEffect(() => {
    if (tipo !== "estudiante") return;
    const limpia = matricula.trim();
    setEstudianteEncontrado(null);
    setMatriculaError(null);
    if (!limpia) {
      setBuscandoMatricula(false);
      return;
    }
    if (!FORMATO_MATRICULA.test(limpia)) {
      setMatriculaError("Formato inválido. Usa el formato XXXX-XXXX.");
      setBuscandoMatricula(false);
      return;
    }
    setBuscandoMatricula(true);
    const timeout = setTimeout(async () => {
      const res = await buscarEstudianteParaEncargado(limpia);
      setBuscandoMatricula(false);
      if (!res.ok) {
        setMatriculaError(res.error);
        return;
      }
      if (!res.data) {
        setMatriculaError("No se encontró ningún estudiante con esa matrícula.");
        return;
      }
      setEstudianteEncontrado(res.data);
    }, 400);
    return () => clearTimeout(timeout);
  }, [matricula, tipo]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (tipo === "estudiante" && !estudianteEncontrado) {
      setFieldErrors((prev) => ({ ...prev, matricula: matriculaError ?? "Ingresa una matrícula válida." }));
      return;
    }

    const formData = new FormData(e.currentTarget);
    const nombreFinal =
      tipo === "estudiante" && estudianteEncontrado
        ? `${estudianteEncontrado.nombre} ${estudianteEncontrado.apellido}`
        : nombreManual;

    const raw = {
      nombre: nombreFinal,
      username: formData.get("username"),
      password,
      idRol: idRolEncargado,
      clubId,
      principal,
      matriculaEstudiante: tipo === "estudiante" ? matricula : "",
    };
    const parsed = usuarioEncargadoSchema.safeParse(raw);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        nombre: flat.nombre?.[0] ?? "",
        username: flat.username?.[0] ?? "",
        password: flat.password?.[0] ?? "",
        matricula: flat.matriculaEstudiante?.[0] ?? "",
      });
      return;
    }
    setFieldErrors({});
    formData.set("nombre", nombreFinal);
    formData.set("password", password);
    formData.set("idRol", String(idRolEncargado));
    formData.set("clubId", clubId);
    formData.set("principal", String(principal));
    formData.set("matriculaEstudiante", tipo === "estudiante" ? matricula : "");

    startTransition(async () => {
      const res = await createUsuarioEncargado(formData);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(`Encargado "${res.data.username}" creado correctamente.`);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nuevo encargado
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo encargado de club</DialogTitle>
          <DialogDescription>
            Crea una cuenta para que un estudiante o profesor pueda pasar lista y gestionar su club.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-6">
            <div>
              <Label>Tipo de encargado</Label>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTipo("maestro")}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                    tipo === "maestro"
                      ? "border-red-600 bg-red-50 text-red-700 dark:border-red-500 dark:bg-red-950/30 dark:text-red-400"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-neutral-700 dark:text-gray-400 dark:hover:bg-neutral-800",
                  )}
                >
                  Maestro
                </button>
                <button
                  type="button"
                  onClick={() => setTipo("estudiante")}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                    tipo === "estudiante"
                      ? "border-red-600 bg-red-50 text-red-700 dark:border-red-500 dark:bg-red-950/30 dark:text-red-400"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-neutral-700 dark:text-gray-400 dark:hover:bg-neutral-800",
                  )}
                >
                  Estudiante
                </button>
              </div>
            </div>

            {tipo === "estudiante" ? (
              <>
                <div>
                  <Label htmlFor="matricula">Matrícula</Label>
                  <div className="relative">
                    <Input
                      id="matricula"
                      value={matricula}
                      onChange={(e) => setMatricula(e.target.value)}
                      invalid={!!fieldErrors.matricula || !!matriculaError}
                      placeholder="Ej. 2026-0001"
                    />
                    {buscandoMatricula && (
                      <Loader2
                        className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  {(fieldErrors.matricula || matriculaError) && (
                    <p role="alert" className="mt-1.5 text-sm text-destructive">
                      {fieldErrors.matricula || matriculaError}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="nombre-estudiante">Nombre completo</Label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                    <Input
                      id="nombre-estudiante"
                      readOnly
                      value={estudianteEncontrado ? `${estudianteEncontrado.nombre} ${estudianteEncontrado.apellido}` : ""}
                      placeholder="Se completa al encontrar la matrícula"
                      className="cursor-not-allowed bg-gray-50 pl-9 dark:bg-neutral-800/60"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <Label htmlFor="nombre">Nombre completo</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={nombreManual}
                  onChange={(e) => setNombreManual(e.target.value)}
                  invalid={!!fieldErrors.nombre}
                  placeholder="Ej. Prof. Ana Ramírez"
                />
                {fieldErrors.nombre && (
                  <p role="alert" className="mt-1.5 text-sm text-destructive">
                    {fieldErrors.nombre}
                  </p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="username">Usuario</Label>
              <Input id="username" name="username" invalid={!!fieldErrors.username} placeholder="Ej. profesor.musica" />
              {fieldErrors.username && (
                <p role="alert" className="mt-1.5 text-sm text-destructive">
                  {fieldErrors.username}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                invalid={!!fieldErrors.password}
                placeholder="Mínimo 6 caracteres"
              />
              {fieldErrors.password && (
                <p role="alert" className="mt-1.5 text-sm text-destructive">
                  {fieldErrors.password}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Compártela de forma segura con el encargado — no se genera ninguna automáticamente.
              </p>
            </div>
            <div>
              <Label htmlFor="clubId">Club a dirigir (opcional)</Label>
              <Select value={clubId || "none"} onValueChange={(v) => setClubId(v === "none" ? "" : v)}>
                <SelectTrigger id="clubId">
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar (lo asigno después)</SelectItem>
                  {clubes.map((c) => (
                    <SelectItem key={c.id_club} value={String(c.id_club)}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                {tipo === "estudiante"
                  ? "Si lo asignas, este encargado quedará como miembro de su propio club automáticamente."
                  : "Puedes crear la cuenta primero y asignarle un club después, desde Editar."}
              </p>
            </div>
            {clubId && (
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={principal} onChange={(e) => setPrincipal(e.target.checked)} className="h-4 w-4 rounded" />
                Es el encargado principal del club
              </label>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Crear encargado
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
