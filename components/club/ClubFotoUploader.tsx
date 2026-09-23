"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Camera, Loader2 } from "lucide-react";
import { actualizarFotoMiClub } from "@/lib/actions/clubs.actions";

export function ClubFotoUploader({ clubId }: { clubId: number }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const formData = new FormData();
    formData.set("clubId", String(clubId));
    formData.set("foto", file);

    startTransition(async () => {
      const res = await actualizarFotoMiClub(formData);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Foto del club actualizada.");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={isPending}
      aria-label="Cambiar foto del club"
      className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white shadow transition-colors hover:bg-black/85 disabled:cursor-wait"
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
      ) : (
        <Camera className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleChange} />
    </button>
  );
}
