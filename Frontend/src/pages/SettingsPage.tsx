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
} from "../requests/CompanyRequest";
import { createBusiness } from "../requests/businessRequest";
import Loader from "./Loader";

export function SettingsPage() {
  const auth = useAuth();
  const [edit, setEdit] = useState(false);
  const [company, setCompany] = useState<Company>({
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        if (auth?.user?.companyId) {
          const response = await getCompany(auth.user.companyId);
          if (response.company) {
            setCompany(response.company);
          }
        }
      } catch (error) {
        console.error("Failed to fetch company:", error);
      }
    };

    fetchCompany();
  }, [auth?.user]);

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

    if (!auth.user?.companyId) {
      try {
        await createBusiness({
          legalName: company.fullName?.trim() || "",
          displayName: company.fullName?.trim() || undefined,
          businessRegistrationId: company.gstin?.trim() || undefined,
          defaultCurrency: "INR",
        });
        window.location.reload();
      } catch (error) {
        console.error("Failed to create company:", error);
        alert(error instanceof Error ? error.message : "Failed to create business.");
        setIsLoading(false);
      }
    } else {
      try {
        let res;
        if (image) {
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

        if (image && !company?.image && res?.file?._id) {
          setCompany((previous) => ({
            ...previous,
            image: `${API_URL}/files/${res.file._id.toString()}`,
          }));
        }
        alert("Business details cannot be edited through the current API.");
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
                Invoice preferences are not exposed by the current backend API.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                Configure invoice options through the backend when those endpoints become available.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax Settings</CardTitle>
              <CardDescription>Tax groups are provided by products and invoice lines.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                No tax-group endpoint is available in the current API contract.
              </p>
            </CardContent>
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
            <CardContent>
              <p className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                Membership data can be managed through the business membership API.
              </p>
            </CardContent>
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
