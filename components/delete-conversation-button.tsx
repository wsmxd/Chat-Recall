"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useConfirm } from "@/components/confirm-provider";

export function DeleteConversationButton({ id }: { id: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const { confirm } = useConfirm();

  const handleDelete = async () => {
    if (!await confirm("Delete this conversation and all its messages?")) return;
    setDeleting(true);
    const response = await fetch(`/api/conversations/${id}`, { method: "DELETE" });
    if (response.ok) {
      router.refresh();
    }
    setDeleting(false);
  };

  return (
    <button
      className="memory-action-btn delete"
      onClick={handleDelete}
      disabled={deleting}
      type="button"
    >
      {deleting ? "Deleting..." : "Delete"}
    </button>
  );
}
