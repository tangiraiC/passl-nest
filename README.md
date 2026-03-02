# PASSL NestJS Monorepo

Welcome to the **PASSL** dispatching and routing platform! This repository contains the backend systems responsible for ingesting orders, intelligently batching them using a rolling horizon algorithm, estimating real-world travel times via OpenStreetMap (OSRM), and generating dispatch waves for drivers.

## System Architecture

The project is structured as a **PNPM Monorepo**, ensuring our domains, infrastructure implementations, and application servers are cleanly separated for maintainability and scalability.

- `packages/core`: Agnostic domain layer containing purely the business rules (Orders, Drivers, BatchingEngine, DispatchLoop) and Ports.
- `packages/infra`: Infrastructure adapters (Prisma/PostgreSQL implementations, OSRM HTTP clients, Redis Locking).
- `packages/contracts`: Shared Data Transfer Objects (DTOs) and validation requirements.
- `apps/api`: NestJS HTTP Server handling incoming REST API traffic and saving payloads to the database.
- `apps/worker`: NestJS headless background processor. It uses a Cron Service to evaluate waiting pools of orders, groups them via OSRM Matrix savings, and utilizes Prisma Bulk Transactions (`$transaction`) to process up to 500 orders/sec without exhausting database connections.

> For a deep dive into the code pathways, check out our [Architecture Documentation](docs/architecture.md).

## Local Development Setup

To run PASSL locally, ensure you have Docker and `pnpm` installed.

1. **Start Infrastructure Services:**
   ```bash
   docker-compose up -d
   ```
   *This spins up the required Redis and PostgreSQL containers.*

2. **Install Dependencies:**
   ```bash
   pnpm install
   ```

3. **Database Migration:**
   ```bash
   pnpm db:migrate
   ```

4. **Build Packages & Applications:**
   ```bash
   pnpm -r build
   ```

5. **Start the Apps:**
   You can run the API and Background Worker concurrently:
   ```bash
   pnpm start:api
   pnpm start:worker
   ```

## Testing

The core batching heuristics and dispatch mechanisms are heavily unit testable completely offline.
You can run the full suite using:
```bash
npm run test
```
This includes `dispatch-simulation.spec.ts` which runs a 20-order E2E stress test demonstrating successful matrix batching and driver wave generation.
