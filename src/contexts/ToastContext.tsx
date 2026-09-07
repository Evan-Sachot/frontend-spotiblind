import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import type {
  Toast,
  ToastVariant,
  ToastContextValue,
} from "../types/toast.types";

const TOAST_DURATION_MS = 4000;

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "bg-[#1DB954]/95 text-black",
  error: "bg-red-500/95 text-white",
  info: "bg-[#3B0764]/95 text-white border border-purple-400/40",
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextIdRef = useRef(0);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = ++nextIdRef.current;
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => removeToast(id), TOAST_DURATION_MS);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div
        aria-live="polite"
        className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none"
      >
        {toasts.map((toast) => (
          <button
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            title="Fermer"
            className={`pointer-events-auto px-6 py-2 rounded-full shadow-2xl font-bold text-sm cursor-pointer transition-opacity hover:opacity-80 ${VARIANT_STYLES[toast.variant]}`}
          >
            {toast.message}
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  );
};


export const useToast = () => useContext(ToastContext);
