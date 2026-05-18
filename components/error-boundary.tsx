"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="card" style={{ textAlign: "center", padding: "32px" }}>
            <h2>Something went wrong</h2>
            <p style={{ color: "var(--muted)" }}>
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              className="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              type="button"
            >
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
