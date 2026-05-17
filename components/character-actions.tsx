"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";

export function CharacterActions() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleFork = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest("[data-action='fork']");
      if (!button || !user) return;

      e.preventDefault();
      const slug = button.getAttribute("data-slug");
      if (!slug) return;

      const newSlug = `${slug}-fork-${Date.now().toString(36)}`;
      const response = await fetch("/api/characters/fork", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceSlug: slug,
          newSlug,
          newName: undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/characters/${data.character.slug}`);
      } else {
        const error = await response.json();
        alert(error.error ?? "Failed to fork character");
      }
    };

    document.addEventListener("click", handleFork);
    return () => document.removeEventListener("click", handleFork);
  }, [user, router]);

  return null;
}
