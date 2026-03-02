# PASSL System Architecture

The project is structured as a **PNPM Monorepo**. This approach separates out the logical code into different "packages" so that multiple "apps" (the APIs or background workers) can securely rely on the same fundamental business logic without copying and pasting files.

This makes debugging easier and separates the concerns.

## Directory Layout overview

### `/apps`
This folder contains the actual executable programs that run on your servers.

- **`/apps/api`**: This is a NestJS project serving as the main HTTP backend facing the frontend applications (e.g. mobile app or web portal). It exposes REST endpoints. It depends on logic from `@passl/core` and `@passl/infra`.
- **`/apps/worker`**: This is also a NestJS project, but its primary purpose is running background processes and consuming jobs asynchronously (using Redis queues or cron jobs) instead of serving HTTP traffic. E.g: Periodic evaluations of `BatchingEngine`, dispatching the `DispatchLoop`, etc.

### `/packages`
This folder holds reusable libraries and isolated logic that can be consumed by the apps.

- **`/packages/core`**: This is the heart of your domain. It contains your core business classes and interfaces (`Order`, `Driver`, `BatchingEngine`, `DispatchLoop`). This package usually contains pure logic and zero knowledge of databases or external systems. Notice it has subfolders like `/domain` for entities, and `/ports` for dependency-injection interfaces.
- **`/packages/contracts`**: This holds the shared constants and interfaces for DTOs. When the API sends a JSON payload, or the Worker consumes a queue, both use this package to understand what the shape of the data is to avoid type mismatching.
- **`/packages/infra`**: "Infrastructure". This connects your agnostic `@passl/core` logic to the real world. It handles implementations for routing API services like OSRM (`OsrmClient.ts`), Redis connection instances, and your PostgreSQL database integration (`PrismaRepositories`).

### `/tests`
Contains End-To-End (E2E) testing suites and simulation configurations, like `dispatch-simulation.spec.ts` and `core.spec.ts`. This folder runs its tests against the exported code from `/packages/core` by running `npm run test` using the fast `ts-jest` framework.

### `/data`
Contains the raw CSV/JSON dumps representing real-world subsets of system data (`orders.csv`, `drivers.csv`, `customers.csv`, `restaurants.csv`) to provide concrete payloads to algorithms like the Batching Engine tests we ran earlier.

## Key Files In-Depth

### 1. `apps/api/src/orders/orders.controller.ts`
This is your standard NestJS REST Controller.
- It exposes HTTP endpoints like `POST /orders` and `GET /orders/:id`.
- When a new order arrives, it generates a unique UUID, maps the incoming JSON coordinates to the `@passl/core` `Order` module, and forces the state transition to `BATCHING`.
- It saves the order directly to the database via `this.repo.save(order)`.

### 2. `apps/worker/src/dispatch/dispatch.processor.ts`
This is a Background Job Processor listening to the `dispatch-queue` in Redis.
- **Pulling**: It fetches all orders sitting in the `BATCHING` state from the database.
- **Batching**: It instantiates the `BatchingEngine` passing in an actual `OsrmClient` for real-world time-estimates, and generates optimal sets.
- **Locking**: Crucially, it uses an infrastructure `RedisLock` to ensure multiple workers aren't locking or processing the same batches concurrently.

### 3. `packages/core/src/domain/batching/BatchingEngine.ts`
This is pure, agnostic mapping logic.
- It looks for any orders still in the `BATCHING` state. 
- It iteratively groups them if they share the same `restaurantId`, and scores them using time-savings heuristics (Time(Seed) + Time(Candidate) > Time(Batched)).
- If an order has waited longer than the `maxWaitTimeSec`, it forces its state to `READY` to give up waiting and just broadcast the single order to drivers.

### 4. `packages/core/src/domain/dispatch/DispatchLoop.ts`
This is a utility class that determines which drivers to Ping.
- It filters drivers based on their `.canAcceptJob()` logic (online, verified, not busy).
- It takes in a `RoutingPort` during initialization to asynchronously fetch an OSRM real-world driving-duration Matrix between the batch target location and all candidate drivers, sorting them by real driving ETA rather than physical straight-line math.
- Bins the sorted drivers into waves so they can receive broadcasted offers in staggered arrays.

### 5. `packages/infra/src/db/PrismaRepositories.ts`
This implements the core `OrderRepository` interface so different apps can hook it up using Dependency Injection.
- Uses `PrismaClient` to interact with a PostgreSQL schema.
- Abstracts away ORM logic (`upsert`, `findUnique`, `findMany`) and returns native `@passl/core` `Order` arrays so the rest of the app doesn't know it's using Prisma.

### 6. `packages/contracts/src/index.ts`
A very simple Data Transfer Object (DTO) layer.
- Uses `class-validator` so the REST api automatically validates that `pLat` and `pLon` are Numbers, and `restaurantId` is present before the Controller even fires.

## How it works together E2E
1. A user places an order via the `apps/api`.
2. The `api` saves this into the database using `packages/infra`'s Prisma integration. The status is `BATCHING`.
3. In the background, `apps/worker` continuously polls or picks up these orders.
4. The `worker` imports the uncoupled routing heuristics (`packages/core/BatchingEngine`) and runs the grouping logic.
5. The `worker` requests real-world time estimates by utilizing `packages/infra/OsrmClient`.
6. Once a batch is grouped, the `worker` generates broadcasting waves of drivers via `DispatchLoop` (`packages/core`) and begins pinging them.

## The Rolling Horizon Batching
The batching engine does not trigger immediately upon order creation. It uses a **Rolling Horizon** algorithm.
- **The Horizon Pool:** Orders placed via the API enter a `BATCHING` pool instead of being dispatched immediately. 
- **The Roll (Cron):** A `DispatchCronService` inside `apps/worker` automatically pings the BullMQ `dispatch-queue` every 10 seconds.
- **The Release:** `BatchingEngine` evaluates the pool. Profitably clustered orders are grouped into waves. If an individual order sits in the horizon pool longer than `maxWaitTimeSec` (default 5 minutes), it is released as a solo driver bid to avoid starving the customer.

By storing the "Core Engine" separate from the "HTTP API" and the "Redis Worker", it guarantees code can be heavily unit tested and run purely offline!

## Local Setup
1. `docker-compose up -d`
2. `pnpm install`
3. `pnpm db:migrate`
4. `pnpm -r build`
5. `pnpm start:api` & `pnpm start:worker`
