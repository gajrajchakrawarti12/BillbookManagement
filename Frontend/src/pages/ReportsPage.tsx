import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { useAuth } from "../contexts/AuthContext";
import { getBusinessDashboard } from "../requests/businessRequest";
import type { DashboardSummary } from "../interfaces/Company";

export function ReportsPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const businessId = user?.businessId ?? user?.companyId;
    if (!businessId) {
      setIsLoading(false);
      return;
    }
    let active = true;
    getBusinessDashboard(businessId)
      .then((response) => active && setSummary(response))
      .catch((reason: unknown) => active && setError(reason instanceof Error ? reason.message : "Unable to load reports."))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [user?.businessId, user?.companyId]);

  const metrics = summary
    ? [
        ["Active customers", summary.customers ?? summary.totalCustomers ?? summary.totalSubjects],
        ["Active products", summary.products],
        ["Invoices", summary.invoices],
        ["Issued amount", summary.issuedAmount],
        ["Paid invoices", summary.paidInvoices],
      ].filter(([, value]) => value !== undefined)
    : [];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-emerald-600">Business intelligence</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Reports</h1>
        <p className="mt-2 text-sm text-slate-500">Live aggregate values returned by the dashboard API.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workspace summary</CardTitle>
          <CardDescription>These values are fetched from the current business.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse rounded-xl bg-slate-100" />)}</div>
          ) : error ? (
            <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
          ) : metrics.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">No report data is available for this workspace.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {metrics.map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{String(value)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
