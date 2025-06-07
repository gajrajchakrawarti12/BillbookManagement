"use client";

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
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
import { ArrowLeft } from "lucide-react";
import { Company } from "../interfaces/Company";
import { useAuth } from "../contexts/AuthContext";
import { getCompany } from "../requests/CompanyRequest";
import { postProduct } from "../requests/productRequset";

export function NewProductPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [product, setProduct] = useState({
    name: "",
    sku: "",
    hsn: "",
    category: "",
    unit: "",
    taxGroup: "",
    basePrice: "",
    sellingPrice: "",
    purchasePrice: "",
    stockQty: "",
    lowStockAlert: "",
    description: "",
  });

  useEffect(() => {
    const fetchCompany = async () => {
      if (!auth.user?._id) {
        throw new Error("User ID is undefined");
      }
      const response = await getCompany(auth.user._id);
      if (!response?.company?._id) {
        navigate("/settings");
        return;
      }
      setCompany(response?.company);
    };
    fetchCompany();
  }, [auth.user?._id]);

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    setIsLoading(true);
    e.preventDefault();
    try {
      await postProduct({
        ...product,
        companyId: company?._id || "",
      });
      navigate("/products");
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Add New Product</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>
            Add a new product or service to your inventory.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter product name"
                    value={product.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">SKU (Stock keeping unit) *</Label>
                  <Input
                    id="sku"
                    name="sku"
                    placeholder="Enter SKU"
                    value={product.sku}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hsn">HSN/SAC Code</Label>
                  <Input
                    id="hsn"
                    name="hsn"
                    placeholder="Enter HSN/SAC code"
                    value={product.hsn}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    name="category"
                    value={product.category}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Select
                    onValueChange={(value) =>
                      setProduct((prev) => ({ ...prev, unit: value }))
                    }
                    required
                  >
                    <SelectTrigger id="unit">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pcs">Pieces (Pcs)</SelectItem>
                      <SelectItem value="kg">Kilograms (Kg)</SelectItem>
                      <SelectItem value="g">Grams (g)</SelectItem>
                      <SelectItem value="l">Liters (L)</SelectItem>
                      <SelectItem value="m">Meters (m)</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxGroup">Tax Group </Label>
                  <Select
                    onValueChange={(value) =>
                      setProduct((prev) => ({ ...prev, taxGroup: value }))
                    }
                  >
                    <SelectTrigger id="taxGroup">
                      <SelectValue placeholder="Select tax group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gst5">GST 5%</SelectItem>
                      <SelectItem value="gst12">GST 12%</SelectItem>
                      <SelectItem value="gst18">GST 18%</SelectItem>
                      <SelectItem value="gst28">GST 28%</SelectItem>
                      <SelectItem value="exempt">GST Exempt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Base Price </Label>
                  <Input
                    id="basePrice"
                    name="basePrice"
                    type="number"
                    placeholder="0.00"
                    value={product.basePrice}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sellingPrice">Selling Price *</Label>
                  <Input
                    id="sellingPrice"
                    name="sellingPrice"
                    type="number"
                    placeholder="0.00"
                    value={product.sellingPrice}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Purchase Price *</Label>
                  <Input
                    id="purchasePrice"
                    name="purchasePrice"
                    type="number"
                    placeholder="0.00"
                    value={product.purchasePrice}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="stockQty">Current Stock *</Label>
                  <Input
                    id="stockQty"
                    name="stockQty"
                    type="number"
                    placeholder="0"
                    value={product.stockQty}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lowStockAlert">Low Stock Alert *</Label>
                  <Input
                    id="lowStockAlert"
                    name="lowStockAlert"
                    type="number"
                    placeholder="0"
                    value={product.lowStockAlert}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter product description"
                  rows={3}
                  value={product.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <CardFooter className="flex justify-between px-0">
              <Button variant="outline" asChild disabled={isLoading}>
                <Link to="/products">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isLoading}>
                Save Product
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
