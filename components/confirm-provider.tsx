"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode
} from "react";

interface DialogState {
  open: boolean;
  title: string;
  message: string;
  type: "confirm" | "alert";
  resolve: ((value: boolean) => void) | null;
}

interface ConfirmContextValue {
  confirm: (message: string, title?: string) => Promise<boolean>;
  alert: (message: string, title?: string) => Promise<void>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DialogState>({
    open: false,
    title: "",
    message: "",
    type: "confirm",
    resolve: null
  });
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback(
    (message: string, title = "Confirm") => {
      return new Promise<boolean>((resolve) => {
        resolveRef.current = resolve;
        setState({ open: true, title, message, type: "confirm", resolve });
      });
    },
    []
  );

  const alert = useCallback(
    (message: string, title = "Notice") => {
      return new Promise<void>((resolve) => {
        resolveRef.current = (() => resolve()) as (value: boolean) => void;
        setState({ open: true, title, message, type: "alert", resolve: (() => resolve()) as (value: boolean) => void });
      });
    },
    []
  );

  const handleResolve = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, open: false }));
    resolveRef.current?.(value);
    resolveRef.current = null;
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirm, alert }}>
      {children}
      {state.open && (
        <div className="dialog-overlay" onClick={() => handleResolve(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="dialog-title">{state.title}</h3>
            <p className="dialog-message">{state.message}</p>
            <div className="dialog-actions">
              {state.type === "confirm" && (
                <button className="button secondary" onClick={() => handleResolve(false)} type="button">
                  Cancel
                </button>
              )}
              <button
                className="button"
                onClick={() => handleResolve(true)}
                type="button"
                autoFocus
              >
                {state.type === "alert" ? "OK" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}