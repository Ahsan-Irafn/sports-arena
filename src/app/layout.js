import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "3X Sports Arena · Management & Booking Portal",
  description: "Modern, bug-free booking, cash, and financial management system for 3X Sports Arena, Lahore",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
