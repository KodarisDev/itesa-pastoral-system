"use client";

import { Facebook, Linkedin, Mail, MessageCircle, Twitter } from "lucide-react";

interface ShareButtonsProps {
  titulo: string;
}

function currentUrl() {
  return typeof window !== "undefined" ? window.location.href : "";
}

export function ShareButtons({ titulo }: ShareButtonsProps) {
  const items = [
    {
      label: "LinkedIn",
      icon: Linkedin,
      action: () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl())}`;
        window.open(url, "_blank", "noopener,noreferrer");
      },
    },
    {
      label: "X",
      icon: Twitter,
      action: () => {
        const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl())}&text=${encodeURIComponent(titulo)}`;
        window.open(url, "_blank", "noopener,noreferrer");
      },
    },
    {
      label: "Facebook",
      icon: Facebook,
      action: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl())}`;
        window.open(url, "_blank", "noopener,noreferrer");
      },
    },
    {
      label: "WhatsApp",
      icon: MessageCircle,
      action: () => {
        const url = `https://wa.me/?text=${encodeURIComponent(`${titulo} ${currentUrl()}`)}`;
        window.open(url, "_blank", "noopener,noreferrer");
      },
    },
    {
      label: "Correo",
      icon: Mail,
      action: () => {
        window.location.href = `mailto:?subject=${encodeURIComponent(titulo)}&body=${encodeURIComponent(currentUrl())}`;
      },
    },
  ];

  return (
    <div className="rounded-2xl border border-neutral-100 p-5 dark:border-neutral-800">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-gray-500">
        Compartir
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.label}>
            <button
              type="button"
              onClick={item.action}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-brand dark:text-gray-300 dark:hover:bg-neutral-800"
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
