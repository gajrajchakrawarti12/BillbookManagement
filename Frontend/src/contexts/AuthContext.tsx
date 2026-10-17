"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "../interfaces/User";
import type { AuthContextType } from "../interfaces/AuthContextType";
import Loader from "../pages/Loader";
import { apiRequest } from "../requests/apiClient";
import { getBusinesses } from "../requests/businessRequest";
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = async () => {
    const response = await apiRequest<{ user: User }>("/auth/me");
    const businesses = await getBusinesses();
    const business = businesses[0];
    return {
      ...response.user,
      businessId: business?.id,
      companyId: business ? String(business.id) : "",
      _id: response.user.id == null ? undefined : String(response.user.id),
      fullName: response.user.displayName,
    };
  };

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        setUser(await loadUser());
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: username, password }),
      });
      setUser(await loadUser());
      return true;
    } catch (error) {
      console.error("Login failed", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    name: string,
    username: string,
    password: string,
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: username,
          password,
          displayName: name,
        }),
      });
      return true;
    } catch (error: any) {
      console.error(
        "Signup failed:",
        error?.response?.data?.message || error.message || error
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch (error) {
      console.warn("Logout API failed", error);
    } finally {
      setUser(null);
    }
  };

  const checkValidUsername = async (username: string) => {
    try {
      return Boolean(username.trim());
    } catch (error) {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, signup, logout, isLoading, checkValidUsername }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
