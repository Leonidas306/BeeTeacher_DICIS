import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/common/Footer";
import Header from "@/components/common/Header";
import NavBar from "@/components/common/NavBar";
import ScheduleModal from "@/components/common/ScheduleModal";
import TopBanner from "@/components/common/TopBanner";
import { HeadquartersProvider } from "@/context/Headquarters/HeadquartersProvider";
import { RoomsProvider } from "@/context/Rooms/RoomsProvider";
import { ThemeProvider } from "@/context/ThemeProvider";

const interSans = Inter({
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#f59e0b",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  title: "BeeTeacher · Colmena de Tutores y Salones UG",
  description:
    "Conecta con tutores por etiquetas de materia (#Cálculo, #Probabilidad), identifica asesores #TutorPar o #Externo, revisa salones vacíos y agenda por WhatsApp.",
  manifest: "/manifest.json",
  openGraph: {
    title: "BeeTeacher · Colmena de Tutores y Salones UG",
    description:
      "Encuentra tutores por etiquetas de materia y salones vacíos en tiempo real.",
    siteName: "BeeTeacher",
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BeeTeacher · Colmena de Tutores y Salones UG",
    description:
      "Encuentra tutores por etiquetas de materia y salones vacíos en tiempo real.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-MX"
      className={`${interSans.className} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script id="theme-init" suppressHydrationWarning>
          {`(() => {
            try {
              const storedTheme = localStorage.getItem("theme");
              const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light";
              const theme = storedTheme === "light" || storedTheme === "dark"
                ? storedTheme
                : systemTheme;
              const root = document.documentElement;
              root.classList.toggle("dark", theme === "dark");
              root.style.colorScheme = theme;
            } catch {}
          })()`}
        </script>
      </head>
      <body className="antialiased font-sans">
        <ThemeProvider>
          <HeadquartersProvider>
            <RoomsProvider>
              
                <div className="min-h-screen flex flex-col">
                  <TopBanner />
                  <Header />
                  <main className="max-w-6xl w-full mx-auto px-6 flex-1">
                    {children}
                  </main>
                  <Footer />
                  <NavBar />
                  <ScheduleModal />
                </div>
              
            </RoomsProvider>
          </HeadquartersProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
