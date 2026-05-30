import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Sidebar, TabBarMobile } from "@/components/Nav";
import { TopBar } from "@/components/TopBar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ReadyGate } from "@/components/ReadyGate";
import { HashScroll } from "@/components/HashScroll";
import { getUserName } from "@/lib/queries";

export const metadata: Metadata = {
  title: "LIFE",
  description: "Личный командный центр",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width", initialScale: 1, maximumScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Имя из БД (для верхней панели). Если БД недоступна — фолбэк.
  let userName = "Друг";
  try { userName = await getUserName(); } catch { /* БД оффлайн — ладно */ }

  // Применяем сохранённую тему до первой отрисовки React — убирает мерцание.
  const themeScript = `try{var t=localStorage.getItem('life-theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t;}catch(e){}`;

  return (
    <html lang="ru" data-serif="playfair" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ThemeProvider>
          <div className="app-shell">
            <Suspense fallback={<aside className="sidebar" />}>
              <Sidebar />
            </Suspense>
            <main className="content">
              <TopBar userName={userName} />
              <div className="page">
                <ReadyGate>{children}</ReadyGate>
              </div>
            </main>
            <Suspense fallback={null}>
              <TabBarMobile />
            </Suspense>
          </div>
          <Suspense fallback={null}><HashScroll /></Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
