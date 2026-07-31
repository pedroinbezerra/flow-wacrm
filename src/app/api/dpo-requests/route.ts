import { NextResponse } from 'next/server';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { supabaseAdmin } from '@/lib/automations/admin-client';
import { sendTextMessage } from '@/lib/whatsapp/meta-api';
import { sanitizePhoneForMeta } from '@/lib/whatsapp/phone-utils';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting por IP (5 solicitações por minuto)
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'anonymous';

    const limit = await checkRateLimit(`dpo_request:${ip}`, {
      limit: 5,
      windowMs: 60_000,
    });

    if (!limit.success) {
      return rateLimitResponse(limit);
    }

    // 2. Leitura e Validação do Body
    let body: {
      name?: string;
      email?: string;
      request_type?: string;
      description?: string;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Corpo da requisição JSON inválido.' },
        { status: 400 }
      );
    }

    const { name, email, request_type, description } = body;

    if (!name?.trim() || !email?.trim() || !request_type?.trim() || !description?.trim()) {
      return NextResponse.json(
        { error: 'Todos os campos (nome, e-mail, tipo de solicitação e descrição) são obrigatórios.' },
        { status: 400 }
      );
    }

    if (!email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { error: 'E-mail informado é inválido.' },
        { status: 400 }
      );
    }

    // 3. Gravação na Tabela dpo_requests
    const admin = supabaseAdmin();
    const { data: inserted, error: dbError } = await admin
      .from('dpo_requests')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        request_type: request_type.trim(),
        description: description.trim(),
        status: 'open',
      })
      .select('id, created_at')
      .single();

    if (dbError) {
      console.error('[dpo-requests] Erro ao gravar no banco:', dbError);
      return NextResponse.json(
        { error: 'Falha ao registrar a solicitação no sistema. Tente novamente.' },
        { status: 500 }
      );
    }

    // 4. Disparo de Alerta via WhatsApp para o DPO/Operacional (Se configurado)
    const phoneNumberId = process.env.INTERNAL_ALERTS_WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.INTERNAL_ALERTS_WHATSAPP_ACCESS_TOKEN;
    const rawTo = process.env.INTERNAL_ALERTS_WHATSAPP_TO;

    if (phoneNumberId && accessToken && rawTo) {
      try {
        const to = sanitizePhoneForMeta(rawTo);
        const alertMsg =
          `📩 *[Nova Solicitação LGPD — Flow Hub]*\n\n` +
          `*ID:* \`${inserted.id}\`\n` +
          `*Nome:* ${name.trim()}\n` +
          `*E-mail:* ${email.trim()}\n` +
          `*Tipo:* ${request_type.trim()}\n` +
          `*Descrição:* ${description.trim().slice(0, 300)}\n\n` +
          `*Status:* Aberto (Verifique o painel do DPO)`;

        await sendTextMessage({
          phoneNumberId,
          accessToken,
          to,
          text: alertMsg,
        });
      } catch (alertErr) {
        console.error('[dpo-requests] Falha ao enviar alerta via WhatsApp:', alertErr);
        // Não bloqueia a resposta de sucesso para o cliente
      }
    }

    return NextResponse.json({
      ok: true,
      message: 'Solicitação de direitos LGPD registrada com sucesso.',
      id: inserted.id,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erro interno';
    console.error('[dpo-requests] Exceção em POST:', err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
