// Layout minimal para rotas de autenticação (/login)
// Não inclui Sidebar nem TopBar — apenas renderiza os filhos diretamente.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
