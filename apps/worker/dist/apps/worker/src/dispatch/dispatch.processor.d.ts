import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
export declare class DispatchProcessor extends WorkerHost {
    private batchEngine;
    private repo;
    private redisLock;
    process(job: Job<any, any, string>): Promise<any>;
}
