import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contactId } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("account_id")
      .eq("user_id", user.id)
      .single();

    const accountId = profile?.account_id ?? user.id;

    // Call RPC for exporting contact data under LGPD
    const { data, error } = await supabase.rpc("export_lgpd_contact_data", {
      p_contact_id: contactId,
      p_account_id: accountId,
    });

    if (error) {
      // Fallback query if RPC hasn't been executed on remote db yet
      const { data: contact } = await supabase
        .from("contacts")
        .select("*")
        .eq("id", contactId)
        .single();

      if (!contact) {
        return NextResponse.json({ error: "Contato não encontrado" }, { status: 404 });
      }

      return NextResponse.json({
        exported_at: new Date().toISOString(),
        profile: contact,
        note: "Exportação via fallback padrão",
      });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[LGPD Export API Error]", err);
    return NextResponse.json({ error: "Erro interno no servidor ao exportar dados" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contactId } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("account_id")
      .eq("user_id", user.id)
      .single();

    const accountId = profile?.account_id ?? user.id;

    // Call RPC to anonymize contact
    const { data, error } = await supabase.rpc("anonymize_lgpd_contact", {
      p_contact_id: contactId,
      p_account_id: accountId,
    });

    if (error) {
      // Fallback direct update if RPC fails/missing
      const { error: updateError } = await supabase
        .from("contacts")
        .update({
          name: "Contato Anonimizado LGPD",
          email: null,
          company: null,
          avatar_url: null,
          opt_out: true,
          opt_out_at: new Date().toISOString(),
          consent_status: "revoked",
          consent_updated_at: new Date().toISOString(),
        })
        .eq("id", contactId);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: "Contato anonimizado com sucesso (fallback).",
      });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[LGPD Anonymize API Error]", err);
    return NextResponse.json({ error: "Erro ao anonimizar contato sob a LGPD" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contactId } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { opt_out } = body;

    if (typeof opt_out !== "boolean") {
      return NextResponse.json({ error: "Campo opt_out deve ser um booleano" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("contacts")
      .update({
        opt_out,
        opt_out_at: opt_out ? new Date().toISOString() : null,
        consent_status: opt_out ? "opted_out" : "opted_in",
        consent_updated_at: new Date().toISOString(),
      })
      .eq("id", contactId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, contact: data });
  } catch (err) {
    console.error("[LGPD Opt-out Toggle API Error]", err);
    return NextResponse.json({ error: "Erro ao alterar opt-out do contato" }, { status: 500 });
  }
}
