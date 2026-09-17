# Build : contexte = racine du monorepo, install deterministe via le yarn.lock racine.
# NEXT_PUBLIC_API_URL n'est volontairement PAS fourni : le front derive l'URL de la
# gateway au runtime (api.<host>), pour une image reutilisable par tous les tenants.
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare yarn@1.22.22 --activate
RUN yarn config set network-timeout 600000 -g
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
COPY templates/front/package.json ./templates/front/package.json
RUN yarn install --frozen-lockfile
COPY templates/front ./templates/front
WORKDIR /usr/src/app/templates/front
# Clé publique Stripe (test) inlinée au build (NEXT_PUBLIC_*). Vide = checkout en repli.
ARG NEXT_PUBLIC_DEMO_PAYMENT=false
ENV NEXT_PUBLIC_DEMO_PAYMENT=$NEXT_PUBLIC_DEMO_PAYMENT
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
RUN yarn build

FROM node:22-alpine AS runner
WORKDIR /usr/src/app/templates/front
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /usr/src/app/templates/front/public ./public
COPY --from=builder /usr/src/app/templates/front/.next ./.next
COPY --from=builder /usr/src/app/templates/front/package.json ./package.json
COPY --from=builder /usr/src/app/node_modules ./node_modules
EXPOSE 3000
CMD ["yarn", "start"]
