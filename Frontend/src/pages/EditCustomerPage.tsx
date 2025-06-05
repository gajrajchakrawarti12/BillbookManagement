"use client";
import { useEffect, useState } from "react";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/Tabs";
import { Textarea } from "../components/ui/Textarea";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  getCustomer,
  postCustomer,
  putCustomer,
} from "../requests/customerRequest";
import { getCompany } from "../requests/CompanyRequest";
import { Company } from "../interfaces/Company";
import { Customer } from "../interfaces/Customer";

export function EditCustomerPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);

  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      const id = window.location.href.split("/").pop() || "";
      const response = await getCustomer(id);
      console.log(response);
      if (!response) {
        alert("Can't Get Customer.");
        navigate("/customer");
      }
      setCustomer(response);
    };
    fetchCustomer();
  }, [window.location.href]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const [addressType, field] = name.split(".");
      setCustomer((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [addressType]: {
            ...prev[addressType as "address"],
            [field]: value,
          },
        };
      });
    } else {
      setCustomer((prev) => {
        if (!prev) return prev;
        return { ...prev, [name]: value };
      });
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const [addressType, field] = name.split(".");
    setCustomer((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [addressType]: {
          ...prev[addressType as "address"],
          [field]: value,
        },
      };
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSameAsBilling(checked);
    if (checked) {
      setCustomer((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          address: { ...prev.address },
        };
      });
    }
  };

  const validateCustomerData = () => {
    if (!customer) {
      return false;
    }
    const { fullName, phone, address } = customer;

    if (
      !fullName.trim() ||
      !phone.trim() ||
      !address.address.trim() ||
      !address.city.trim() ||
      !address.state.trim() ||
      !address.pincode.trim() ||
      !address.country.trim()
    ) {
      return false;
    }

    return true;
  };

  const handleSaveChanges = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();

    if (!validateCustomerData()) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      if (!customer?._id) {
        window.location.reload();
      }
      await putCustomer(customer?._id || "", {
        ...customer,
        companyId: company?._id || "",
      });
      navigate("/customers");
    } catch (error) {
      console.error("Failed to save customer:", error);
      alert("Failed to save customer. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/customers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Update Customer</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
          <CardDescription>
            Update customer to your billing system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="fullName"
                    placeholder="Enter name"
                    value={customer?.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input
                    id="gstin"
                    name="gstin"
                    placeholder="Enter GSTIN"
                    value={customer?.gstin}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Enter phone number"
                    value={customer?.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email"
                    value={customer?.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pan">PAN</Label>
                  <Input
                    id="pan"
                    name="pan"
                    placeholder="Enter PAN"
                    value={customer?.pan}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingAddress">Address *</Label>
                <Textarea
                  id="billingAddress"
                  name="address.address"
                  placeholder="Enter complete address"
                  rows={3}
                  value={customer?.address.address}
                  onChange={handleTextareaChange}
                  required
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="billingCity">City *</Label>
                  <Input
                    id="billingCity"
                    name="address.city"
                    placeholder="Enter city"
                    value={customer?.address.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingState">State *</Label>
                  <Input
                    id="billingState"
                    name="address.state"
                    placeholder="Enter state"
                    value={customer?.address.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingPincode">Pincode *</Label>
                  <Input
                    id="billingPincode"
                    name="address.pincode"
                    placeholder="Enter pincode"
                    value={customer?.address.pincode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingCountry">Country *</Label>
                  <Input
                    id="billingCountry"
                    name="address.country"
                    placeholder="Enter country"
                    value={customer?.address.country}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link to="/customers">Cancel</Link>
          </Button>
          <Button onClick={handleSaveChanges}>Save Customer</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
