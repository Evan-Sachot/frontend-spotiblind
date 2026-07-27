// ============================================================
// TOAST CONTEXT — Système de notifications global de l'app.
// UN SEUL affichage pour tous les messages transitoires (lobby,
// jeu, erreurs serveur asynchrones), au lieu des mécanismes
// locaux hétérogènes qu'avaient chaque page.
//
// Caractéristiques :
// - file d'attente : plusieurs toasts s'empilent sans s'écraser
// - auto-expiration après 4 secondes
// - clic pour fermer manuellement
// - aria-live="polite" : les lecteurs d'écran annoncent les
//   notifications sans interrompre l'utilisateur (accessibilité)
// ============================================================
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

// Styles par variante (couleurs cohérentes avec la charte du projet)
const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "bg-[#1DB954]/95 text-black",
  error: "bg-red-500/95 text-white",
  info: "bg-[#3B0764]/95 text-white border border-purple-400/40",
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Compteur d'ids : une ref (et pas un state) car sa mise à jour
  // ne doit pas déclencher de re-render
  const nextIdRef = useRef(0);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // useCallback : identité stable -> les callbacks socket enregistrés
  // une seule fois au montage des hooks ne capturent pas une version
  // périmée (même famille de piège que playersRef/volumeRef)
  const showToast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = ++nextIdRef.current;
      setToasts((prev) => [...prev, { id, message, variant }]);
      // Auto-expiration
      setTimeout(() => removeToast(id), TOAST_DURATION_MS);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* ZONE D'AFFICHAGE : fixe en haut au centre, superposée
          (aucun décalage de mise en page), les toasts s'empilent.
          aria-live -> annoncé par les lecteurs d'écran */}
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

// Hook d'accès (évite d'importer useContext + ToastContext partout)
export const useToast = () => useContext(ToastContext);
