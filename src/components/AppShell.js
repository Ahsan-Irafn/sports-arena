"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import { isAuthenticated } from "@/lib/auth";

function ShellInner({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check authentication on protected routes
    if (!isAuthenticated() && pathname !== "/login" && !pathname.startsWith("/receipt/")) {
      router.replace("/login");
    }
    // Close mobile drawer on route change
    setMobileMenuOpen(false);
  }, [pathname, router]);

  // Login page gets a clean standalone screen without sidebar or topbar
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Printable receipt gets clean standalone layout
  if (pathname.startsWith("/receipt/")) {
    return <>{children}</>;
  }

  // Protected App Shell with mobile drawer & bottom navigation
  return (
    <div className="app-container">
      {/* Mobile Drawer Backdrop */}
      <div
        className={`sidebar-backdrop ${mobileMenuOpen ? "active" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Main Sidebar (Sticky on desktop, slide-in drawer on mobile) */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="app-main">
        {/* Topbar with hamburger toggle */}
        <Topbar onToggleMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Page Content */}
        <main className="page-content">{children}</main>

        {/* Mobile Bottom Navigation Bar (Fixed at bottom on screens <= 900px) */}
        <MobileBottomNav />
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
