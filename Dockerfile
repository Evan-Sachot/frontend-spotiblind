# ============================================================
# DOCKERFILE FRONT-END — Application React compilée, servie par Nginx
#
# Construction en deux étapes :
#   1. "builder" compile l'application avec Vite
#   2. l'image finale est un simple serveur Nginx contenant
#      uniquement les fichiers statiques produits
# L'image finale ne contient ni Node.js, ni les sources, ni les
# dépendances : quelques dizaines de Mo au lieu de plusieurs centaines.
# ============================================================

# ---------- ÉTAPE 1 : construction ----------
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# IMPORTANT : Vite remplace les variables VITE_* au moment de la
# COMPILATION, pas à l'exécution. L'URL de l'API doit donc être
# fournie ici, en argument de construction (voir docker-compose).
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---------- ÉTAPE 2 : serveur web ----------
FROM nginx:alpine AS production

# Les fichiers compilés par Vite (dossier dist) deviennent le
# contenu servi par Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuration adaptée à une application monopage (voir nginx.conf)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
