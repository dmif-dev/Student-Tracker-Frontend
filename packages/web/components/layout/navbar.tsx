"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-xl flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <span className="hidden sm:inline">Student Tracker</span>
            <span className="sm:hidden">Tracker</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/students"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Students
          </Link>
          <Link
            href="/reports"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Reports
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <Button size="sm" variant="outline">
            Sign In
          </Button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden inline-flex items-center justify-center rounded-md text-foreground hover:bg-accent p-2"
          >
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-background/95">
          <div className="container mx-auto px-4 py-4 space-y-2">
            <Link
              href="/dashboard"
              className="block px-4 py-2 rounded-md hover:bg-accent transition-colors text-sm"
            >
              Dashboard
            </Link>
            <Link
              href="/students"
              className="block px-4 py-2 rounded-md hover:bg-accent transition-colors text-sm"
            >
              Students
            </Link>
            <Link
              href="/reports"
              className="block px-4 py-2 rounded-md hover:bg-accent transition-colors text-sm"
            >
              Reports
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
