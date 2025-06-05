"use client";

import { Button } from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/Avatar";
import { Switch } from "../components/ui/Switch";
import { Separator } from "../components/ui/Separator";
import { Badge } from "../components/ui/Badge";
import { Camera, Key } from "lucide-react";
import { useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext"; // Mock user data, replace with actual user data fetching logic
import type { User } from "../interfaces/User";
import API_URL from "../requests/requests";
import { updateImage, uploadImage } from "../requests/ImageRequest";
import { updateUserData } from "../requests/UserRequest";
import Loader from "./Loader";

export default function ProfilePage() {
  const auth = useAuth();
  const [edit, setEdit] = useState(false);
  const [user, setUser] = useState<User | undefined>(auth.user || undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;

    // Set preview image if it's a file input
    if (files && files.length > 0) {
      setImage(files[0]);
    }

    // Update user state with the input's name and value
    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: value,
      };
    });
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<File | null>(null);

  async function handleSaveChanges(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): Promise<void> {
    setIsLoading(true);
    event.preventDefault();
    try {
      let res;
      if (user) {
        if (image) {
          if (user?.image) {
            const imagePath = user?.image;
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

        updateUserData(user.username, {
          ...user,
          image: image
            ? `${API_URL}/files/${res?.file?._id?.toString()}`
            : user?.image,
        })
          .then(() => {
            window.location.reload();
          })
          .catch((error) => {
            console.error("Error updating user data:", error);
          });
      }
    } catch (error) {
      console.error("Error updating user data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Profile</h1>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and profile picture.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading && auth.isLoading && (
                <>
                  <div
                    role="status"
                    aria-live="polite"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm"
                  >
                    <Loader />
                  </div>
                </>
              )}

              <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg transition-all duration-300">
                <Avatar className="h-24 w-24 border-2 border-blue-100 shadow-md">
                  <AvatarImage
                    src={image ? URL.createObjectURL(image) : user?.image}
                    alt="User profile picture"
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-medium">
                    {getInitials(user?.fullName ?? "")}
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
                  <Label htmlFor="username" className="font-medium">
                    Username
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    value={user?.username}
                    disabled
                    className="disabled:text-black disabled:bg-white disabled:opacity-70 disabled:cursor-default"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="font-medium">
                    Role
                  </Label>
                  <Input
                    id="role"
                    name="role"
                    value={user?.role}
                    disabled
                    className="disabled:text-black disabled:bg-white disabled:opacity-70 disabled:cursor-default"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="font-medium">
                    First Name
                  </Label>
                  <Input
                    id="fullName"
                    value={user?.fullName}
                    name="fullName"
                    onChange={handleInputChange}
                    disabled={!edit}
                    className="disabled:text-black disabled:bg-white disabled:opacity-70 disabled:cursor-default focus:border-blue-400 focus:ring-1 focus:ring-blue-300 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={user?.email}
                    onChange={handleInputChange}
                    disabled={!edit}
                    className="disabled:text-black disabled:bg-white disabled:opacity-70 disabled:cursor-default focus:border-blue-400 focus:ring-1 focus:ring-blue-300 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-medium">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={user?.phone}
                    onChange={handleInputChange}
                    disabled={!edit}
                    className="disabled:text-black disabled:bg-white disabled:opacity-70 disabled:cursor-default focus:border-blue-400 focus:ring-1 focus:ring-blue-300 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                {edit ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEdit(false);
                        window.location.reload();
                      }}
                      disabled={isLoading}
                    >
                      Don't Save
                    </Button>
                    <Button
                      onClick={handleSaveChanges}
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={isLoading}
                    >
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setEdit(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Edit
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Password & Security</CardTitle>
              <CardDescription>
                Manage your password and security settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-muted-foreground">
                      Last changed 3 months ago
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-blue-50"
                  >
                    <Key className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                </div>

                <Separator className="my-2" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-white">
                        Disabled
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-blue-50"
                      >
                        Enable
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">Login Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified when someone logs into your account
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <Separator className="my-2" />

                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Active Sessions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border rounded-lg shadow-sm hover:shadow transition-shadow">
                      <div className="space-y-1">
                        <p className="font-medium">Current Session</p>
                        <p className="text-sm text-muted-foreground">
                          Chrome on Windows • Mumbai, India
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last active: Now
                        </p>
                      </div>
                      <Badge
                        variant="success"
                        className="bg-green-100 text-green-800 border-green-200"
                      >
                        Current
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg shadow-sm hover:shadow transition-shadow">
                      <div className="space-y-1">
                        <p className="font-medium">Mobile App</p>
                        <p className="text-sm text-muted-foreground">
                          iPhone • Mumbai, India
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last active: 2 hours ago
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        Revoke
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what notifications you want to receive.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <div className="bg-gray-500 rounded-full flex">
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Invoice Reminders</p>
                    <p className="text-sm text-muted-foreground">
                      Get reminded about pending invoices
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Payment Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when payments are received
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Low Stock Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Get alerted when products are running low
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Weekly Reports</p>
                    <p className="text-sm text-muted-foreground">
                      Receive weekly business summary reports
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Marketing Updates</p>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about new features and tips
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>
                Manage your subscription and billing details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="space-y-1">
                  <p className="font-medium">Current Plan</p>
                  <p className="text-sm text-muted-foreground">
                    Professional Plan
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹999/month</p>
                  <Badge
                    variant="success"
                    className="bg-green-100 text-green-800 border-green-200"
                  >
                    Active
                  </Badge>
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <h3 className="font-medium text-lg">Payment Method</h3>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-blue-400 rounded-md"></div>
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">
                        Expires 12/25
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-blue-50 transition-colors"
                  >
                    Update
                  </Button>
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <h3 className="font-medium text-lg">Billing History</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow transition-shadow">
                    <div>
                      <p className="font-medium">May 2023</p>
                      <p className="text-sm text-muted-foreground">
                        Professional Plan
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹999.00</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow transition-shadow">
                    <div>
                      <p className="font-medium">April 2023</p>
                      <p className="text-sm text-muted-foreground">
                        Professional Plan
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹999.00</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
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

