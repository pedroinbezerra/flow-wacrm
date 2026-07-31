"use client";

import * as Sentry from "@sentry/nextjs";

export default function SentryExamplePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-950 text-slate-100 font-sans">
      <div className="max-w-md w-full p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 text-center">
        <h1 className="text-2xl font-bold text-slate-50">Sentry Test Page</h1>
        <p className="text-sm text-slate-400">
          Use os botões abaixo para disparar erros de teste no Sentry e verificar a integração.
        </p>

        <div className="space-y-3">
          <button
            type="button"
            className="w-full py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition duration-150 shadow cursor-pointer"
            onClick={() => {
              throw new Error("Sentry Client-Side Test Error");
            }}
          >
            Disparar Erro no Cliente (Frontend)
          </button>

          <button
            type="button"
            className="w-full py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium transition duration-150 shadow cursor-pointer"
            onClick={async () => {
              await fetch("/api/sentry-example-api");
            }}
          >
            Disparar Erro no Servidor (API Route)
          </button>

          <button
            type="button"
            className="w-full py-2.5 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition duration-150 shadow cursor-pointer"
            onClick={() => {
              Sentry.captureMessage("Sentry Manual Message Test", "info");
              alert("Mensagem manual enviada ao Sentry!");
            }}
          >
            Capturar Mensagem Manual
          </button>
        </div>
      </div>
    </div>
  );
}
