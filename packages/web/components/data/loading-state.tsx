"use client";

import LoaderOne from "@/components/ui/loader-one";

interface LoadingStateProps {
  message?: string;
  fullPage?: boolean;
}

export function LoadingState({
  message = "Loading...",
  fullPage = false,
}: LoadingStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <LoaderOne />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-12">{content}</div>;
}
