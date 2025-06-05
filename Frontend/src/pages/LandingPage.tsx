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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">Billbook</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost">
              <Link to="/login">Login</Link>
            </Button>
            <Button>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Simplify Your Business
          <span className="text-blue-600 block">Billing & Invoicing</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Streamline your invoice management, track customers, manage inventory, and grow your business with our
          comprehensive billing solution.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button size="lg">
            <Link to="/signup">Start Free Trial</Link>
          </Button>
          <Button variant="outline" size="lg">
            <Link to="/login">Login to Dashboard</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Everything You Need to Manage Your Business</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Smart Invoicing</CardTitle>
              <CardDescription>
                Create professional invoices with GST compliance, automatic calculations, and customizable templates.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>
                Keep track of all your customers, their contact details, billing addresses, and transaction history.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Package className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Inventory Control</CardTitle>
              <CardDescription>
                Manage your products and services, track stock levels, and get low stock alerts automatically.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CreditCard className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Payment Tracking</CardTitle>
              <CardDescription>
                Monitor payments, track due dates, and send automated payment reminders to customers.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Business Reports</CardTitle>
              <CardDescription>
                Get insights into your business performance with detailed reports and analytics.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>GST Compliance</CardTitle>
              <CardDescription>
                Stay compliant with Indian GST regulations with built-in tax calculations and reporting.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of businesses already using Billbook to streamline their operations.
          </p>
          <Button size="lg" variant="secondary">
            <Link to="/signup">Start Your Free Trial</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Package className="h-6 w-6" />
            <span className="text-xl font-bold">Billbook</span>
          </div>
          <p className="text-gray-400 mb-4">The complete billing and invoicing solution for modern businesses.</p>
          <p className="text-gray-400">© 2024 Billbook. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
