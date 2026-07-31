import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { sendTextMessage } from "@/lib/whatsapp/meta-api";
import { sanitizePhoneForMeta } from "@/lib/whatsapp/phone-utils";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const expectedSecret =
      process.env.INTERNAL_ALERTS_SECRET ||
      process.env.AUTOMATION_CRON_SECRET ||
      process.env.CRON_SECRET;

    if (!expectedSecret) {
      return NextResponse.json(
        { error: "Alert secret not configured" },
        { status: 503 }
      );
    }

    const authHeader = request.headers.get("authorization");
    const bearerSecret = authHeader?.toLowerCase().startsWith("bearer ")
      ? authHeader.substring(7).trim()
      : "";
    const suppliedSecret = request.headers.get("x-cron-secret") || bearerSecret;

    const suppliedBuf = Buffer.from(suppliedSecret);
    const expectedBuf = Buffer.from(expectedSecret);

    if (
      suppliedBuf.length !== expectedBuf.length ||
      !timingSafeEqual(suppliedBuf, expectedBuf)
    ) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    let body: { source?: string; summary?: string; details?: Record<string, unknown> };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { source = "unknown", summary = "Evento crítico registrado", details } = body;

    const phoneNumberId = process.env.INTERNAL_ALERTS_WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.INTERNAL_ALERTS_WHATSAPP_ACCESS_TOKEN;
    const rawTo = process.env.INTERNAL_ALERTS_WHATSAPP_TO;

    if (!phoneNumberId || !accessToken || !rawTo) {
      console.warn(
        "[security-event-alert] WhatsApp env vars not configured; skipping WhatsApp dispatch."
      );
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: "WhatsApp environment variables missing",
      });
    }

    const to = sanitizePhoneForMeta(rawTo);
    const detailsFormatted = details
      ? `\n*Detalhes:*\n\`\`\`json\n${JSON.stringify(details, null, 2).slice(0, 1000)}\n\`\`\``
      : "";

    const messageText = `🚨 *[Alerta de Segurança — Flow Systems]*\n\n*Fonte:* ${source}\n*Resumo:* ${summary}${detailsFormatted}`;

    const result = await sendTextMessage({
      phoneNumberId,
      accessToken,
      to,
      text: messageText,
    });

    return NextResponse.json({
      ok: true,
      sent: true,
      whatsappMessageId: result.messageId,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    console.error("[security-event-alert] Exception handling security alert:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
