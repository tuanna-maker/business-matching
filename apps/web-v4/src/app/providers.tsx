"use client";

import { AuthProvider, useAuth } from "@/lib/auth-context";
import { RouteGuard } from "@/components/auth/route-guard";
import { FloatingDock } from "@/components/layout/floating-dock";
import { usePathname } from "next/navigation";

const PUBLIC_ROUTES = ["/login", "/register"];

function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_ROUTES.some(
    (r) => pathname === r || pathname?.startsWith(r + "/")
  );

  return (
    <RouteGuard>
      {children}
      {isAuthenticated && !isPublicRoute && <FloatingDock />}
    </RouteGuard>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
