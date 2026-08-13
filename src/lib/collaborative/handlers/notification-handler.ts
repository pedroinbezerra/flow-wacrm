import type { SupabaseClient } from "@supabase/supabase-js";
import type { CollaborativeEvent } from "@/types";

export interface NotificationResult {
  notification_ids?: string[];
}

export async function handleNotifications(
  supabase: SupabaseClient,
  event: CollaborativeEvent
): Promise<NotificationResult> {
  const { type, context, payload } = event;
  const actorName = context.actor_name || "Um colaborador";
  const notificationIds: string[] = [];

  switch (type) {
    case "internal_note_created": {
      const p = payload as { content: string; mentions?: string[] };
      const mentions = p.mentions || parseMentions(p.content);

      if (mentions.length > 0) {
        // Resolve user IDs from full_name or email
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .eq("account_id", context.account_id);

        if (profiles && profiles.length > 0) {
          for (const targetName of mentions) {
            const matched = profiles.find(
              (prof) =>
                prof.full_name.toLowerCase().includes(targetName.toLowerCase()) ||
                targetName.toLowerCase().includes(prof.full_name.toLowerCase())
            );

            if (matched && matched.user_id !== context.actor_id) {
              const { data } = await supabase
                .from("notifications")
                .insert({
                  account_id: context.account_id,
                  user_id: matched.user_id,
                  actor_id: context.actor_id,
                  conversation_id: context.conversation_id,
                  type: "mention",
                  title: `${actorName} mencionou você`,
                  body: `Nota interna: "${p.content.slice(0, 100)}"`,
                  metadata: { conversation_id: context.conversation_id },
                })
                .select("id")
                .single();

              if (data) notificationIds.push(data.id);
            }
          }
        }
      }
      break;
    }

    case "collaborator_mentioned": {
      const p = payload as { mentioned_user_id: string; snippet: string };
      if (p.mentioned_user_id !== context.actor_id) {
        const { data } = await supabase
          .from("notifications")
          .insert({
            account_id: context.account_id,
            user_id: p.mentioned_user_id,
            actor_id: context.actor_id,
            conversation_id: context.conversation_id,
            type: "mention",
            title: `${actorName} mencionou você`,
            body: p.snippet.slice(0, 120),
            metadata: { conversation_id: context.conversation_id },
          })
          .select("id")
          .single();

        if (data) notificationIds.push(data.id);
      }
      break;
    }

    case "owner_changed": {
      const p = payload as { new_owner_id: string };
      if (p.new_owner_id !== context.actor_id) {
        const { data } = await supabase
          .from("notifications")
          .insert({
            account_id: context.account_id,
            user_id: p.new_owner_id,
            actor_id: context.actor_id,
            conversation_id: context.conversation_id,
            type: "assignment",
            title: `Atendimento atribuído a você`,
            body: `${actorName} atribuiu a responsabilidade deste atendimento a você.`,
            metadata: { conversation_id: context.conversation_id },
          })
          .select("id")
          .single();

        if (data) notificationIds.push(data.id);
      }
      break;
    }

    case "help_requested": {
      const p = payload as { target_user_id?: string; target_sector?: string; note?: string };
      const bodyText = p.note ? `Ajuda solicitada: "${p.note}"` : `${actorName} solicitou ajuda neste atendimento.`;

      if (p.target_user_id && p.target_user_id !== context.actor_id) {
        const { data } = await supabase
          .from("notifications")
          .insert({
            account_id: context.account_id,
            user_id: p.target_user_id,
            actor_id: context.actor_id,
            conversation_id: context.conversation_id,
            type: "help_request",
            title: `Solicitação de Ajuda de ${actorName}`,
            body: bodyText,
            metadata: { conversation_id: context.conversation_id, sector: p.target_sector },
          })
          .select("id")
          .single();

        if (data) notificationIds.push(data.id);
      } else {
        // If a target sector is provided, notify members belonging to that sector.
        // Fallback to all account members if no members are tagged with that sector yet.
        let memberQuery = supabase
          .from("profiles")
          .select("user_id")
          .eq("account_id", context.account_id);

        if (p.target_sector) {
          const { data: sectorMembers } = await supabase
            .from("profiles")
            .select("user_id")
            .eq("account_id", context.account_id)
            .eq("sector", p.target_sector);

          if (sectorMembers && sectorMembers.length > 0) {
            memberQuery = supabase
              .from("profiles")
              .select("user_id")
              .eq("account_id", context.account_id)
              .eq("sector", p.target_sector);
          }
        }

        const { data: members } = await memberQuery;

        if (members) {
          for (const m of members) {
            if (m.user_id !== context.actor_id) {
              const { data } = await supabase
                .from("notifications")
                .insert({
                  account_id: context.account_id,
                  user_id: m.user_id,
                  actor_id: context.actor_id,
                  conversation_id: context.conversation_id,
                  type: "help_request",
                  title: `Solicitação de Ajuda (${p.target_sector || "Geral"})`,
                  body: bodyText,
                  metadata: { conversation_id: context.conversation_id, sector: p.target_sector },
                })
                .select("id")
                .single();

              if (data) notificationIds.push(data.id);
            }
          }
        }
      }
      break;
    }

    default:
      break;
  }

  return { notification_ids: notificationIds };
}

export function parseMentions(text: string): string[] {
  const matches = text.match(/@([\w\u00C0-\u024F]+(?:\s+[\w\u00C0-\u024F]+)?)/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map((m) => m.replace(/^@/, "").trim())));
}
