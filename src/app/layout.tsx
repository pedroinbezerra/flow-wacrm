import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/hooks/use-theme";
import { ThemedToaster } from "@/components/themed-toaster";
import { CookieConsentProvider } from "@/components/cookies/cookie-consent-provider";
import { I18nProvider } from "@/lib/i18n/provider";
import { META_API_VERSION } from "@/lib/whatsapp/api-version";
import {
  DEFAULT_MODE,
  DEFAULT_THEME,
  MODE_STORAGE_KEY,
  MODES,
  STORAGE_KEY,
  THEME_IDS,
} from "@/lib/themes";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  // Eixo de tamanho óptico. Serve o corte display ao monograma de
  // contato (ver bloco IDENTIDADE em globals.css), que o fixa em
  // `opsz 32`; no resto da interface o padrão `font-optical-sizing:
  // auto` passa a ajustar o desenho da letra ao corpo em que ela é
  // usada, que é o comportamento correto da Inter variável.
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: {
    default: "Flow Hub",
    template: "%s — Flow Hub",
  },
  description: "Template CRM auto-hospedável para WhatsApp",
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: [{ url: "/icon" }],
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#020617",
  colorScheme: "dark light",
};

// Inline boot script — runs before React hydrates so the user's
// chosen accent (data-theme) AND mode (data-mode) are on the <html>
// element before first paint. Without this every page load flashes
// the server-rendered defaults for a frame before the React tree
// mounts and applies the picked values.
//
// Kept dependency-free (no imports, no JSX) — must be a string the
// browser can run as a single <script>. Knowledge of valid ids is
// sourced from the THEME_IDS / MODES constants so adding one doesn't
// silently break the boot path.
const THEME_BOOT_SCRIPT = `
(function(){
  var d = document.documentElement;
  try {
    var THEME_KEY = ${JSON.stringify(STORAGE_KEY)};
    var THEME_DEFAULT = ${JSON.stringify(DEFAULT_THEME)};
    var THEMES = ${JSON.stringify(THEME_IDS)};
    var savedTheme = localStorage.getItem(THEME_KEY);
    d.dataset.theme = THEMES.indexOf(savedTheme) !== -1 ? savedTheme : THEME_DEFAULT;

    var MODE_KEY = ${JSON.stringify(MODE_STORAGE_KEY)};
    var MODE_DEFAULT = ${JSON.stringify(DEFAULT_MODE)};
    var MODES = ${JSON.stringify(MODES)};
    var savedMode = localStorage.getItem(MODE_KEY);
    var activeMode = MODES.indexOf(savedMode) !== -1 ? savedMode : MODE_DEFAULT;
    d.dataset.mode = activeMode;
    if (activeMode === "dark") { d.classList.add("dark"); } else { d.classList.remove("dark"); }
  } catch (_e) {
    d.dataset.theme = ${JSON.stringify(DEFAULT_THEME)};
    d.dataset.mode = ${JSON.stringify(DEFAULT_MODE)};
    d.classList.add("dark");
  }
})();
`;

const META_SDK_BOOT_SCRIPT = `
window.fbAsyncInit = function() {
  if (typeof FB !== 'undefined') {
    FB.init({
      appId      : ${JSON.stringify(process.env.NEXT_PUBLIC_META_APP_ID || '')},
      cookie     : true,
      xfbml      : true,
      version    : ${JSON.stringify(META_API_VERSION)}
    });
  }
};

(function(d, s, id){
   var js, fjs = d.getElementsByTagName(s)[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement(s); js.id = id;
   js.src = "https://connect.facebook.net/pt_BR/sdk.js";
   if (fjs && fjs.parentNode) {
     fjs.parentNode.insertBefore(js, fjs);
   } else {
     d.body.appendChild(js);
   }
 }(document, 'script', 'facebook-jssdk'));
`;


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      data-theme={DEFAULT_THEME}
      data-mode={DEFAULT_MODE}
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script
          id="theme-boot"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }}
        />
        {process.env.NEXT_PUBLIC_META_APP_ID && (
          <Script
            id="facebook-sdk-boot"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: META_SDK_BOOT_SCRIPT }}
          />
        )}
      </head>
      <body className="min-h-full bg-background text-foreground font-sans">
        <I18nProvider>
          <ThemeProvider>
            <CookieConsentProvider>
              {children}
              <ThemedToaster />
            </CookieConsentProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
