// ============================================================
// TYPES DES TOASTS — Notifications éphémères de l'application.
// ============================================================

// Les 3 variantes visuelles :
// - success : action réussie (code copié, réponse trouvée...)
// - error   : erreur serveur ou action impossible
// - info    : événement neutre (un joueur a rejoint, etc.)
export type ToastVariant = "success" | "error" | "info";

export interface Toast {
  id: number; // identifiant unique (clé React + ciblage de la suppression)
  message: string;
  variant: ToastVariant;
}

// Ce que le contexte expose aux composants.
// RAPPEL DE LA TAXONOMIE DES MESSAGES (décision d'architecture) :
// - événement TRANSITOIRE  -> showToast (disparaît en 4s)
// - erreur de FORMULAIRE   -> inline à côté du champ (PAS un toast)
// - état BLOQUANT          -> message persistant dans la page (PAS un toast)
export interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}
