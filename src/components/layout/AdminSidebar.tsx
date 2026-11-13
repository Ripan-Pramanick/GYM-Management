"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Dumbbell, LayoutDashboard, Users, CreditCard,
  CalendarDays, Settings, LogOut, Wallet, UserCircle, Receipt
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/(auth)/login/actions";

const sidebarLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Analytics", href: "/dashboard/analytics", icon: Wallet },
  { name: "Members", href: "/dashboard/members", icon: Users },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { name: "Expenses", href: "/dashboard/expenses", icon: Receipt },
  { name: "Classes", href: "/dashboard/classes", icon: CalendarDays },
  { name: "Staff & Payroll", href: "/dashboard/staff", icon: UserCircle },
  { name: "Reports", href: "/dashboard/reports", icon: Wallet },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-brand-card border-r border-white/5 hidden md:flex flex-col h-screen sticky top-0">
      <div className="h-20 flex items-center px-6 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 group">
          <Dumbbell className="text-brand-red h-8 w-8 transition-transform group-hover:rotate-12" />
          <span className="text-xl font-bold tracking-widest text-white">FITCORE</span>
        </Link>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {sidebarLinks.map((link) => {
          // Fix: Ensure "Dashboard" only highlights on exactly "/dashboard", while others highlight on sub-routes too
          const isActive = link.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link key={link.name} href={link.href}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                  ? "bg-brand-red text-white shadow-lg shadow-brand-red/20"
                  : "text-brand-gray hover:bg-white/5 hover:text-white"
                }`}>
                <link.icon className="h-5 w-5" />
                <span className="font-medium text-sm">{link.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-[#09090b] rounded-xl border border-white/5">
          <div className="w-8 h-8 rounded-full bg-brand-red flex items-center justify-center text-white font-bold text-sm">
            AD
          </div>
          <div className="flex flex-col">
            <span className="text-white text-sm font-semibold">Admin User</span>
            <span className="text-brand-gray text-xs">Owner</span>
          </div>
        </div>
        <form action={logoutAction}>
          <Button type="submit" variant="ghost" className="w-full justify-start text-brand-gray hover:text-white hover:bg-white/5">
            <LogOut className="mr-2 h-5 w-5" /> Logout
          </Button>
        </form>
      </div>
    </aside>
  );
}