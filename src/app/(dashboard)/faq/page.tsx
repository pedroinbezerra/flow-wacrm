import { Metadata } from "next";
import { FaqContent } from "@/components/faq/faq-content";

export const metadata: Metadata = {
  title: "Central de Ajuda & FAQ | Flow Hub",
  description: "Dúvidas frequentes, tutoriais e guias atualizados de uso do Flow Hub.",
};

export default function FaqPage() {
  return <FaqContent />;
}
