"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Trophy,
  Wallet,
  Users
} from "lucide-react";

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/dashboard", icon: LayoutDashboard },
    { label: "Bookings", href: "/bookings", icon: CalendarDays },
    { label: "Courts", href: "/courts", icon: Trophy },
    { label: "Expenses", href: "/expenses", icon: Wallet },
    { label: "Players", href: "/customers", icon: Users },
  ];

  return (
    <nav className="mobile-bottom-nav no-print" aria-label="Mobile Navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname?.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`bottom-nav-item ${isActive ? "active" : ""}`}
          >
            <div className="bottom-nav-icon-box">
              <Icon className="bottom-nav-icon" />
              {isActive && <span className="active-dot" />}
            </div>
            <span className="bottom-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
