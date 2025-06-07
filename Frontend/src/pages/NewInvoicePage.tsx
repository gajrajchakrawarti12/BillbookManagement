"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  useParams,
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Button } from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { Address, Invoice, InvoiceItem } from "../interfaces/Invoice";
import { useAuth } from "../contexts/AuthContext";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { Switch } from "../components/ui/Switch";
import { format } from "date-fns";
import axios from "axios";
import toast from "react-hot-toast";
import { getCompany } from "../requests/CompanyRequest";
import { getCustomer, getCustomers } from "../requests/customerRequest";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/Table";
import { Product } from "../interfaces/Product";
import { Customer } from "../interfaces/Customer";
import { getProducts } from "../requests/productRequset";
import { Company } from "../interfaces/Company";
import Loader from "./Loader";
import { postInvoice } from "../requests/InvoiceRequest";

const API_URL = "http://localhost:5000/api/invoice";

type InvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "partial"
  | "overdue"
  | "cancelled";
type Currency = "INR" | "USD" | "EUR";

const defaultAddress: Address = {
  address: "",
  city: "",
  state: "",
  country: "",
  pincode: "",
};

const defaultItem: InvoiceItem = {
  id: Date.now().toString(),
  productId: "",
  hsn: "",
  quantity: 1,
  rate: 0,
  discount: 0,
  taxRate: 0,
  amount: 0,
};
export function NewInvoicePage() {
  const [searchParams] = useSearchParams();
  const customerId = searchParams.get("customer");
  const navigate = useNavigate();
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [company, setCompany] = useState<Company>();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customer, setCustomer] = useState<Customer>();
  const [invoice, setInvoice] = useState<Invoice>({
    invoiceNumber: "",
    customerId: "",
    dueDate: format(new Date(), "yyyy-MM-dd"),
    companyId: "",
    items: [{ ...defaultItem }],
    subTotal: 0,
    taxTotal: 0,
    total: 0,
    status: "draft",
    currency: "INR",
    isGstInvoice: false,
    isExported: false,
    address: { ...defaultAddress },
  });

  // Calculate totals whenever items change
  const totals = useMemo(() => {
    const subTotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);
    const taxTotal = invoice.items.reduce(
      (sum, item) => sum + (item.amount * (item.taxRate || 0)) / 100,
      0
    );
    return {
      subTotal,
      taxTotal,
      total: subTotal + taxTotal,
    };
  }, [invoice.items]);

  useEffect(() => {
    setInvoice((prev) => ({
      ...prev,
      ...totals,
    }));
  }, [totals]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const companyRes = await getCompany(auth.user?.companyId || "");
        if (!companyRes?.company?._id) {
          navigate("/settings")
          return;
        }
        setCompany(companyRes.company);
        setInvoice((prev) => ({
          ...prev,
          userId: (auth.user?._id)?.toString(),
          companyId: (companyRes.company?._id)?.toString(),
        }));
        const customersRes = await getCustomers(companyRes.company?._id);
        setCustomers(customersRes);
        if (customerId) {
          const selectedCustomer = customersRes.find(
            (c: Customer) => c._id == customerId
          );
          setCustomer(selectedCustomer);
          setInvoice((prev) => ({
            ...prev,
            customerId: (selectedCustomer._id)?.toString(),
          }));
        }
        const productRes = await getProducts(companyRes.company?._id);
        setProducts(productRes);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [auth, customerId]);

  const validateForm = () => {
    if (!invoice.invoiceNumber.trim()) {
      toast.error("Invoice number is required");
      return false;
    }
    if (!invoice.customerId) {
      toast.error("Customer is required");
      return false;
    }
    if (invoice.items.some((item) => !item.productId)) {
      toast.error("All items must have a product selected");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      alert("fill required  feild");
      return;
    }

    try {
      console.log(invoice);
      setIsSaving(true);
      const res = await postInvoice(invoice);
      console.log(res);
      
      toast.success("Invoice created successfully");
      navigate("/invoices");
    } catch (error) {
      console.error("Error saving invoice:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to save invoice");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const [addressType, field] = name.split(".");
      setInvoice((prev) => ({
        ...prev,
        [addressType]: {
          ...prev[addressType as "address"],
          [field]: value,
        },
      }));
    } else {
      setInvoice((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setInvoice((prev) => ({ ...prev, [name]: checked }));
  };
  const addItem = () => {
    setInvoice((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          ...defaultItem,
          id: String(Date.now() + Math.floor(Math.random() * 1000)),
        },
      ],
    }));
  };

  const removeItem = (id: string) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (String(item.id) === String(id)) {
          const updatedItem = { ...item, [field]: value };

          // Recalculate amount if relevant fields change
          if (["quantity", "rate", "discount"].includes(field)) {
            const subtotal = updatedItem.quantity * updatedItem.rate;
            const discountAmount =
              (subtotal * (updatedItem.discount || 0)) / 100;
            updatedItem.amount = subtotal - discountAmount;
          }

          return updatedItem;
        }
        return item;
      }),
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/invoices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">New Invoice</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>"Saving..." </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Information</CardTitle>
            <CardDescription>Basic invoice details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number *</Label>
                <Input
                  id="invoiceNumber"
                  name="invoiceNumber"
                  value={invoice.invoiceNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., INV-001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={invoice.dueDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={invoice.status}
                  onValueChange={(value: InvoiceStatus) =>
                    setInvoice((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={invoice.currency}
                  onValueChange={(value: Currency) =>
                    setInvoice((prev) => ({ ...prev, currency: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isGstInvoice"
                checked={invoice.isGstInvoice}
                onCheckedChange={(checked) =>
                  setInvoice((prev) => ({ ...prev, isGstInvoice: checked }))
                }
              />
              <Label htmlFor="isGstInvoice">GST Invoice</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>Customer and address details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerId">Customer *</Label>

              <Select
                value={customer?._id || invoice.customerId}
                onValueChange={(value) => {
                  const selectedCustomer = customers.find(
                    (c) => c._id === value
                  );
                  setCustomer(selectedCustomer);

                  setInvoice((prev) => ({
                    ...prev,
                    customerId: value,
                    ...(sameAsBilling && {
                      address: selectedCustomer?.address || defaultAddress,
                    }),
                  }));
                }}
              >
                <SelectTrigger id="customerId">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>

                <SelectContent>
                  {customers.map((cust) => (
                    <SelectItem key={cust._id!} value={cust._id!}>
                      {cust.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Billing Address</h3>
              <div className="grid gap-4">
                <Input
                  name="address.address"
                  value={customer?.address?.address || ""}
                  disabled
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    name="address.city"
                    value={customer?.address?.city || ""}
                    disabled
                  />
                  <Input
                    name="address.state"
                    value={customer?.address?.state || ""}
                    disabled
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    name="address.country"
                    value={customer?.address?.country || ""}
                    disabled
                  />
                  <Input
                    name="address.pincode"
                    value={customer?.address?.pincode || ""}
                    disabled
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Shipping Address</h3>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="sameAsBilling"
                    checked={sameAsBilling}
                    onCheckedChange={(checked) => {
                      setSameAsBilling(checked);
                      if (checked) {
                        setInvoice((prev) => ({
                          ...prev,
                          address: {
                            address: customer?.address?.address || "",
                            city: customer?.address?.city || "",
                            state: customer?.address?.state || "",
                            country: customer?.address?.country || "",
                            pincode: customer?.address?.pincode || "",
                          },
                        }));
                      } else {
                        setInvoice((prev) => ({
                          ...prev,
                          address: { ...defaultAddress },
                        }));
                      }
                    }}
                  />
                  <Label htmlFor="sameAsBilling">Same as billing</Label>
                </div>
              </div>

              {/* {!sameAsBilling && ( */}
              <div className="grid gap-4">
                <Input
                  name="address.address"
                  value={invoice.address?.address || ""}
                  onChange={handleInputChange}
                  placeholder="Address"
                  disabled={sameAsBilling}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    name="address.city"
                    value={invoice.address?.city || ""}
                    onChange={handleInputChange}
                    placeholder="City"
                    disabled={sameAsBilling}
                  />
                  <Input
                    name="address.state"
                    value={invoice.address?.state || ""}
                    onChange={handleInputChange}
                    placeholder="State"
                    disabled={sameAsBilling}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    name="address.country"
                    value={invoice.address?.country || ""}
                    onChange={handleInputChange}
                    placeholder="Country"
                    disabled={sameAsBilling}
                  />
                  <Input
                    name="address.pincode"
                    value={invoice.address?.pincode || ""}
                    onChange={handleInputChange}
                    placeholder="Pincode"
                    disabled={sameAsBilling}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Invoice Items</CardTitle>
              <CardDescription>
                Add products or services to this invoice.
              </CardDescription>
            </div>
            <Button onClick={addItem} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Product/Service *</TableHead>
                  <TableHead className="w-[100px]">HSN</TableHead>
                  <TableHead className="w-[80px]">Qty</TableHead>
                  <TableHead className="w-[100px]">Rate</TableHead>
                  <TableHead className="w-[80px]">Disc%</TableHead>
                  <TableHead className="w-[80px]">Tax%</TableHead>
                  <TableHead className="w-[100px]">Amount</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Select
                        value={item.productId}
                        onValueChange={(value) => {
                          const selectedProduct = products.find(
                            (p) => p._id === value
                          );
                          updateItem(item.id, "productId", value);
                          if (selectedProduct) {
                            updateItem(
                              item.id,
                              "hsn",
                              selectedProduct.hsn || ""
                            );
                            updateItem(item.id, "rate", selectedProduct.price);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product._id!} value={product._id!}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.hsn}
                        onChange={(e) =>
                          updateItem(item.id, "hsn", e.target.value)
                        }
                        placeholder="HSN"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "quantity",
                            Number(e.target.value)
                          )
                        }
                        min="1"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="text"
                        value={item.rate}
                        onChange={(e) =>
                          updateItem(item.id, "rate", Number(e.target.value))
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.discount}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "discount",
                            Number(e.target.value)
                          )
                        }
                        min="0"
                        max="100"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={item.taxRate.toString()}
                        onValueChange={(value) =>
                          updateItem(item.id, "taxRate", Number(value))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tax" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0%</SelectItem>
                          <SelectItem value="5">5%</SelectItem>
                          <SelectItem value="12">12%</SelectItem>
                          <SelectItem value="18">18%</SelectItem>
                          <SelectItem value="28">28%</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.amount.toFixed(2)}
                        readOnly
                        className="font-medium"
                      />
                    </TableCell>
                    <TableCell>
                      {invoice.items.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end">
            <div className="w-full max-w-md space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{invoice.subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax:</span>
                <span>{invoice.taxTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-bold">
                <span>Total:</span>
                <span>{invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
          <CardDescription>Notes and terms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={invoice.notes || ""}
              onChange={handleInputChange}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="termsAndConditions">Terms and Conditions</Label>
            <Textarea
              id="termsAndConditions"
              name="termsAndConditions"
              value={invoice.termsAndConditions || ""}
              onChange={handleInputChange}
              placeholder="Add terms and conditions..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
