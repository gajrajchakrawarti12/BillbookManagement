"use client"
import React from "react"
import { useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "../components/ui/Button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card"
import {
  BarChart3,
  FileText,
  Package,
  Users,
  CreditCard,
  Shield,
  ArrowRight,
  Check,
} from "lucide-react"

export function LandingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate("/")
    }
  }, [user, navigate])

  return (
    <div className="min-h-screen overflow-hidden bg-[#f4f7fb] text-[#102a43]">
      {/* Header */}
      <header className="border-b border-[#d9e2ec]/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#123b5d] text-[#55d6a2]">
              <Package className="h-5 w-5" />
            </span>
            <span className="text-xl font-bold tracking-tight">billbook<span className="text-[#39b982]">.</span></span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden sm:inline-flex">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button>
              <Link to="/signup">Start free <ArrowRight className="inline h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="app-grid relative mx-auto max-w-7xl px-5 py-24 text-center lg:px-8 lg:py-32">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[#b8ead4] bg-[#ecfbf4] px-3 py-1.5 text-xs font-bold text-[#17624a]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#39b982]" /> Built for growing businesses
        </div>
        <h1 className="mx-auto max-w-4xl text-5xl font-black leading-[1.05] tracking-[-0.04em] text-[#102a43] md:text-7xl">
          Billing that keeps your business
          <span className="block text-[#159a6a]">moving forward.</span>
        </h1>
        <p className="mx-auto mb-9 mt-7 max-w-2xl text-lg leading-8 text-[#627d98]">
          Create beautiful invoices, track payments, and understand your numbers in one calm, focused workspace.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg">
            <Link to="/signup">Start for free <ArrowRight className="inline h-4 w-4" /></Link>
          </Button>
          <Button variant="outline" size="lg">
            <Link to="/login">Explore the dashboard</Link>
          </Button>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold text-[#627d98]">
          {["No credit card", "GST-ready", "Secure by default"].map((item) => <span key={item}><Check className="mr-1 inline h-3.5 w-3.5 text-[#159a6a]" />{item}</span>)}
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="mb-12 max-w-xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#159a6a]">Everything in one place</p>
          <h2 className="text-3xl font-black tracking-tight text-[#102a43] md:text-4xl">Less admin. More momentum.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="transition-transform hover:-translate-y-1">
            <CardHeader>
              <FileText className="mb-3 h-10 w-10 rounded-xl bg-[#e8f5ef] p-2 text-[#159a6a]" />
              <CardTitle>Smart Invoicing</CardTitle>
              <CardDescription>
                Create professional invoices with GST compliance, automatic calculations, and customizable templates.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-transform hover:-translate-y-1">
            <CardHeader>
              <Users className="mb-3 h-10 w-10 rounded-xl bg-[#eef1ff] p-2 text-[#5b67c9]" />
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>
                Keep track of all your customers, their contact details, billing addresses, and transaction history.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-transform hover:-translate-y-1">
            <CardHeader>
              <Package className="mb-3 h-10 w-10 rounded-xl bg-[#fff4df] p-2 text-[#c17b16]" />
              <CardTitle>Inventory Control</CardTitle>
              <CardDescription>
                Manage your products and services, track stock levels, and get low stock alerts automatically.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-transform hover:-translate-y-1">
            <CardHeader>
              <CreditCard className="mb-3 h-10 w-10 rounded-xl bg-[#f2eaff] p-2 text-[#8a55c7]" />
              <CardTitle>Payment Tracking</CardTitle>
              <CardDescription>
                Monitor payments, track due dates, and send automated payment reminders to customers.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-transform hover:-translate-y-1">
            <CardHeader>
              <BarChart3 className="mb-3 h-10 w-10 rounded-xl bg-[#e7f4fb] p-2 text-[#287da5]" />
              <CardTitle>Business Reports</CardTitle>
              <CardDescription>
                Get insights into your business performance with detailed reports and analytics.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-transform hover:-translate-y-1">
            <CardHeader>
              <Shield className="mb-3 h-10 w-10 rounded-xl bg-[#ffe9ed] p-2 text-[#c6536c]" />
              <CardTitle>GST Compliance</CardTitle>
              <CardDescription>
                Stay compliant with Indian GST regulations with built-in tax calculations and reporting.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-5 rounded-[2rem] bg-[#123b5d] py-20 text-white lg:mx-auto lg:max-w-7xl">
        <div className="mx-auto max-w-2xl px-5 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="mb-8 text-lg leading-8 text-[#c9d8e7]">
            Set up your workspace in minutes and spend your time on the work that matters.
          </p>
          <Button size="lg" variant="secondary">
            <Link to="/signup">Start Your Free Trial</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#102a43] py-12 text-white">
        <div className="mx-auto max-w-7xl px-5 text-center lg:px-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Package className="h-6 w-6" />
            <span className="text-xl font-bold">Billbook</span>
          </div>
          <p className="mb-4 text-[#829ab1]">A clearer way to run your billing.</p>
          <p className="text-sm text-[#829ab1]">© 2026 Billbook. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
