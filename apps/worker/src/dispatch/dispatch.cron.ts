import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class DispatchCronService {
    private readonly logger = new Logger(DispatchCronService.name);

    constructor(@InjectQueue('dispatch-queue') private dispatchQueue: Queue) { }

    // Runs every 10 seconds to look for BATCHING orders
    @Cron('*/10 * * * * *')
    async handleBatchingTick() {
        this.logger.log('Cron Tick: Triggering batching evaluation pipeline...');

        // Push an empty job object onto the queue. 
        // The DispatchProcessor will pick this up and execute its entire workflow.
        await this.dispatchQueue.add('evaluate-batches', { triggeredBy: 'cron', timestamp: new Date() });
    }
}
