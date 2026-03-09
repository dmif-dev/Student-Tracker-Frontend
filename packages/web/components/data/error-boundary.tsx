"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, info);
    this.props.onError?.(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-900">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 dark:text-red-100">
                    Something went wrong
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-200 mt-2">
                    {this.state.error?.message}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() =>
                      this.setState({ hasError: false, error: null })
                    }
                  >
                    Try again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      );
    }

    return this.props.children;
  }
}

// Functional component for error display
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-900">
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 dark:text-red-100">
              {title}
            </h3>
            <p className="text-sm text-red-700 dark:text-red-200 mt-2">
              {message}
            </p>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={onRetry}
              >
                Try again
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
