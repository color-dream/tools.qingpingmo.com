FROM node:24-alpine AS builder
RUN npm config set registry https://registry.npmmirror.com && npm install -g bun
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM node:24-alpine
WORKDIR /app
COPY --from=builder /app/.output ./.output
ENV PORT=3000 HOST=0.0.0.0 NODE_ENV=production
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
