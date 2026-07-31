import { Metadata } from "next";
import { WelcomeScreen } from "@/components/onboarding/welcome-screen";

export const metadata: Metadata = {
  title: "Boas-vindas | Flow Hub",
  description: "Seja bem-vindo ao Flow Hub pela Flow Systems.",
};

export default function WelcomePage() {
  return <WelcomeScreen />;
}
