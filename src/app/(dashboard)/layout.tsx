"use client";

import { useState } from "react";
import { ToastProvider } from "@/components/dashboard/toast-context";
import { Sidebar } from "@/components/layout/sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <DashboardHeader
          onMenuToggle={() => setSidebarOpen((o) => !o)}
        />
        <main className="min-h-[calc(100dvh-3.5rem)] p-4 sm:p-6">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
