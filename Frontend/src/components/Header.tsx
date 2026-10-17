"use client";

import React, { useState } from "react";
import { Bell, Menu, Search } from "lucide-react";
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

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center gap-3 border-b border-[#d9e2ec]/80 bg-white/90 px-4 backdrop-blur md:px-8">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick} aria-label="Open navigation">
        <Menu className="h-5 w-5" />
      </Button>
      <form className="max-w-md flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search anything..."
              className="h-11 w-full rounded-xl border-[#d9e2ec] bg-[#f4f7fb] pl-9 text-sm focus:bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
      </form>
      <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative rounded-xl text-[#627d98] hover:bg-[#edf2f7]">
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
          </Button>
          <div className="mx-1 hidden h-8 w-px bg-slate-200 sm:block" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 gap-2 rounded-xl px-1.5 pr-2 hover:bg-slate-100">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.image} alt="User profile picture" />
                  <AvatarFallback>
                    {getInitials(user?.displayName || user?.fullName || user?.email || "")}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-28 truncate text-sm font-medium sm:block">
                  {user?.displayName || user?.fullName || "Account"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.displayName || user?.fullName || "Account"}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={getRoleBadgeVariant(user?.role || "")}
                      className="text-xs"
                    >
                      {user?.role || "Member"}
                    </Badge>
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
