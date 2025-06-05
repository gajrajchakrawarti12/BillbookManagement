"use client";

import React, { useState } from "react";
import { Bell, Search } from "lucide-react";
import { Button } from "./ui/Button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/DropdownMenu";
import { Input } from "./ui/Input";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/Avatar";
import { useAuth } from "../contexts/AuthContext";
import { Badge } from "./ui/Badge";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6">
      <div className="hidden md:block md:w-64"></div>
      <div className="w-full flex items-center justify-between">
        <form className="hidden md:block md:flex-1 md:max-w-sm">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
        <div className="flex items-center gap-2 md:ml-auto">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-blue-600"></span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.image} alt="User profile picture" />
                  <AvatarFallback>
                    {getInitials(user?.fullName ?? "")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.fullName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={getRoleBadgeVariant(user?.role || "")}
                      className="text-xs"
                    >
                      {user?.role}
                    </Badge>
                    {/* {user?.company && (
                      <span className="text-xs text-muted-foreground">
                        {user.company}
                      </span>
                    )} */}
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => (window.location.href = "/profile")}
              >
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => (window.location.href = "/settings")}
              >
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function getInitials(name: string) {
  if (!name) return "";
  const words = name.trim().split(" ");
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

const getRoleBadgeVariant = (role: string) => {
  switch (role.toLowerCase()) {
    case "admin":
      return "default";
    case "staff":
      return "secondary";
    case "viewer":
      return "outline";
    default:
      return "outline";
  }
};
