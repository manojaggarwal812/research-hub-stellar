"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean; message?: string };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rh-container py-20">
          <div className="rh-panel mx-auto max-w-lg p-8 text-center">
            <h1 className="font-display text-2xl">Something went wrong</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {this.state.message ?? "An unexpected UI error occurred."}
            </p>
            <button
              type="button"
              className="rh-btn-primary mt-6"
              onClick={() => this.setState({ hasError: false, message: undefined })}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
