import type React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <div className="print:hidden h-100v">
          <Sidebar />
        </div>
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="print:hidden">
            <Header />
            <div className="w-full bg-amber-50 text-amber-800 py-2 px-4 text-center font-medium shadow-sm">
              <span className="flex items-center justify-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-pulse"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Currently we are working on the site. Some functions may not be
                available.
              </span>
            </div>
          </div>
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </>
  );
}
