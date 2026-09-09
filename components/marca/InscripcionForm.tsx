"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { solicitudSchema, type SolicitudFormValues } from "@/lib/validations/solicitud.schema";
import { createSolicitud } from "@/lib/actions/solicitudes.actions";
import { ClubSelectCard } from "@/components/marca/ClubSelectCard";
import type { Club } from "@/types";
import { cn } from "@/lib/utils";

interface InscripcionFormProps {
  clubes: Club[];
}

export function InscripcionForm({ clubes }: InscripcionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<SolicitudFormValues>({
    resolver: zodResolver(solicitudSchema),
    defaultValues: { nombre: "", apellido: "", curso: "", matricula: "", clubDeseadoId: "", clubAlternativoId: "" },
  });

  const clubDeseadoId = watch("clubDeseadoId");

  const onSubmit = (values: SolicitudFormValues) => {
    setErrorGeneral(null);
    startTransition(async () => {
      const res = await createSolicitud(values);
      if (!res.ok) {
        setErrorGeneral(res.error);
        toast.error(res.error);
        return;
      }
      router.push("/inscripcion/confirmacion");
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="nombre" className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-gray-200">
            Nombre
          </label>
          <input
            id="nombre"
            className={cn(
              "h-11 w-full rounded-xl border bg-white px-4 text-[16px] text-gray-700 transition-colors focus:outline-none dark:bg-neutral-900 dark:text-gray-200 md:text-sm",
              errors.nombre ? "border-destructive" : "border-neutral-200 focus:border-brand dark:border-neutral-700 dark:focus:border-red-600",
            )}
            placeholder="Ej. María"
            {...register("nombre")}
          />
          {errors.nombre && (
            <p role="alert" className="mt-1.5 text-sm text-destructive">
              {errors.nombre.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="apellido" className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-gray-200">
            Apellido
          </label>
          <input
            id="apellido"
            className={cn(
              "h-11 w-full rounded-xl border bg-white px-4 text-[16px] text-gray-700 transition-colors focus:outline-none dark:bg-neutral-900 dark:text-gray-200 md:text-sm",
              errors.apellido ? "border-destructive" : "border-neutral-200 focus:border-brand dark:border-neutral-700 dark:focus:border-red-600",
            )}
            placeholder="Ej. Gómez"
            {...register("apellido")}
          />
          {errors.apellido && (
            <p role="alert" className="mt-1.5 text-sm text-destructive">
              {errors.apellido.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="curso" className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-gray-200">
            Curso
          </label>
          <input
            id="curso"
            className={cn(
              "h-11 w-full rounded-xl border bg-white px-4 text-[16px] text-gray-700 transition-colors focus:outline-none dark:bg-neutral-900 dark:text-gray-200 md:text-sm",
              errors.curso ? "border-destructive" : "border-neutral-200 focus:border-brand dark:border-neutral-700 dark:focus:border-red-600",
            )}
            placeholder="Ej. 10mo C"
            {...register("curso")}
          />
          {errors.curso && (
            <p role="alert" className="mt-1.5 text-sm text-destructive">
              {errors.curso.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="matricula" className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-gray-200">
            Matrícula
          </label>
          <input
            id="matricula"
            className={cn(
              "h-11 w-full rounded-xl border bg-white px-4 text-[16px] text-gray-700 transition-colors focus:outline-none dark:bg-neutral-900 dark:text-gray-200 md:text-sm",
              errors.matricula ? "border-destructive" : "border-neutral-200 focus:border-brand dark:border-neutral-700 dark:focus:border-red-600",
            )}
            placeholder="Ej. 2026-0001"
            {...register("matricula")}
          />
          {errors.matricula && (
            <p role="alert" className="mt-1.5 text-sm text-destructive">
              {errors.matricula.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <div className="mb-3">
          <p className="text-[11px] font-medium uppercase tracking-widest text-neutral-500 dark:text-gray-400">Paso 2</p>
          <h2 className="text-xl font-semibold text-neutral-950 dark:text-white">¿A qué club deseas entrar?</h2>
        </div>
        <Controller
          control={control}
          name="clubDeseadoId"
          render={({ field }) => (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {clubes.map((club) => (
                <ClubSelectCard
                  key={club.id}
                  club={club}
                  name="clubDeseadoId"
                  selected={field.value === club.id}
                  disabledReason={club.miembrosActuales.length >= club.capacidadMaxima ? "Cupo lleno" : undefined}
                  onSelect={() => field.onChange(club.id)}
                />
              ))}
            </div>
          )}
        />
        {errors.clubDeseadoId && (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {errors.clubDeseadoId.message}
          </p>
        )}
      </div>

      <div>
        <div className="mb-3">
          <p className="text-[11px] font-medium uppercase tracking-widest text-neutral-500 dark:text-gray-400">Paso 3</p>
          <h2 className="text-xl font-semibold text-neutral-950 dark:text-white">Club alternativo</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-gray-400">Por si no logras entrar al club que elegiste arriba.</p>
        </div>
        <Controller
          control={control}
          name="clubAlternativoId"
          render={({ field }) => (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {clubes
                .filter((c) => c.id !== clubDeseadoId)
                .map((club) => (
                  <ClubSelectCard
                    key={club.id}
                    club={club}
                    name="clubAlternativoId"
                    selected={field.value === club.id}
                    disabledReason={club.miembrosActuales.length >= club.capacidadMaxima ? "Cupo lleno" : undefined}
                    onSelect={() => field.onChange(club.id)}
                  />
                ))}
            </div>
          )}
        />
        {errors.clubAlternativoId && (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {errors.clubAlternativoId.message}
          </p>
        )}
      </div>

      {errorGeneral && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200"
        >
          {errorGeneral}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        style={{ background: "linear-gradient(135deg, #c0392b, #922b21)" }}
        className="flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        Enviar solicitud
      </button>
    </form>
  );
}
