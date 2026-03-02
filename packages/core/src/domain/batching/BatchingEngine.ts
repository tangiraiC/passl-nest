import { Order, OrderState } from '../orders/Order';
import { RoutingPort } from '../../ports/RoutingPort';

export class BatchingEngine {
    constructor(
        private readonly routingPort: RoutingPort,
        private readonly maxWaitTimeSec: number = 300,
        private readonly ageWeight: number = 0.5
    ) { }

    /**
     * Evaluates a pool of orders and groups them into batches based on restaurant and time savings.
     * @param orders Array of raw orders currently in the system.
     * @returns Array of grouped orders (batches).
     */
    async evaluateBatches(orders: Order[]): Promise<Order[][]> {
        const batches: Order[][] = [];
        // Filter orders that are specifically waiting to be batched
        const pool = [...orders.filter(order => order.status === OrderState.BATCHING)];

        while (pool.length > 0) {
            const seed = pool.shift()!;
            const currentBatch = [seed];

            for (let i = pool.length - 1; i >= 0; i--) {
                const candidate = pool[i];

                // Match only if exact same pickup for strict clustering, or use proximity clustering logic here.
                if (seed.restaurantId !== candidate.restaurantId) continue;

                const timeSeed = await this.routingPort.estimateRouteSeconds([seed.pickup, seed.dropoff]);
                const timeCand = await this.routingPort.estimateRouteSeconds([candidate.pickup, candidate.dropoff]);
                const batchedTime = await this.routingPort.estimateRouteSeconds([
                    seed.pickup, candidate.pickup, seed.dropoff, candidate.dropoff
                ]);

                const savings = (timeSeed + timeCand) - batchedTime;
                const finalScore = savings + (this.ageWeight * candidate.ageSeconds);

                if (finalScore > 0) {
                    currentBatch.push(candidate);
                    pool.splice(i, 1);
                } else if (candidate.ageSeconds > this.maxWaitTimeSec) {
                    candidate.transition(OrderState.READY);
                }
            }
            batches.push(currentBatch);
        }
        return batches;
    }
}
