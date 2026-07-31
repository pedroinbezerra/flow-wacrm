import { Metadata } from "next";
import { SupportAdminPanel } from "@/components/admin/support-admin-panel";

export const metadata: Metadata = {
  title: "Atendimento a Clientes | Flow Hub",
  description: "Painel de suporte e chamados para a equipe Super Admin da Flow Systems.",
};

export default function SupportAdminPage() {
  return <SupportAdminPanel />;
}
