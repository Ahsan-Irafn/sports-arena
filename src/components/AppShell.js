"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { isAuthenticated } from "@/lib/auth";

function ShellInner({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check authentication on protected routes
    if (!isAuthenticated() && pathname !== "/login" && !pathname.startsWith("/receipt/")) {
      router.replace("/login");
    }
  }, [pathname, router]);

  // Login page gets a clean standalone screen without sidebar or topbar
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Printable receipt gets clean standalone layout
  if (pathname.startsWith("/receipt/")) {
    return <>{children}</>;
  }

  // Protected App Shell: render identical layout on SSR and CSR for zero hydration mismatch
  return (
    <div className="app-container">
      <Sidebar />
      <div className="app-main">
        <Topbar />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}

export default function AppShell({ children }) {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
          <div style={{ color: "var(--text-muted)" }}>Loading Portal...</div>
        </div>
      }
    >
      <ShellInner>{children}</ShellInner>
    </Suspense>
  );
}
