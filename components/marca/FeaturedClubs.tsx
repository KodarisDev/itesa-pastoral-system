"use client";

import { FadeIn, StaggerContainer, StaggerItem } from "@/components/marca/FadeIn";
import { CtaButton } from "@/components/marca/CtaButton";
import { ClubCard } from "@/components/marca/ClubCard";
import type { Club } from "@/types";

interface FeaturedClubsProps {
  clubes: Club[];
}

export function FeaturedClubs({ clubes }: FeaturedClubsProps) {
  if (clubes.length === 0) return null;

  return (
    <section id="clubes" className="scroll-mt-20 mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-8">
      <FadeIn className="mx-auto mb-12 max-w-2xl text-center">
        <p className="mb-3 inline-flex items-center rounded-full bg-neutral-100 px-4 py-1.5 text-[11px] font-medium uppercase tracking-widest text-neutral-500">
          Clubes disponibles
        </p>
        <h2 className="text-balance text-[clamp(28px,4vw,40px)] font-semibold tracking-[-0.02em] text-neutral-950">
          Encuentra el club que va contigo
        </h2>
      </FadeIn>

      <StaggerContainer className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {clubes.map((club) => (
          <StaggerItem key={club.id}>
            <ClubCard club={club} />
          </StaggerItem>
        ))}
      </StaggerContainer>

      <div className="mt-12 flex justify-center">
        <CtaButton href="/clubes">Ver todos los clubes</CtaButton>
      </div>
    </section>
  );
}
