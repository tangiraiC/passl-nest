import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { BatchingEngine, DispatchLoop, Order } from '@passl/core';
import { OsrmClient, PrismaOrderRepository, RedisLock } from '@passl/infra';

/**
 * Background consumer that orchestrates batching and routing via BullMQ
 */
@Processor('dispatch-queue')
export class DispatchProcessor extends WorkerHost {
    private batchEngine = new BatchingEngine(new OsrmClient());
    private repo = new PrismaOrderRepository();
    private redisLock = new RedisLock();

    async process(job: Job<any, any, string>): Promise<any> {
        console.log(`Running batch evaluation job: ${job.id}`);

        // 1. Pull pool
        const orders = await this.repo.findByStatus('BATCHING');

        // 2. Evaluate batches
        const batches = await this.batchEngine.evaluateBatches(orders);

        for (const batch of batches) {
            if (batch.length > 1) {
                console.log(`Formed batch with orders: ${batch.map(batchedOrder => batchedOrder.id).join(', ')}`);
                // Lock and mark ready
                const lock = await this.redisLock.redlock.acquire([`batch-lock`], 5000);
                try {
                    for (const currOrder of batch) {
                        currOrder.transition('READY' as any);
                    }
                    await this.repo.saveMany(batch);
                } finally {
                    await lock.release();
                }
            }
        }

        // 3. Dispatch ready batches
        const readyOrders = await this.repo.findByStatus('READY');
        // Group into waves via DispatchLoop.createWaves(...) and emit offers via BullMQ/Events via Redis
        console.log(`Ready for dispatch: ${readyOrders.length} orders.`);
    }
}
