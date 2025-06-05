"use client"
import React from "react"
import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "../lib/utils"
import { BarChart3, FileText, Home, Package, Settings, ShoppingCart, Users, CreditCard, Menu, X } from "lucide-react"
import { Button } from "./ui/Button"
import { useIsMobile } from "../hooks/useIsMobile"

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Products", href: "/products", icon: Package },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const location = useLocation()
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-gray-50 border-r">
      <div className="p-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <ShoppingCart className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-bold">Billbook</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => isMobile && setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-blue-600 text-white" : "hover:bg-gray-100",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="p-4">
        <p className="text-xs text-gray-500">© {new Date().getFullYear()} Billbook</p>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <>
        <Button variant="ghost" size="icon" className="fixed left-4 top-4 z-50 md:hidden" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
        {isOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={toggleSidebar}>
            <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white" onClick={(e) => e.stopPropagation()}>
              <div className="absolute right-2 top-2">
                <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              {sidebar}
            </div>
          </div>
        )}
      </>
    )
  }

  return <div className="hidden w-64 md:block h-full">{sidebar}</div>
}
