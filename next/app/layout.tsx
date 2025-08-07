import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Inter, Geist_Mono } from "next/font/google";
import PWAInstaller from "@/components/pwa/PWAInstaller";
import OfflineIndicator from "@/components/pwa/OfflineIndicator";
import DokterLensfoliaFloating from "@/components/lang/Assistant";
// import PWAStatus from "@/components/pwa/PWAStatus";

const APP_NAME = "LensFolia";
const APP_DEFAULT_TITLE = "LensFolia - Deteksi Penyakit Tanaman";
const APP_TITLE_TEMPLATE = "%s - LensFolia";
const APP_DESCRIPTION = "Deteksi Penyakit Tanaman Melalui Daun dalam Sekejap dengan AI menggunakan LensFolia!";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  icons: {
    icon: "/LogoIcon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#f0fdfa",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} text-foreground scroll-smooth antialiased`}
    >
      <body>
        <OfflineIndicator />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <PWAInstaller />
        <DokterLensfoliaFloating />
        {/* <PWAStatus /> */}
      </body>
    </html>
  );
}
