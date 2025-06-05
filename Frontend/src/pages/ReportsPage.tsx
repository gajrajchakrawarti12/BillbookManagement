import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"

export function ReportsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Reports</h1>

      <Card>
        <CardHeader>
          <CardTitle>Business Reports</CardTitle>
          <CardDescription>View detailed business analytics and reports.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Reports will appear here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
