"use client";

import { useEffect, useState } from "react";
import { Sidebar, SidebarProvider } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
  header,
  mainClassName,
}: {
  children: React.ReactNode;
  header?: React.ReactNode;
  mainClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <SidebarProvider open={open} setOpen={setOpen}>
      <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background font-sans antialiased text-foreground">
        <Sidebar />
        <main className={mainClassName || "flex-1 overflow-y-auto transition-all duration-300 flex flex-col bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-50 via-white to-orange-50/50 text-gray-900 font-sans selection:bg-orange-200 selection:text-orange-900 relative"}>
          {/* Decorative ambient background flares */}
          {!mainClassName && (
             <>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-400/10 rounded-full blur-[120px] pointer-events-none -z-10 mix-blend-multiply" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-[120px] pointer-events-none -z-10 mix-blend-multiply" />
             </>
          )}

          {header && <div className="w-full relative z-20">{header}</div>}
          <div className="w-full px-8 py-10 max-w-[1600px] mx-auto flex-1 relative z-10">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
