import type { ReactNode } from "react";

// Layout minimal para rotas de autenticação (/login)
// Não inclui Sidebar nem TopBar — apenas renderiza os filhos diretamente.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
