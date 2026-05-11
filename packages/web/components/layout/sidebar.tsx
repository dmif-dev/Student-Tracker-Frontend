"use client";

import { cn } from "@/lib/utils";
import Link, { LinkProps } from "next/link";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, LayoutDashboard, Users, FileText, Settings, LogOut, TrendingUp, Home, User, UserCircle, BookOpen, GraduationCap, UserCog, BarChart3, Bell, Calendar } from "lucide-react";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/auth/actions";

// --- Types & Context ---
interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

// --- Components ---
export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);
  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "h-full px-4 py-4 hidden md:flex md:flex-col bg-neutral-100 dark:bg-neutral-800 w-[300px] flex-shrink-0 border-r border-border",
        className
      )}
      animate={{
        width: animate ? (open ? "300px" : "80px") : "300px",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-16 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-neutral-100 dark:bg-neutral-800 w-full border-b border-border"
        )}
        {...props}
      >
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 bg-gray-900 rounded-full" />
          <span className="font-bold font-montserrat text-gray-900 dark:text-neutral-200">
            Student Tracker
          </span>
        </div>
        <div className="flex justify-end z-20">
          <Menu
            className="text-gray-900 dark:text-neutral-200 cursor-pointer"
            onClick={() => setOpen(!open)}
          />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-white dark:bg-neutral-900 p-10 z-[100] flex flex-col justify-between",
                className
              )}
            >
              <div
                className="absolute right-10 top-10 z-50 text-neutral-800 dark:text-neutral-200 cursor-pointer"
                onClick={() => setOpen(!open)}
              >
                <X />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
  props?: LinkProps;
}) => {
  const { open, animate } = useSidebar();
  const pathname = usePathname();
  const isDashboardLink = ["/", "/admin", "/mentor", "/Student/dashboard"].includes(link.href);
  const isActive = isDashboardLink 
    ? pathname === link.href 
    : pathname.startsWith(link.href);

  return (
    <Link
      href={link.href}
      className={cn(
        "flex items-center justify-start gap-2 group/sidebar py-2 px-2 rounded-md transition-colors",
        isActive ? "bg-primary text-black shadow-sm" : "text-gray-900 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700",
        className
      )}
      {...props}
    >
      <div className={cn("flex-shrink-0", isActive ? "text-black" : "text-gray-900 dark:text-neutral-400")}>
        {link.icon}
      </div>
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-sm font-medium font-montserrat group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </Link>
  );
};

// --- Main Sidebar Component ---
export function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  let navItems: Links[] = [];
  let roleTitle = "Student Tracker";
  let letter = "S";

  if (pathname.startsWith("/admin")) {
    roleTitle = "DMIF Admin";
    letter = "A";
    navItems = [
      { label: "Dashboard", href: "/admin", icon: <LayoutDashboard className="h-5 w-5 flex-shrink-0" /> },
      { label: "Students", href: "/admin/students", icon: <Users className="h-5 w-5 flex-shrink-0" /> },
      { label: "Programs", href: "/admin/programs", icon: <GraduationCap className="h-5 w-5 flex-shrink-0" /> },
      { label: "Mentors", href: "/admin/mentors", icon: <UserCog className="h-5 w-5 flex-shrink-0" /> },
      { label: "Documents", href: "/admin/documents", icon: <FileText className="h-5 w-5 flex-shrink-0" /> },
      { label: "Reports", href: "/admin/reports", icon: <FileText className="h-5 w-5 flex-shrink-0" /> },
      { label: "Analytics", href: "/admin/analytics", icon: <BarChart3 className="h-5 w-5 flex-shrink-0" /> },
      { label: "Notifications", href: "/admin/notifications", icon: <Bell className="h-5 w-5 flex-shrink-0" /> },
      { label: "Settings", href: "/admin/settings", icon: <Settings className="h-5 w-5 flex-shrink-0" /> },
    ];
  } else if (pathname.startsWith("/mentor")) {
    roleTitle = "DMIF Mentor";
    letter = "M";
    navItems = [
      { label: "Dashboard", href: "/mentor", icon: <LayoutDashboard className="h-5 w-5 flex-shrink-0" /> },
      { label: "My Students", href: "/mentor/students", icon: <Users className="h-5 w-5 flex-shrink-0" /> },
      { label: "My Documents", href: "/mentor/documents", icon: <FileText className="h-5 w-5 flex-shrink-0" /> },
      { label: "My Schedule", href: "/mentor/schedule", icon: <Calendar className="h-5 w-5 flex-shrink-0" /> },
      { label: "My Profile", href: "/mentor/profile", icon: <User className="h-5 w-5 flex-shrink-0" /> },
      { label: "Settings", href: "/mentor/settings", icon: <Settings className="h-5 w-5 flex-shrink-0" /> },
    ];
  } else {
    roleTitle = "Student Tracker";
    letter = "S";
    navItems = [
      { label: "Dashboard", href: "/Student/dashboard", icon: <LayoutDashboard className="h-5 w-5 flex-shrink-0" /> },
      { label: "My Courses", href: "/Student/my-courses", icon: <BookOpen className="h-5 w-5 flex-shrink-0" /> },
      { label: "Progress", href: "/Student/progress/new", icon: <TrendingUp className="h-5 w-5 flex-shrink-0" /> },
      { label: "My Stats", href: "/Student/my-stats", icon: <FileText className="h-5 w-5 flex-shrink-0" /> },
      { label: "Mentor Details", href: "/Student/mentor-details", icon: <UserCircle className="h-5 w-5 flex-shrink-0" /> },
      { label: "My Profile", href: "/Student/my-profile", icon: <User className="h-5 w-5 flex-shrink-0" /> },
      { label: "Settings", href: "/Student/settings", icon: <Settings className="h-5 w-5 flex-shrink-0" /> },
    ];
  }

  return (
    <SidebarProvider open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Logo / Top Section */}
          <div className="flex items-center gap-2 px-2 py-4">
            <div className="h-6 w-6 bg-orange-500 rounded-md flex-shrink-0 flex items-center justify-center text-[10px] text-black overflow-hidden shadow-sm">
              <LayoutDashboard className="h-4 w-4" />
            </div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: open ? 1 : 0 }}
              className="font-bold text-gray-900 dark:text-neutral-200 whitespace-nowrap font-montserrat"
            >
              {roleTitle}
            </motion.span>
          </div>
          <div className="mt-8 flex flex-col gap-2">
            {navItems.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
        </div>
        <div className="pb-4">
          <button 
           onClick={(e) => {
             e.preventDefault();
             signOut();
           }} 
           className="w-full"
          >
            <SidebarLink
              link={{
                label: "Logout",
                href: "#",
                icon: <LogOut className="h-5 w-5 flex-shrink-0" />,
              }}
            />
          </button>
        </div>
      </SidebarBody>
    </SidebarProvider>
  );
}
