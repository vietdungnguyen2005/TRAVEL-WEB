import { auth } from "@/lib/auth-session";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

interface MainLayoutProps {
  children: React.ReactNode;
}

export async function MainLayout({ children }: MainLayoutProps) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={session?.user} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
