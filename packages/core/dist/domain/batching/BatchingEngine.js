"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchingEngine = void 0;
const Order_1 = require("../orders/Order");
class BatchingEngine {
    constructor(routingPort, maxWaitTimeSec = 300, ageWeight = 0.5) {
        this.routingPort = routingPort;
        this.maxWaitTimeSec = maxWaitTimeSec;
        this.ageWeight = ageWeight;
    }
    async evaluateBatches(orders) {
        const batches = [];
        const pool = [...orders.filter(o => o.status === Order_1.OrderState.BATCHING)];
        while (pool.length > 0) {
            const seed = pool.shift();
            const currentBatch = [seed];
            for (let i = pool.length - 1; i >= 0; i--) {
                const candidate = pool[i];
                if (seed.restaurantId !== candidate.restaurantId)
                    continue;
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
                }
                else if (candidate.ageSeconds > this.maxWaitTimeSec) {
                    candidate.transition(Order_1.OrderState.READY);
                }
            }
            batches.push(currentBatch);
        }
        return batches;
    }
}
exports.BatchingEngine = BatchingEngine;
//# sourceMappingURL=BatchingEngine.js.map