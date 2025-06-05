import React, { useEffect, useRef, useState } from "react";
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
import { Switch } from "../components/ui/Switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/Select";
import { Separator } from "../components/ui/Separator";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/Avatar";
import { Company } from "../interfaces/Company";
import API_URL from "../requests/requests";
import { Camera } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  deleteImage,
  updateImage,
  uploadImage,
} from "../requests/ImageRequest";
import {
  getCompany,
  postCompany,
  putCompany,
} from "../requests/CompanyRequest";
import Loader from "./Loader";

export function SettingsPage() {
  const auth = useAuth();
  const [edit, setEdit] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        if (auth?.user?._id) {
          const response = await getCompany(auth.user._id);
          if (response.company) {
            setCompany(response.company);
          } else {
            setCompany({
              userId: auth?.user?._id ?? "",
              fullName: "",
              gstin: "",
              pan: "",
              phone: "",
              email: "",
              website: "",
              address: {
                address: "",
                city: "",
                state: "",
                pincode: "",
                country: "",
              },
              image: "",
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch company:", error);
        setCompany({
          userId: auth?.user?._id ?? "",
          fullName: "",
          gstin: "",
          pan: "",
          phone: "",
          email: "",
          website: "",
          address: {
            address: "",
            city: "",
            state: "",
            pincode: "",
            country: "",
          },
          image: "",
        });
      }
    };

    fetchCompany();
  }, [auth?.user?._id]);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;

    if (files && files.length > 0) {
      setImage(files[0]);
    }

    if (name.startsWith("address.")) {
      const [addressType, field] = name.split(".");
      setCompany((prev) => {
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
      setCompany((prev) => {
        if (!prev) return prev;
        return { ...prev, [name]: value };
      });
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const [addressType, field] = name.split(".");
      setCompany((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [addressType]: {
            ...prev[addressType as "address"],
            [field]: value,
          },
        };
      });
    }
  };

  async function handleSaveChanges(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): Promise<void> {
    setIsLoading(true);
    event.preventDefault();
    console.log(company);

    if (!company?._id) {
      try {
        let res;
        if (image) {
          res = await uploadImage(image);
        }
        await postCompany({
          ...company,
          image: image
            ? `${API_URL}/files/${res?.file?._id?.toString()}`
            : company?.image,
        });
        window.location.reload();
      } catch (error) {
        console.error("Failed to create company:", error);
      }
    } else {
      try {
        let res;
        if (image) {
          console.log("Gajraj", company, company?.image);
          if (company?.image) {
            const imagePath = company?.image;
            const imageName = imagePath
              ? imagePath.split("/").pop()
              : undefined;
            if (imageName) {
              await updateImage(imageName, image);
            }
          } else {
            res = await uploadImage(image);
          }
        }
        console.log(res);

        await putCompany(company._id, {
          ...company,
          image: image
            ? `${API_URL}/files/${res?.file?._id?.toString()}`
            : company?.image,
        });
        window.location.reload();
      } catch (error) {
        console.error("Failed to update company:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }

  if (isLoading) {
    return (
      <>
        <Loader />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      <Tabs defaultValue="company" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="invoice">Invoice</TabsTrigger>
          <TabsTrigger value="tax">Tax</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Update your company details and profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!company?._id && (
                <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                  Please fill in your company details to get started.
                </div>
              )}

              <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg transition-all duration-300">
                <Avatar className="h-24 w-24 border-2 border-blue-100 shadow-md">
                  <AvatarImage
                    src={image ? URL.createObjectURL(image) : company?.image}
                    alt="Company profile picture"
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-medium">
                    {getInitials(company?.fullName ?? "")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-3">
                  <Input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleInputChange}
                    className="hidden"
                    disabled={!edit}
                    required={true}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!edit}
                    className={!edit ? "hidden" : "hover:bg-blue-50"}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Change Photo
                  </Button>
                  <p
                    className={`text-sm text-muted-foreground ${
                      !edit ? "hidden" : ""
                    }`}
                  >
                    JPG, GIF or PNG. 1MB max.
                  </p>
                </div>
              </div>
              <Separator className="my-2" />
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="font-medium">
                    Company Name *
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={company?.fullName}
                    disabled={!edit}
                    className="disabled:text-black disabled:bg-white disabled:opacity-70 disabled:cursor-default focus:border-blue-400 focus:ring-1 focus:ring-blue-300 transition-all"
                    onChange={handleInputChange}
                    placeholder="Enter company name"
                    required={true}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input
                    id="gstin"
                    name="gstin"
                    value={company?.gstin}
                    disabled={!edit}
                    className="disabled:text-black disabled:bg-white disabled:opacity-70 disabled:cursor-default"
                    onChange={handleInputChange}
                    placeholder="Enter GSTIN"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pan">PAN</Label>
                  <Input
                    id="pan"
                    name="pan"
                    value={company?.pan}
                    disabled={!edit}
                    onChange={handleInputChange}
                    placeholder="Enter PAN"
                    className="disabled:text-black disabled:bg-white disabled:opacity-70 disabled:cursor-default"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={company?.phone}
                    disabled={!edit}
                    onChange={handleInputChange}
                    placeholder="Enter Phone"
                    className="disabled:text-black disabled:bg-white disabled:opacity-70 disabled:cursor-default"
                    required={true}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    value={company?.email}
                    disabled={!edit}
                    onChange={handleInputChange}
                    placeholder="Enter Email"
                    className="disabled:text-black disabled:bg-white disabled:opacity-70 disabled:cursor-default"
                    required={true}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website </Label>
                  <Input
                    id="website"
                    name="website"
                    value={company?.website}
                    disabled={!edit}
                    onChange={handleInputChange}
                    placeholder="Enter Website"
                    className="disabled:text-black disabled:bg-white disabled:opacity-70 disabled:cursor-default"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  name="address.address"
                  value={company?.address?.address}
                  disabled={!edit}
                  onChange={handleTextareaChange}
                  placeholder="Enter Address"
                  className="disabled:text-black disabled:bg-white disabled:opacity-70 disabled:cursor-default"
                  rows={3}
                  required={true}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="address.city"
                    value={company?.address?.city}
                    disabled={!edit}
                    className="disabled:text-black disabled:bg-white disabled:opacity-70 disabled:cursor-default"
                    onChange={handleInputChange}
                    placeholder="Enter city"
                    required={true}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    name="address.state"
                    value={company?.address?.state}
                    disabled={!edit}
                    className="disabled:text-black disabled:bg-white disabled:opacity-70 disabled:cursor-default"
                    onChange={handleInputChange}
                    placeholder="Enter state"
                    required={true}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    name="address.pincode"
                    value={company?.address?.pincode}
                    disabled={!edit}
                    className="disabled:text-black disabled:bg-white disabled:opacity-70 disabled:cursor-default"
                    onChange={handleInputChange}
                    placeholder="Enter Pincode"
                    required={true}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    name="address.country"
                    value={company?.address?.country}
                    disabled={!edit}
                    className="disabled:text-black disabled:bg-white disabled:opacity-70 disabled:cursor-default"
                    onChange={handleInputChange}
                    placeholder="Enter country"
                    required={true}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex justify-end">
                {edit ? (
                  <>
                    <Button
                      onClick={() => {
                        setEdit(false);
                        window.location.reload();
                      }}
                    >
                      Don't Save
                    </Button>
                    <div className="w-4"></div>
                    <Button
                      onClick={handleSaveChanges}
                      disabled={!isCompanyValid(company)}
                    >
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setEdit(true)}>Edit</Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="invoice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Settings</CardTitle>
              <CardDescription>
                Configure your invoice preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                  <Input
                    id="invoicePrefix"
                    placeholder="e.g., INV-"
                    defaultValue="INV-"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoiceSuffix">Invoice Suffix</Label>
                  <Input id="invoiceSuffix" placeholder="e.g., -2023" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="decimalPrecision">Decimal Precision</Label>
                  <Select defaultValue="2">
                    <SelectTrigger id="decimalPrecision">
                      <SelectValue placeholder="Select decimal precision" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roundingType">Rounding Type</Label>
                  <Select defaultValue="none">
                    <SelectTrigger id="roundingType">
                      <SelectValue placeholder="Select rounding type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="round">Round</SelectItem>
                      <SelectItem value="floor">Floor</SelectItem>
                      <SelectItem value="ceil">Ceiling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="showHSN" defaultChecked />
                  <Label htmlFor="showHSN">Show HSN/SAC code on invoices</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="showGSTBreakup" defaultChecked />
                  <Label htmlFor="showGSTBreakup">
                    Show GST breakup on invoices
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="autoStockDeduction" defaultChecked />
                  <Label htmlFor="autoStockDeduction">
                    Auto deduct stock when invoice is created
                  </Label>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="tax" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax Settings</CardTitle>
              <CardDescription>Configure tax rates and groups.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultTaxGroup">Default Tax Group</Label>
                <Select defaultValue="gst18">
                  <SelectTrigger id="defaultTaxGroup">
                    <SelectValue placeholder="Select default tax group" />
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

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Tax Groups</Label>
                  <Button variant="outline" size="sm">
                    Add Tax Group
                  </Button>
                </div>

                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="p-2">Name</th>
                        <th className="p-2">CGST</th>
                        <th className="p-2">SGST</th>
                        <th className="p-2">IGST</th>
                        <th className="p-2">Status</th>
                        <th className="p-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2">GST 5%</td>
                        <td className="p-2">2.5%</td>
                        <td className="p-2">2.5%</td>
                        <td className="p-2">5%</td>
                        <td className="p-2">Active</td>
                        <td className="p-2 text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">GST 12%</td>
                        <td className="p-2">6%</td>
                        <td className="p-2">6%</td>
                        <td className="p-2">12%</td>
                        <td className="p-2">Active</td>
                        <td className="p-2 text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">GST 18%</td>
                        <td className="p-2">9%</td>
                        <td className="p-2">9%</td>
                        <td className="p-2">18%</td>
                        <td className="p-2">Active</td>
                        <td className="p-2 text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2">GST 28%</td>
                        <td className="p-2">14%</td>
                        <td className="p-2">14%</td>
                        <td className="p-2">28%</td>
                        <td className="p-2">Active</td>
                        <td className="p-2 text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts and permissions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Users</Label>
                <Button variant="outline" size="sm">
                  Add User
                </Button>
              </div>

              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                      <th className="p-2">Name</th>
                      <th className="p-2">Email</th>
                      <th className="p-2">Role</th>
                      <th className="p-2">Status</th>
                      <th className="p-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2">John Doe</td>
                      <td className="p-2">john@example.com</td>
                      <td className="p-2">Admin</td>
                      <td className="p-2">Active</td>
                      <td className="p-2 text-right">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Jane Smith</td>
                      <td className="p-2">jane@example.com</td>
                      <td className="p-2">Staff</td>
                      <td className="p-2">Active</td>
                      <td className="p-2 text-right">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2">Mike Johnson</td>
                      <td className="p-2">mike@example.com</td>
                      <td className="p-2">Viewer</td>
                      <td className="p-2">Inactive</td>
                      <td className="p-2 text-right">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getInitials(name: string) {
  if (!name) return "";
  const words = name.trim().split(" ");
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function isCompanyValid(company: Company | null): boolean {
  if (!company) return false;
  return (
    company.fullName?.trim() !== "" &&
    company.phone?.trim() !== "" &&
    company.email?.trim() !== "" &&
    company.address?.address?.trim() !== "" &&
    company.address?.city?.trim() !== "" &&
    company.address?.state?.trim() !== "" &&
    company.address?.pincode?.trim() !== "" &&
    company.address?.country?.trim() !== ""
  );
}
