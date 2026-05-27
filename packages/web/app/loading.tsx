'use client';

import LoaderOne from "@/components/ui/loader-one";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50/30">
      <div className="space-y-4 text-center">
        <LoaderOne />
        <p className="text-xs font-semibold text-slate-400 tracking-widest uppercase animate-pulse">
          Loading page content...
        </p>
      </div>
    </div>
  );
}
