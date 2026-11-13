"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  Receipt,
  UserCheck,
  BarChart3,
  FileText,
  Settings,
  LogOut
} from "lucide-react";
import { logoutAction } from "@/app/(auth)/login/actions";

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Members', href: '/dashboard/members', icon: Users },
  { name: 'Classes & Attendance', href: '/dashboard/classes', icon: Calendar },
  { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
  { name: 'Expenses', href: '/dashboard/expenses', icon: Receipt },
  { name: 'Staff & Payroll', href: '/dashboard/staff', icon: UserCheck },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#09090b] flex">
      {/* Fixed Sidebar */}
      <aside className="w-64 bg-[#09090b] border-r border-white/5 hidden md:flex flex-col h-screen sticky top-0">
        <div className="h-16 flex items-center px-6 border-b border-white/5 shrink-0">
          <span className="text-xl font-bold text-white tracking-wider">FIT<span className="text-brand-red">CORE</span></span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = item.href === '/dashboard' 
              ? pathname === '/dashboard' 
              : pathname.startsWith(item.href);

            return (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all group ${
                  isActive 
                    ? "bg-brand-red text-white shadow-lg shadow-brand-red/20" 
                    : "text-brand-gray hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className={`h-5 w-5 mr-3 transition-colors ${
                  isActive ? "text-white" : "text-brand-gray group-hover:text-brand-red"
                }`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 shrink-0">
          <form action={logoutAction}>
            <button type="submit" className="flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-xl text-brand-gray hover:text-white hover:bg-red-500/10 transition-all group">
              <LogOut className="h-5 w-5 mr-3 text-brand-gray group-hover:text-red-500 transition-colors" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#09090b]/50 backdrop-blur-md shrink-0 sticky top-0 z-10">
          <div className="md:hidden text-xl font-bold text-white tracking-wider">FIT<span className="text-brand-red">CORE</span></div>
          <div className="flex items-center gap-4 ml-auto">
            <div className="h-8 w-8 rounded-full bg-brand-red flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}