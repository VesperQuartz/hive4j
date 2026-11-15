FROM oven/bun:1.4.4 AS build
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --ignore-scripts

COPY . .
RUN bun run build

FROM oven/bun:1.4.4 AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

COPY package.json bun.lock ./
RUN bun install --production --frozen-lockfile --ignore-scripts

COPY --from=build /app/.output ./.output
COPY --from=build /app/data/seed ./data/seed

EXPOSE 3000
CMD ["bun", ".output/server/index.mjs"]
