"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-xl font-montserrat">
            📚 Student Tracker
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-sm font-montserrat font-medium hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/students"
            className="text-sm font-montserrat font-medium hover:text-primary transition-colors"
          >
            Students
          </Link>
          <Link
            href="/reports"
            className="text-sm font-montserrat font-medium hover:text-primary transition-colors"
          >
            Reports
          </Link>
        </nav>
        <Button size="sm">Sign In</Button>
      </div>
    </header>
  );
}
