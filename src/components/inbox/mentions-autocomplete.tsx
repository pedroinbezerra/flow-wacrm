"use client";

import { useEffect, useState } from "react";
import { ContactAvatar } from "@/components/ui/contact-avatar";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";


interface MentionsAutocompleteProps {
  query: string;
  onSelectUser: (user: Profile) => void;
  onClose: () => void;
}

export function MentionsAutocomplete({
  query,
  onSelectUser,
  onClose,
}: MentionsAutocompleteProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMembers() {
      try {
        const res = await fetch("/api/account/members");
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data?.members)
            ? data.members
            : Array.isArray(data)
              ? data
              : [];
          if (list.length > 0) {
            setProfiles(list);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to load members for mentions:", err);
      }

      try {
        const supabase = createClient();
        const { data } = await supabase.from("profiles").select("*");
        if (data) setProfiles(data as Profile[]);
      } catch {} finally {
        setLoading(false);
      }
    }
    loadMembers();
  }, []);

  const safeProfiles = Array.isArray(profiles) ? profiles : [];
  const trimmedQ = query.trim().toLowerCase();
  const filtered = safeProfiles.filter((p) =>
    !trimmedQ || (p.full_name && p.full_name.toLowerCase().includes(trimmedQ))
  );

  if (loading) return null;
  if (filtered.length === 0) {
    return (
      <div className="absolute bottom-full left-0 mb-1 w-64 bg-background border border-border shadow-lg rounded-md p-2.5 text-xs text-muted-foreground z-30 animate-in fade-in zoom-in-95">
        Nenhum colaborador encontrado com &quot;{query}&quot;
      </div>
    );
  }



  return (
    <div className="absolute bottom-full left-0 mb-1 w-64 bg-background border border-border shadow-lg rounded-md overflow-hidden z-30 animate-in fade-in zoom-in-95">
      <div className="px-2 py-1 bg-muted/30 border-b border-border text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        Mencionar colaborador
      </div>
      <div className="max-h-40 overflow-y-auto divide-y divide-border/40">
        {filtered.map((p) => (
          <button
            key={p.user_id}
            onClick={() => {
              onSelectUser(p);
              onClose();
            }}
            className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-accent/60 transition-colors"
          >
            <ContactAvatar
              name={p.full_name}
              avatarUrl={p.avatar_url}
              size="xs"
            />
            <span className="font-medium text-foreground truncate">{p.full_name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
