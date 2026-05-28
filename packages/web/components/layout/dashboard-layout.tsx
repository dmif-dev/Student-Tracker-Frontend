"use client";

import { useEffect, useState } from "react";
import { Sidebar, SidebarProvider } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
  header,
}: {
  children: React.ReactNode;
  header?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <SidebarProvider open={open} setOpen={setOpen}>
      <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background font-sans antialiased text-foreground">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background transition-all duration-300 flex flex-col">
          {header && <div className="w-full">{header}</div>}
          <div className="w-full px-8 py-10 max-w-[1600px] mx-auto flex-1">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
