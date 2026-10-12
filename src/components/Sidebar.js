"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Shield,
  Tags,
  Receipt,
  Users,
  Trophy,
  Wallet,
  LogOut
} from "lucide-react";
import { logout, getCurrentUser } from "@/lib/auth";

function SidebarNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Bookings & Calendar", href: "/bookings", icon: CalendarDays },
    { label: "Courts & Rates", href: "/courts", icon: Trophy },
    { label: "Expense Categories", href: "/expense-categories", icon: Tags },
    { label: "Expenses & Cash", href: "/expenses", icon: Wallet },
    { label: "Customers (CRM)", href: "/customers", icon: Users },
  ];

  return (
    <nav className="sidebar-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname?.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${isActive ? "active" : ""}`}
          >
            <Icon className="nav-icon" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out of the arena portal?")) {
      logout();
      window.location.href = "/login";
    }
  };

  return (
    <aside className="app-sidebar no-print">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="logo-badge">
          <span>3X</span>
        </div>
        <div className="sidebar-title">
          <h2>3X Sports Arena</h2>
          <span>Admin Portal · Lahore</span>
        </div>
      </div>

      {/* Navigation Links wrapped in Suspense */}
      <Suspense fallback={<div style={{ padding: "16px", color: "var(--text-muted)" }}>Loading menu...</div>}>
        <SidebarNav />
      </Suspense>

      {/* Admin User Footer with Logout */}
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar" suppressHydrationWarning>
            {user ? user.name.slice(0, 2).toUpperCase() : "AD"}
          </div>
          <div className="user-info">
            <p suppressHydrationWarning>{user ? user.name : "Arena Admin"}</p>
            <span suppressHydrationWarning>{user ? user.email : "admin@3xsportsarena.pk"}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Sign Out of Portal"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-dim)",
            cursor: "pointer",
            padding: "6px",
            borderRadius: "var(--radius-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--accent-red)";
            e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-dim)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <LogOut style={{ width: 17, height: 17 }} />
        </button>
      </div>
    </aside>
  );
}

