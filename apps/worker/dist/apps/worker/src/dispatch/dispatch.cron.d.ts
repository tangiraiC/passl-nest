import { Queue } from 'bullmq';
export declare class DispatchCronService {
    private dispatchQueue;
    private readonly logger;
    constructor(dispatchQueue: Queue);
    handleBatchingTick(): Promise<void>;
}
