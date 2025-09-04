# ---------- client build ----------
FROM node:18-alpine AS client_builder
WORKDIR /client


COPY client/package*.json ./
RUN npm ci


COPY client/ .


RUN npm run build

# ---------- server runtime ----------
FROM node:18-alpine AS server_runtime
WORKDIR /app


COPY server/package*.json ./
RUN npm ci --omit=dev


COPY server/ .

RUN npx prisma generate

COPY --from=client_builder /client/dist ./public

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
