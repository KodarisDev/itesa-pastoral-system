"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, getSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { loginSchema, type LoginFormValues } from "@/lib/validations/login.schema";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = (values: LoginFormValues) => {
    setErrorGeneral(null);
    startTransition(async () => {
      const res = await signIn("credentials", {
        username: values.username,
        password: values.password,
        redirect: false,
      });

      if (!res || res.error) {
        setErrorGeneral("Usuario o contraseña incorrectos.");
        return;
      }

      const session = await getSession();
      const rol = session?.user?.rol;
      const callbackUrl = searchParams.get("callbackUrl");

      if (callbackUrl && callbackUrl.startsWith("/") ) {
        router.push(callbackUrl);
      } else if (rol === "pastoral") {
        router.push("/admin");
      } else if (rol === "encargado_club") {
        router.push("/club");
      } else {
        router.push("/");
      }
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-gray-200">
          Usuario
        </label>
        <input
          id="username"
          autoComplete="username"
          className={cn(
            "h-11 w-full rounded-xl border bg-white px-4 text-[16px] text-gray-700 transition-colors focus:outline-none dark:bg-neutral-900 dark:text-gray-200 md:text-sm",
            errors.username ? "border-destructive" : "border-neutral-200 focus:border-brand dark:border-neutral-700 dark:focus:border-red-600",
          )}
          placeholder="tu.usuario"
          {...register("username")}
        />
        {errors.username && (
          <p role="alert" className="mt-1.5 text-sm text-destructive">
            {errors.username.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-gray-200">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className={cn(
            "h-11 w-full rounded-xl border bg-white px-4 text-[16px] text-gray-700 transition-colors focus:outline-none dark:bg-neutral-900 dark:text-gray-200 md:text-sm",
            errors.password ? "border-destructive" : "border-neutral-200 focus:border-brand dark:border-neutral-700 dark:focus:border-red-600",
          )}
          placeholder="••••••••"
          {...register("password")}
        />
        {errors.password && (
          <p role="alert" className="mt-1.5 text-sm text-destructive">
            {errors.password.message}
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
        className="flex w-full items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        Iniciar sesión
      </button>
    </form>
  );
}
