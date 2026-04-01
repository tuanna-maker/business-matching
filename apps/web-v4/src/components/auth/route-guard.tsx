"use client";

import { useAuth } from "@/lib/auth-context";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const PUBLIC_ROUTES = ["/login", "/register"];

function isLoginPath(path: string | null): boolean {
  return path === "/login" || path?.startsWith("/login/") === true;
}

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute = PUBLIC_ROUTES.some(
    (r) => pathname === r || pathname?.startsWith(r + "/")
  );

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !isPublicRoute) {
      router.replace("/login");
    }

    // Only bounce away from login when already signed in. /register stays reachable
    // (e.g. from profile help link) so users can see the role step or create another account.
    if (isAuthenticated && isLoginPath(pathname)) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, isPublicRoute, pathname, router]);

  // Loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-slate-200/80 border-t-brand animate-spin" />
          <span className="text-slate-600/40 text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  // Not authenticated and not on public route → show nothing while redirecting
  if (!isAuthenticated && !isPublicRoute) return null;

  if (isAuthenticated && isLoginPath(pathname)) return null;

  return <>{children}</>;
}
