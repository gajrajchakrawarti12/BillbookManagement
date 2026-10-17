import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CreditCard,
  FileText,
  Package,
  Plus,
  Receipt,
  Users,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import {
  getBusinessDashboard,
  getBusinesses,
  type DashboardSummary,
} from "../requests/businessRequest";
import { getInvoices } from "../requests/InvoiceRequest";
import type { EntityId } from "../interfaces/Company";

interface RecentInvoice {
  id: EntityId;
  number: string;
  buyer: string;
  status: string;
  total: number;
  createdAt?: string;
}

function formatCurrency(value: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function asNumber(value: unknown): number {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : 0;
}

function toRecentInvoice(invoice: Record<string, unknown>): RecentInvoice {
  return {
    id: (invoice.id ?? invoice._id ?? "") as EntityId,
    number: String(invoice.invoice_number ?? invoice.invoiceNumber ?? "Invoice"),
    buyer: String(invoice.buyer_name_snapshot ?? invoice.buyerNameSnapshot ?? "Unnamed customer"),
    status: String(invoice.status_code ?? invoice.status ?? "DRAFT"),
    total: asNumber(invoice.total_incl_tax ?? invoice.totalInclTax ?? invoice.total),
    createdAt: String(invoice.created_at ?? invoice.createdAt ?? ""),
  };
}

export function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([]);
  const [hasBusiness, setHasBusiness] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setIsLoading(true);
        setLoadError(null);
        const businesses = await getBusinesses();
        const businessId = user?.businessId || user?.companyId || businesses[0]?.id;
        const business = businesses.find((item) => String(item.id) === String(businessId)) || businesses[0];

        if (!business) {
          if (isMounted) {
            setHasBusiness(false);
            setSummary(null);
            setRecentInvoices([]);
          }
          return;
        }

        const [dashboard, invoices] = await Promise.all([
          getBusinessDashboard(business.id),
          getInvoices(business.id),
        ]);
        if (isMounted) {
          setSummary(dashboard);
          const dashboardBusiness = dashboard.business;
          const nextBusinessName =
            dashboardBusiness &&
            (typeof dashboardBusiness.display_name === "string"
              ? dashboardBusiness.display_name
              : typeof dashboardBusiness.displayName === "string"
                ? dashboardBusiness.displayName
                : null);
          setBusinessName(nextBusinessName || business.displayName || business.legalName || null);
          setRecentInvoices(
            (Array.isArray(invoices) ? invoices : [])
              .map((invoice) => toRecentInvoice(invoice as unknown as Record<string, unknown>))
              .slice(0, 5),
          );
          setHasBusiness(true);
        }
      } catch (error) {
        if (isMounted) {
          setHasBusiness(false);
          setRecentInvoices([]);
          setLoadError(error instanceof Error ? error.message : "Unable to load workspace data.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, [user?.businessId, user?.companyId]);

  const firstName = useMemo(
    () => (user?.displayName || user?.fullName || "there").split(" ")[0],
    [user],
  );
  const metrics = [
    {
      label: "Revenue",
      value: formatCurrency(
        summary?.totalRevenue ?? summary?.revenue ?? asNumber(summary?.issuedAmount),
      ),
      note: "Across issued invoices",
      icon: Receipt,
      tone: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Open invoices",
      value: String(summary?.pendingInvoices ?? Math.max(asNumber(summary?.invoices) - asNumber(summary?.paidInvoices), 0)),
      note: "Awaiting payment",
      icon: FileText,
      tone: "bg-blue-50 text-blue-600",
    },
    {
      label: "Customers",
      value: String(summary?.totalCustomers ?? summary?.totalSubjects ?? summary?.customers ?? 0),
      note: "Active subjects",
      icon: Users,
      tone: "bg-violet-50 text-violet-600",
    },
    {
      label: "Outstanding",
      value: summary?.outstandingAmount === undefined ? "—" : formatCurrency(summary.outstandingAmount),
      note: summary?.outstandingAmount === undefined ? "Not provided by the API" : "Needs your attention",
      icon: CreditCard,
      tone: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-medium text-emerald-600">{businessName}</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
            Good morning, {firstName}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Here is a clear view of your business activity and what needs attention today.
          </p>
        </div>
        <Button asChild className="rounded-xl bg-slate-950 px-4 shadow-lg shadow-slate-950/10 hover:bg-slate-800">
          <Link to="/invoices/new"><Plus className="h-4 w-4" /> New invoice</Link>
        </Button>
      </section>

      {loadError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-red-800">{loadError}</p>
            <Button variant="outline" className="border-red-200 bg-white text-red-700" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {!hasBusiness && !isLoading && (
        <Card className="border-emerald-200 bg-emerald-50/70 shadow-none">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-slate-900">Create your first business workspace</p>
              <p className="mt-1 text-sm text-slate-600">Add a business to start tracking invoices, payments, and customers.</p>
            </div>
            <Button asChild variant="outline" className="rounded-xl border-emerald-300 bg-white">
              <Link to="/settings">Set up workspace <ArrowUpRight className="h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, note, icon: Icon, tone }) => (
          <Card key={label} className="border-slate-200/80 shadow-sm shadow-slate-200/50">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{label}</p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                    {isLoading ? <span className="inline-block h-7 w-24 animate-pulse rounded bg-slate-100" /> : value}
                  </p>
                </div>
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span>
              </div>
              <p className="mt-4 text-xs text-slate-400">{note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card className="border-slate-200/80 shadow-sm shadow-slate-200/50">
          <CardHeader className="flex-row items-center justify-between border-b border-slate-100 px-5 py-5">
            <div>
              <CardTitle className="text-base font-semibold">Recent invoices</CardTitle>
              <p className="mt-1 text-sm text-slate-500">Your latest billing activity will appear here.</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="rounded-lg text-emerald-700 hover:text-emerald-800">
              <Link to="/invoices">View all <ArrowUpRight className="h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-5">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-slate-100" />)}
              </div>
            ) : recentInvoices.length === 0 ? (
              <div className="flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 text-center">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-slate-400 shadow-sm"><FileText className="h-5 w-5" /></span>
                <p className="mt-3 text-sm font-medium text-slate-700">No recent invoices yet</p>
                <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">Create an invoice to see your most recent billing activity here.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentInvoices.map((invoice) => (
                  <Link key={String(invoice.id)} to={`/invoices/${invoice.id}`} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0 hover:bg-slate-50">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{invoice.number}</p>
                      <p className="truncate text-xs text-slate-500">{invoice.buyer}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-slate-800">{formatCurrency(invoice.total)}</p>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{invoice.status}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm shadow-slate-200/50">
          <CardHeader className="px-5 py-5">
            <CardTitle className="text-base font-semibold">Quick actions</CardTitle>
            <p className="mt-1 text-sm text-slate-500">Jump back into your daily workflow.</p>
          </CardHeader>
          <CardContent className="grid gap-2 px-5 pb-5">
            {[
              { label: "Add a customer", href: "/customers/new", icon: Users },
              { label: "Add a product", href: "/products/new", icon: Package },
              { label: "Record a payment", href: "/payments", icon: CreditCard },
            ].map(({ label, href, icon: Icon }) => (
              <Button asChild key={href} variant="outline" className="h-12 justify-between rounded-xl border-slate-200 bg-white px-4 text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/50">
                <Link to={href}><span className="flex items-center gap-3"><Icon className="h-4 w-4 text-emerald-600" />{label}</span><ArrowUpRight className="h-4 w-4 text-slate-400" /></Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
