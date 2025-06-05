import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"

export function PaymentsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Payments</h1>

      <Card>
        <CardHeader>
          <CardTitle>Payment Management</CardTitle>
          <CardDescription>Track and manage your payments.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Payment list will appear here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
