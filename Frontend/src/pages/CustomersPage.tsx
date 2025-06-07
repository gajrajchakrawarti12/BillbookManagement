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
import { Edit, Trash2, Plus, Search, Mail, Phone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../requests/requests";
import type { Customer } from "../interfaces/Customer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/Select";
import { Company } from "../interfaces/Company";
import { useAuth } from "../contexts/AuthContext";
import { getCompany } from "../requests/CompanyRequest";
import { deleteCustomer, getCustomers } from "../requests/customerRequest";

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [cities, setCities] = useState<string[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        if (!auth?.user?._id) throw new Error("User ID is undefined");

        const res = await getCompany(auth.user?.companyId ?? '');
        if (!res?.company?._id) {
          return;
        }

        setCompany(res.company);
        const response = await getCustomers(res.company._id);

        if (response && Array.isArray(response)) {
          setCustomers(response);

          const uniqueCities = [
            ...new Set(
              response
                .map((c) => c?.address?.city?.toLowerCase())
                .filter(Boolean)
            ),
          ];
          setCities(uniqueCities);
        }
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = customers
    .filter((customer) => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch =
        customer.fullName.toLowerCase().includes(lowerSearch) ||
        customer.email?.toLowerCase().includes(lowerSearch) ||
        customer.phone?.toLowerCase().includes(lowerSearch) ||
        company?.fullName?.toLowerCase().includes(lowerSearch);

      const customerCity = customer?.address?.city?.toLowerCase();
      const matchesCity = cityFilter === "all" || customerCity === cityFilter;

      return matchesSearch && matchesCity;
    })
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  const handleDeleteCustomer = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this customer?"))
      return;
    try {
      await deleteCustomer(id);
      setCustomers((prev) => prev.filter((c) => c._id !== id));
    } catch (error) {
      console.error("Failed to delete customer:", error);
    } finally {
      window.location.reload();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <Link to="/customers/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
          <CardDescription>
            View and manage your customer database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search customers..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city.charAt(0).toUpperCase() + city.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No customers found. Try a different search or add a new customer.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Total Billed</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer._id}>
                      <TableCell className="font-medium">
                        <Link
                          to={`/customers/${customer._id}`}
                          className="hover:text-blue-600"
                        >
                          {customer.fullName}
                        </Link>
                      </TableCell>
                      <TableCell>{company?.fullName || "—"}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {customer.email && (
                            <div className="flex items-center text-sm">
                              <Mail className="h-3 w-3 mr-1 text-gray-400" />
                              <a
                                href={`mailto:${customer.email}`}
                                className="hover:text-blue-600"
                              >
                                {customer.email}
                              </a>
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center text-sm">
                              <Phone className="h-3 w-3 mr-1 text-gray-400" />
                              <a
                                href={`tel:${customer.phone}`}
                                className="hover:text-blue-600"
                              >
                                {customer.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{customer?.address?.city || "—"}</TableCell>
                      <TableCell>
                        ₹{(customer.totalBilled || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {customer.outstandingAmount ? (
                          <span className="text-red-600">
                            ₹{customer.outstandingAmount.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-green-600">₹0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link to={`/invoices/new?customer=${customer._id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600"
                            >
                              New Invoice
                            </Button>
                          </Link>
                          <Link to={`/customers/edit/${customer._id}`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              customer._id && handleDeleteCustomer(customer._id)
                            }
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
