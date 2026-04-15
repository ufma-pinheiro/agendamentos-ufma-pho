import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

// Definindo as fontes conforme o projeto original
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  variable: "--font-jakarta-sans", // Nome da variável CSS conforme style.css
  weight: ['400', '500', '600', '700', '800']
});

export const metadata: Metadata = {
  title: "Sistema de Agendamentos | UFMA",
  description: "Gestão inteligente de espaços acadêmicos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" data-theme="light">
      <head>
        {/* FontAwesome original compatível com os ícones usados no app.js */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" 
        />
      </head>
      <body className={`${inter.variable} ${jakarta.variable} custom-scrollbar`}>
        <div id="appContainer" className="app-container">
          <Sidebar />
          <main className="main-content">
            <TopBar />
            <div className="content-wrapper custom-scrollbar">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
