import Image from "next/image";

interface FlowLogoProps {
  /** Altura da logo em pixels. Largura é proporcional (auto). */
  height?: number;
  className?: string;
}

/**
 * Logo da Flow System — usa a mesma imagem para tema claro e escuro.
 * Troque os arquivos em /public (logo-light.png / logo-dark.png) quando
 * versões específicas por tema estiverem disponíveis.
 */
export function FlowLogo({ height = 32, className }: FlowLogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Flow Hub"
      height={height}
      width={height * 4}
      className={className}
      priority
      unoptimized
    />
  );
}
