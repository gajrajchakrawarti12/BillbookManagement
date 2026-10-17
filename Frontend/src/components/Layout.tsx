import type React from "react";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f4f7fb] text-[#102a43]">
      <div className="print:hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="print:hidden">
          <Header onMenuClick={() => setIsSidebarOpen(true)} />
          <div className="flex items-center justify-center gap-2 border-b border-[#b8ead4] bg-[#ecfbf4] px-4 py-2 text-xs font-semibold text-[#17624a]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#39b982]" />
            Workspace ready · Your billing data is safely synced.
          </div>
        </div>
        <main className="app-grid flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
