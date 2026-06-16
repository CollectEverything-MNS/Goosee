# Build : contexte = racine du monorepo, install deterministe via le yarn.lock racine.
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare yarn@1.22.22 --activate
RUN yarn config set network-timeout 600000 -g
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
COPY templates/back/services/user-service/package.json ./templates/back/services/user-service/package.json
RUN yarn install --frozen-lockfile
COPY templates/back/services/user-service ./templates/back/services/user-service
WORKDIR /usr/src/app/templates/back/services/user-service
RUN yarn build

# Runner : dependances de production uniquement + dist compile.
FROM node:22-alpine AS runner
RUN corepack enable && corepack prepare yarn@1.22.22 --activate
RUN yarn config set network-timeout 600000 -g
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
COPY templates/back/services/user-service/package.json ./templates/back/services/user-service/package.json
RUN yarn install --frozen-lockfile --production && yarn cache clean
COPY --from=builder /usr/src/app/templates/back/services/user-service/dist ./templates/back/services/user-service/dist
WORKDIR /usr/src/app/templates/back/services/user-service
ENV NODE_ENV=production
EXPOSE 3002
CMD ["node", "dist/main.js"]
