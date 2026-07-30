import { Metadata } from "next";
import { PlansManager } from "@/components/admin/plans-manager";

export const metadata: Metadata = {
  title: "Planos Comerciais · Flow Hub",
  description: "Gerenciamento de planos comerciais e atribuição de empresas",
};

export default function AdminPlansPage() {
  return <PlansManager />;
}
