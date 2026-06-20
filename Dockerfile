FROM node:20-alpine
WORKDIR /app

# Dependances (mises en cache tant que package.json ne change pas)
COPY package.json ./
RUN npm install --omit=dev

# Code serveur + pages web
COPY server.js ./
COPY public/ ./public/

# Le port expose dans Coolify est 80
EXPOSE 80
CMD ["node", "server.js"]
