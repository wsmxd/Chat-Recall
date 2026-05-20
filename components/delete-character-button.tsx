"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useConfirm } from "@/components/confirm-provider";

export function DeleteCharacterButton({ id, slug }: { id: string; slug: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const { confirm, alert } = useConfirm();

  const handleDelete = async () => {
    if (!await confirm(`Delete "${slug}" and all associated data? This cannot be undone.`)) return;
    setDeleting(true);
    const response = await fetch(`/api/characters/${id}`, { method: "DELETE" });
    if (response.ok) {
      router.push("/characters");
      router.refresh();
    } else {
      const data = await response.json().catch(() => ({ error: "Unknown error" }));
      await alert(data.error ?? "Failed to delete character", "Error");
    }
    setDeleting(false);
  };

  return (
    <button className="button danger" onClick={handleDelete} disabled={deleting} type="button">
      {deleting ? "Deleting..." : "Delete Character"}
    </button>
  );
}