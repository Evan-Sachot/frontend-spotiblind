export type ToastVariant = "success" | "error" | "info";

export interface Toast {
  id: number; 
  message: string;
  variant: ToastVariant;
}

export interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}
