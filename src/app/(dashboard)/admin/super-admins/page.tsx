import { Metadata } from "next";
import { SuperAdminsManager } from "@/components/admin/super-admins-manager";

export const metadata: Metadata = {
  title: "Operadores da Plataforma | Flow WACRM Admin",
  description: "Gerenciamento global de operadores e Super Admins do sistema.",
};

export default function AdminSuperAdminsPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <SuperAdminsManager />
    </div>
  );
}
