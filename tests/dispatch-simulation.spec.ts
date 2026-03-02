import {
    BatchingEngine,
    Order,
    OrderState,
    RoutingPort,
    Driver,
    DispatchLoop
} from '@passl/core';

import * as testData from './simulation-data.json';

class MockRouter implements RoutingPort {
    async estimateRouteSeconds(stops: any[]) {
        return stops.length === 2 ? 10 : 15;
    }
    async estimateMatrixSeconds(points: any[]) {
        return points.map((_, i) => points.map((_, j) => Math.abs(i - j) * 5));
    }
}

describe('Dispatch Simulation E2E', () => {
    it('should simulate order ingestion, batching, and driver dispatch', async () => {
        // 1. Order Ingestion
        const ingestionPool = testData.orders.map((simOrder: any) => new Order(
            simOrder.id,
            OrderState.BATCHING,
            simOrder.pickup,
            simOrder.dropoff,
            new Date(simOrder.createdAt),
            null,
            simOrder.restaurantId
        ));

        // 2. Batching
        const router = new MockRouter();
        const batchingEngine = new BatchingEngine(router);
        const batches = await batchingEngine.evaluateBatches(ingestionPool);

        // Verify batches are created
        expect(batches.length).toBeGreaterThan(0);

        // Find the batch for a restaurant that we know has multiple orders
        const resBatch = batches.find((batchArray: Order[]) => batchArray.length > 1);
        expect(resBatch).toBeDefined();

        // Assuming first order in batch defines the target location
        const targetLocation = resBatch![0].pickup;

        // 3. Driver Pool
        const drivers = testData.drivers.map((simDriver: any) => new Driver(
            simDriver.id,
            simDriver.location,
            simDriver.isOnline,
            simDriver.capacity,
            simDriver.verified,
            new Date(simDriver.lastUpdate)
        ));

        // 4. Dispatch Broadcasting
        // Create waves for the res1 batch (targetLocation is lat:0, lon:0)
        const loop = new DispatchLoop(router);
        const waves = await loop.createWaves(drivers, targetLocation, 2);

        // We expect only online, available drivers
        expect(waves.length).toBe(2);
        expect(waves[0].length).toBeGreaterThan(0);

        // 5. Driver Acceptance Simulation
        const acceptedDriver = waves[0][0]; // Closest driver accepts
        expect(acceptedDriver.canAcceptJob()).toBe(true);
        acceptedDriver.activeJobId = 'job_batch'; // Assign job
        expect(acceptedDriver.canAcceptJob()).toBe(false); // No longer available

        // State updates
        resBatch!.forEach((batchedOrder: Order) => {
            batchedOrder.transition(OrderState.READY);
            batchedOrder.transition(OrderState.ASSIGNED);
        });

        // Assert all orders in the batch have been updated
        resBatch!.forEach((validOrder: Order) => {
            expect(validOrder.status).toBe(OrderState.ASSIGNED);
        });

        console.log("=== Simulation Results ===");
        console.log(`Initial Orders Ingested: ${ingestionPool.length}`);
        console.log(`Total Batches (Jobs) Created: ${batches.length}`);
        batches.forEach((batch: Order[], idx: number) => {
            console.log(`  - Job ${idx + 1}: Contains ${batch.length} order(s) for Restaurant ${batch[0].restaurantId}`);
        });
        console.log(`\nDrivers assigned to largest batch (Restaurant ${resBatch![0].restaurantId}):`);
        console.log(`  - Driver ID: ${acceptedDriver.id} (Wave 1, Job Assigments: 1)`);
    });
});
