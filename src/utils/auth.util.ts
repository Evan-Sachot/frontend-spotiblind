// ============================================================
// AUTH UTIL — Décodage du JWT côté client.
// Un JWT est composé de 3 parties séparées par des points :
// header.payload.signature — le payload est du JSON encodé en
// base64url, lisible sans la clé secrète (la clé ne sert qu'à
// VÉRIFIER la signature, ce que seul le serveur fait).
// Ça nous permet de connaître "qui je suis" (id, username) sans
// requête supplémentaire — utile pour savoir si je suis l'hôte,
// me surligner dans le scoreboard, etc.
// ============================================================

export interface CurrentUser {
  id: number;
  username: string;
}

export const getUserFromToken = (): CurrentUser | null => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    // Le payload est la 2e partie du token
    const payloadBase64 = token.split(".")[1];
    // base64url -> base64 classique (remplacement des caractères spéciaux)
    const normalized = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(normalized));

    if (typeof payload.id !== "number" || typeof payload.username !== "string") {
      return null; // token malformé : on ne fait pas confiance
    }

    // VÉRIFICATION D'EXPIRATION : "exp" est un timestamp JWT en
    // SECONDES (Date.now() est en millisecondes, d'où le x1000).
    // Un token expiré est traité comme absent : la garde de route
    // renverra au login au lieu de laisser entrer avec un socket
    // qui serait de toute façon rejeté par le serveur.
    if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) {
      return null;
    }

    return { id: payload.id, username: payload.username };
  } catch {
    return null; // token corrompu / illisible
  }
};