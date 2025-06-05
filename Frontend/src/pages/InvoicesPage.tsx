import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/Table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  FileText,
  Calendar,
} from "lucide-react";
import { Link } from "react-router-dom";
import API_URL from "../requests/requests";
import type { Invoice } from "../interfaces/Invoice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/Select";
import { getInvoices } from "../requests/InvoiceRequest";
import { getCompany } from "../requests/CompanyRequest";
import { useAuth } from "../contexts/AuthContext";

export function InvoicesPage() {
  const auth = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const companyRes = await getCompany(auth?.user?._id ?? "");
        const response = await getInvoices(companyRes.company._id);
        console.log(response);
        
        if (response && Array.isArray(response)) {
          setInvoices(response);
        }
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  // Filter invoices based on search term and status
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter ? invoice.status === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

  const handleDeleteInvoice = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await axios.delete(`${API_URL}/invoices/${id}`, {
          withCredentials: true,
        });
        setInvoices((prev) => prev.filter((invoice) => invoice._id !== id));
      } catch (error) {
        console.error("Failed to delete invoice:", error);
      }
    }
  };

  // Helper function to get badge variant based on invoice status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Draft
          </Badge>
        );
      case "sent":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Sent
          </Badge>
        );
      case "paid":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Paid
          </Badge>
        );
      case "partial":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Partial
          </Badge>
        );
      case "overdue":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Overdue
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
        <Button className="bg-blue-600 hover:bg-blue-700 flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          <Link to="/invoices/new">Create Invoice</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Management</CardTitle>
          <CardDescription>
            Create, view and manage all your customer invoices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search invoice number or customer..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="w-full md:w-64">
              <Select
                value={statusFilter || "all"}
                onValueChange={(value) =>
                  setStatusFilter(value === "all" ? "" : value)
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No invoices found. Try a different search or create a new invoice.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice._id}>
                      <TableCell className="font-medium">
                        <Link
                          to={`/invoices/${invoice._id}`}
                          className="hover:text-blue-600"
                        >
                          {invoice.invoiceNumber}
                        </Link>
                      </TableCell>
                      <TableCell>{invoice.customerId}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                          {new Date(invoice.createdAt || "").toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {invoice.dueDate ? (
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                            {new Date(invoice?.dueDate || "").toLocaleDateString()}
                          </div>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        ₹{invoice.total.toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link to={`/invoices/${invoice._id}`}>
                            <Button variant="ghost" size="sm" title="View">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link to={`/invoices/edit/${invoice._id}`}>
                            <Button variant="ghost" size="sm" title="Edit">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              invoice._id && handleDeleteInvoice(invoice._id)
                            }
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
