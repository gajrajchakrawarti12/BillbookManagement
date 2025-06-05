"use client";

import type React from "react";
import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { Package, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import Loader from "./Loader";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");

  const { login, isLoading, user } = useAuth();
  const navigate = useNavigate();

  const generateCaptcha = useCallback(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyz";
    let result = "";
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(result);
  }, []);

  useEffect(() => {
    if (user) {
      navigate("/"); // Redirect if already logged in
    }
    generateCaptcha();
  }, [user, navigate, generateCaptcha]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const trimmedUsername = username.trim();
      console.log(captchaInput.trim(), captcha);
      

      if (captchaInput.trim() !== captcha) {
        setError("Captcha does not match");
        setCaptchaInput("");
        generateCaptcha();
        return;
      }

      if (!trimmedUsername || !password) {
        setError("Please fill in all fields");
        return;
      }

      try {
        const success = await login(trimmedUsername, password);

        if (success) {
          navigate("/");
        } else {
          setError("Invalid username or password");
        }
      } catch (err: any) {
        if (err.message?.includes("Network")) {
          setError("Network error. Please try again later.");
        } else {
          setError("Invalid username or password");
        }
      }
    },
    [username, password, login, navigate, captchaInput, captcha, generateCaptcha]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Package className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">Billbook</span>
          </div>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset disabled={isLoading} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              {isLoading && !user && (
                <div
                  role="status"
                  aria-live="polite"
                  className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm"
                >
                  <Loader />
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Captcha */}
              <div className="space-y-2 mt-4">
                <label htmlFor="captcha" className="text-sm font-medium">
                  Captcha
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1 text-lg">
                    {captcha.split("").map((char, idx) => {
                      const colorClasses = [
                        "text-[#01303F]",
                        "text-[#D3B199]",
                        "text-[#2CFB8D]",
                        "text-[#12E3C6]",
                      ];
                      return (
                        <span
                          key={idx}
                          className={`${colorClasses[idx % colorClasses.length]} font-bold`}
                        >
                          {char}
                        </span>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCaptchaInput("");
                      generateCaptcha();
                    }}
                    className="text-sm text-blue-600 underline"
                  >
                    Refresh
                  </button>
                </div>
                <Input
                  id="captcha"
                  type="text"
                  placeholder="Enter the characters above"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full">
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </fieldset>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
