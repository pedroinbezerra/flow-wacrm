import Image from "next/image";

import logo from "../../../public/logo.png";

interface FlowLogoProps {
  /** Altura renderizada em pixels. A largura sai da proporção real do arquivo. */
  height?: number;
  className?: string;
}

/**
 * Logo da Flow System — usa a mesma imagem para tema claro e escuro.
 * Troque os arquivos em /public (logo-light.png / logo-dark.png) quando
 * versões específicas por tema estiverem disponíveis.
 *
 * O import estático entrega a dimensão real do PNG ao next/image, que deriva
 * a largura a partir da altura pedida. Antes a largura era fixada em
 * `height * 4` — proporção que o arquivo não tem (460x158 ≈ 2,91:1). Como o
 * Preflight do Tailwind aplica `height: auto` em toda <img>, quem mandava no
 * tamanho final era essa largura errada, e a logo saía ~37% mais alta do que
 * a prop pedia. As chamadas carregam a altura real que já estava na tela.
 */
export function FlowLogo({ height = 44, className }: FlowLogoProps) {
  return (
    <Image
      src={logo}
      alt="Flow Hub"
      height={height}
      className={className}
      priority
      unoptimized
    />
  );
}
