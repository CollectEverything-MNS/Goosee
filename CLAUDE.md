# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Goosee Generator is a microservices-based SaaS platform template. It provides a production-ready scaffold for creating modular, scalable platforms with a Next.js frontend, NestJS API Gateway, and NestJS microservices communicating via RabbitMQ.

## Commands

### Root-level Commands (run from project root)

```bash
# Install all dependencies across workspaces
yarn install:project

# Development environment
yarn start:dev      # Start all containers (frontend, backend, infrastructure)
yarn stop:dev       # Stop all containers
yarn restart:dev    # Restart all containers

# Production environment
yarn start:prod     # Start production containers
yarn stop:prod      # Stop production containers
yarn restart:prod   # Restart production containers

# Generate a new microservice from template
yarn generate:service <service-name>
```

### Frontend (templates/front/)

```bash
yarn dev        # Start Next.js dev server (port 3000)
yarn build      # Production build
yarn start      # Start production server
yarn lint       # Run ESLint
```

### Backend - API Gateway & Microservices (templates/back/)

```bash
yarn build          # Compile TypeScript
yarn dev            # Watch mode development
yarn start:prod     # Run compiled dist/main.js
yarn lint           # Fix ESLint issues
yarn format         # Run Prettier
yarn test           # Run Jest tests
yarn test:watch     # Watch mode testing
yarn test:cov       # Generate coverage report
yarn test:e2e       # Run E2E tests
```

## Architecture

```
Frontend (Next.js :3000)
         │
         ▼ HTTP/REST
API Gateway (NestJS :3001)
         │
    ┌────┴────┐
    ▼         ▼
RabbitMQ   HTTP/REST
    │
    ▼
Microservices (NestJS :3002+)
    │
    ▼
PostgreSQL (per service)
```

### Communication Patterns
- **Frontend → API Gateway**: HTTP/REST via Axios
- **API Gateway → Microservices**: HTTP/REST (sync) or RabbitMQ (async)
- **Microservices → Database**: TypeORM with PostgreSQL

### Project Structure

- `templates/front/` - Next.js frontend (Admin + Client)
  - `src/app/` - Next.js App Router pages
  - `src/components/` - Reusable UI components (Shadcn/Radix)
  - `src/features/` - Feature modules
  - `src/hooks/` - Custom React hooks
  - `src/i18n/` - Internationalization (next-intl)
  - `src/lib/` - Utilities
  - `src/providers/` - Context providers

- `templates/back/api-gateway/` - NestJS API Gateway
  - `src/config/` - Service and route configuration
  - `src/services/` - Service modules (route handlers per microservice)

- `templates/back/services/` - Microservices directory
  - `_template/` - Template for new microservices
  - Each service follows Clean Architecture:
    - `src/entities/` - Database entities
    - `src/repositories/` - Data access layer
    - `src/usecases/` - Business logic

- `docker/` - Docker Compose files (dev/ and prod/)
- `env/` - Environment variables (.env.dev, .env.prod)
- `scripts/` - Automation scripts
- `docs/` - Technical documentation (in French)

## Tech Stack

**Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS, Shadcn/ui, MobX, React Query, Zod

**Backend**: NestJS 11, TypeScript, TypeORM, PostgreSQL, RabbitMQ

**DevOps**: Docker, Docker Compose, Yarn Workspaces

## Creating a New Microservice

1. Run `yarn generate:service my-service` from project root
2. The script creates the service in `templates/back/services/my-service/`
3. Environment variables are auto-added to `env/.env.dev`
4. Add corresponding routes in the API Gateway (`templates/back/api-gateway/src/services/`)

## Environment Configuration

- Development: `env/.env.dev`
- Production: `env/.env.prod`

Key variables:
- `NEXT_PUBLIC_API_URL` - API Gateway URL for frontend
- `RABBITMQ_URL` - Message queue connection
- `*_SERVICE_HOST` / `*_SERVICE_PORT` - Per-service configuration

## Docker

Development containers mount source code for hot reloading. Production uses multi-stage builds for minimal images. All containers communicate via the `goosee_net` bridge network.

Swagger documentation is available in development at the API Gateway endpoint.
