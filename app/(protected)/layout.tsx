import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div id="appContainer" className="app-container">
      <Sidebar />
      <main className="main-content">
        <TopBar />
        <div className="content-wrapper custom-scrollbar">{children}</div>
      </main>
    </div>
  );
}
