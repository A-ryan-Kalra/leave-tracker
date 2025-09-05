# ---------- client build ----------
FROM node:18-alpine AS client_builder
WORKDIR /client

COPY client/package*.json ./
RUN npm ci

COPY client/ .

ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

RUN npm run build



# ---------- server runtime ----------
FROM node:18-alpine AS server_runtime
WORKDIR /app

COPY server/package*.json ./
RUN npm ci --omit=dev

COPY server/ .

COPY --from=client_builder /client/dist ./public

# copy prisma schema, generate client at container startup
COPY server/prisma ./prisma

RUN cp .env.example .env

ENV NODE_ENV=production
EXPOSE 3000

CMD ["sh", "-c", "npx prisma generate && npm start"]
