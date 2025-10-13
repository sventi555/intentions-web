FROM node:24-alpine AS base

################################################################################
FROM base AS installer

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

RUN apk update
RUN apk add --no-cache libc6-compat

WORKDIR /app

RUN pnpm add -g turbo@2
COPY . .

RUN turbo prune client --docker

################################################################################
FROM base AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

RUN apk update
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY --from=installer /app/out/json/ .
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY --from=installer /app/out/full/ .
RUN pnpm build

################################################################################
FROM nginx:alpine AS runner

RUN apk add --no-cache bash

WORKDIR /app

COPY --from=builder /app/apps/client/dist /usr/share/nginx/html 
COPY --from=builder /app/apps/client/server/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /app/apps/client/server/entrypoint.sh ./

CMD ./entrypoint.sh
