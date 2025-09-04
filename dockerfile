# ---------- client build ----------
FROM node:18-alpine AS client_builder
WORKDIR /client

# install deps
COPY client/package*.json ./
RUN npm ci

# build
COPY client/ .


RUN npm run build

# ---------- server runtime ----------
FROM node:18-alpine AS server_runtime
WORKDIR /app

# install only prod deps for server
COPY server/package*.json ./
RUN npm ci --omit=dev

# copy server source
COPY server/ .

RUN npx prisma generate

# bring in client dist -> /app/public (served by Express)
COPY --from=client_builder /client/dist ./public

# (optional) place credentials if you bundle them; prefer mounting via compose
# COPY server/credentials ./credentials

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
