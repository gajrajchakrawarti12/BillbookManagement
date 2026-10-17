"use client"
import { Link, useLocation } from "react-router-dom"
import { cn } from "../lib/utils"
import { BarChart3, FileText, Home, Package, Settings, ShoppingCart, Users, CreditCard, X, Plus } from "lucide-react"
import { Button } from "./ui/Button"

const navItems = [
  { name: "Overview", href: "/", icon: Home },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Products", href: "/products", icon: Package },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Payments", href: "/payments", icon: CreditCard },
]

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const location = useLocation()

  const sidebar = (
    <div className="flex h-full flex-col bg-[#102a43] text-[#c9d8e7]">
      <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
        <Link to="/" onClick={onClose} className="flex items-center gap-3 text-white">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#55d6a2] text-[#102a43] shadow-lg shadow-black/10">
            <ShoppingCart className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">billbook<span className="text-[#55d6a2]">.</span></span>
        </Link>
        {onClose && (
          <Button variant="ghost" size="icon" className="text-slate-400 hover:bg-white/10 hover:text-white lg:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      <nav className="flex-1 space-y-1 px-3 py-5">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#829ab1]">Workspace</p>
        {navItems.map((item) => {
          const isActive = location.pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "bg-[#55d6a2] font-semibold text-[#102a43] shadow-lg shadow-black/20" : "text-[#a8bdd0] hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              {item.name}
            </Link>
          )
        })}
        <p className="mb-3 mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#829ab1]">Manage</p>
        <Link to="/reports" onClick={onClose} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors", location.pathname === "/reports" ? "bg-white/10 text-white" : "text-[#a8bdd0] hover:bg-white/10 hover:text-white")}>
          <BarChart3 className="h-[18px] w-[18px]" />
          Reports
        </Link>
        <Link to="/settings" onClick={onClose} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors", location.pathname === "/settings" ? "bg-white/10 text-white" : "text-[#a8bdd0] hover:bg-white/10 hover:text-white")}>
          <Settings className="h-[18px] w-[18px]" />
          Settings
        </Link>
      </nav>
      <div className="m-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs font-medium text-white">Need a hand?</p>
        <p className="mt-1 text-xs leading-5 text-[#829ab1]">Review your billing activity and keep your books current.</p>
        <Button asChild variant="ghost" size="sm" className="mt-3 h-8 w-full justify-start gap-2 px-0 text-emerald-300 hover:bg-transparent hover:text-emerald-200">
          <Link to="/invoices/new"><Plus className="h-4 w-4" /> Create invoice</Link>
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <div className="hidden h-full w-[248px] shrink-0 lg:block">{sidebar}</div>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden" onClick={onClose}>
          <div className="h-full w-[280px] shadow-2xl" onClick={(event) => event.stopPropagation()}>{sidebar}</div>
        </div>
      )}
    </>
  )
}
