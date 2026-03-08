"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Hotel, User, LogOut, Settings, Calendar, Star, Menu, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

interface NavbarProps {
  user?: NavbarUser | null;
  variant?: "solid" | "transparent";
}

/**
 * Parse JWT payload from access_token cookie (client-side only).
 * Returns null if not present or invalid.
 */
function getUserFromCookie(): NavbarUser | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("access_token="));
  if (!match) return null;
  try {
    const token = decodeURIComponent(match.substring("access_token=".length));
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const json = JSON.parse(atob(padded));
    if (!json.sub && !json.id) return null;
    return {
      name: json.name || null,
      email: json.email || null,
      role: json.role,
    };
  } catch {
    return null;
  }
}

const navLinks = [
  { href: "/", label: "Trang chủ" },
  { href: "/rooms", label: "Phòng" },
  { href: "/about", label: "Về chúng tôi" },
  { href: "/contact", label: "Liên hệ" },
];

export function Navbar({ user: userProp, variant = "solid" }: NavbarProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cookieUser, setCookieUser] = useState<NavbarUser | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  // Read cookie on mount and on every navigation change
  useEffect(() => {
    const fromCookie = getUserFromCookie();
    setCookieUser(fromCookie);
    setHasMounted(true);
  }, [pathname]);

  // Use server prop first; fall back to cookie-based user after mount
  const user = userProp ?? (hasMounted ? cookieUser : null);

  const isTransparent = variant === "transparent" && !scrolled;

  useEffect(() => {
    if (variant !== "transparent") return;

    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [variant]);

  const isActive = (path: string) => pathname === path;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isTransparent
          ? "bg-gradient-to-b from-black/60 via-black/30 to-transparent border-transparent"
          : "bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 border-b shadow-sm"
      )}
    >
      <div className="container flex h-20 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl transition-colors",
            isTransparent ? "bg-white/20" : "bg-primary/10"
          )}>
            <Hotel className={cn(
              "h-5 w-5 transition-colors",
              isTransparent ? "text-white" : "text-primary"
            )} />
          </div>
          <span className={cn(
            "font-bold text-2xl transition-colors",
            isTransparent ? "text-white" : "text-foreground"
          )}>
            Travel<span className="text-gold">Book</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative px-4 py-2 text-[15px] font-medium rounded-lg transition-all",
                isActive(link.href)
                  ? isTransparent
                    ? "text-white bg-white/15"
                    : "text-primary bg-primary/5"
                  : isTransparent
                    ? "text-white/85 hover:text-white hover:bg-white/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-gold rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Hotline - desktop only */}
          <div className={cn(
            "hidden xl:flex items-center gap-2 text-sm font-medium mr-2",
            isTransparent ? "text-white/85" : "text-muted-foreground"
          )}>
            <Phone className="h-4 w-4" />
            <span>1900 2468</span>
          </div>

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "relative h-10 w-10 rounded-full",
                    isTransparent && "hover:bg-white/15"
                  )}
                >
                  <Avatar className="h-10 w-10 ring-2 ring-gold/50">
                    <AvatarImage src={user.image || ""} alt={user.name || ""} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === "ADMIN" && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <User className="mr-2 h-4 w-4" />
                    <span>Tài khoản của tôi</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/bookings">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Đặt phòng của tôi</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/reviews">
                    <Star className="mr-2 h-4 w-4" />
                    <span>Đánh giá của tôi</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/auth/logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button
                variant="ghost"
                asChild
                className={cn(
                  isTransparent && "text-white hover:bg-white/15 hover:text-white"
                )}
              >
                <Link href="/auth/login">Đăng nhập</Link>
              </Button>
              <Button
                asChild
                className="bg-gold text-gold-foreground hover:bg-gold/90 shadow-md"
              >
                <Link href="/auth/register">Đăng ký</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "lg:hidden",
                  isTransparent && "text-white hover:bg-white/15"
                )}
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Hotel className="h-5 w-5 text-primary" />
                  <span className="font-bold text-xl">
                    Travel<span className="text-gold">Book</span>
                  </span>
                </SheetTitle>
              </SheetHeader>

              <Separator />

              {/* Mobile Nav Links */}
              <nav className="flex flex-col gap-1 px-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-3 rounded-xl text-[15px] font-medium transition-colors",
                      isActive(link.href)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <Separator />

              {/* Mobile Hotline */}
              <div className="flex items-center gap-2 px-6 py-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>Hotline: <strong className="text-foreground">1900 2468</strong></span>
              </div>

              <Separator />

              {/* Mobile Auth */}
              <div className="px-4 mt-auto">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.image || ""} alt={user.name || ""} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                    >
                      <User className="h-4 w-4" />
                      Tài khoản của tôi
                    </Link>
                    <Link
                      href="/dashboard/bookings"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                    >
                      <Calendar className="h-4 w-4" />
                      Đặt phòng của tôi
                    </Link>
                    <Separator />
                    <Link
                      href="/auth/logout"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Đăng xuất
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button asChild variant="outline" className="w-full" onClick={() => setMobileOpen(false)}>
                      <Link href="/auth/login">Đăng nhập</Link>
                    </Button>
                    <Button asChild className="w-full bg-gold text-gold-foreground hover:bg-gold/90" onClick={() => setMobileOpen(false)}>
                      <Link href="/auth/register">Đăng ký</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
