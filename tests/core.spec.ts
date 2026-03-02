import { BatchingEngine, Order, OrderState, RoutingPort } from '@passl/core';

class MockRouter implements RoutingPort {
    async estimateRouteSeconds(stops: any[]) { return stops.length === 2 ? 10 : 15; }
    async estimateMatrixSeconds() { return []; }
}

describe('BatchingEngine', () => {
    it('should batch orders cleanly', async () => {
        const engine = new BatchingEngine(new MockRouter());
        const order1 = new Order('1', OrderState.BATCHING, { lat: 0, lon: 0 }, { lat: 1, lon: 1 }, new Date(), null, 'res1');
        const order2 = new Order('2', OrderState.BATCHING, { lat: 0, lon: 0 }, { lat: 1, lon: 1 }, new Date(), null, 'res1');

        const batches = await engine.evaluateBatches([order1, order2]);
        expect(batches.length).toBe(1);
        expect(batches[0].length).toBe(2);
    });
});
