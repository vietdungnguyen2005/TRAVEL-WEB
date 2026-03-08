import { auth } from "@/lib/auth-session";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

interface MainLayoutProps {
  children: React.ReactNode;
  navbarVariant?: "solid" | "transparent";
}

export async function MainLayout({ children, navbarVariant = "solid" }: MainLayoutProps) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={session?.user} variant={navbarVariant} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
