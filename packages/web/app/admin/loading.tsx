'use client';

import LoaderOne from "@/components/ui/loader-one";

export default function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full py-20 bg-slate-50/10">
      <div className="space-y-4 text-center">
        <LoaderOne />
        <p className="text-xs font-semibold text-slate-400 tracking-widest uppercase animate-pulse">
          Refreshing dashboard...
        </p>
      </div>
    </div>
  );
}
