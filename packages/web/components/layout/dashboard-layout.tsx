"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background font-sans antialiased text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background transition-all duration-300">
        <div className="w-full px-8 py-10 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
