"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DispatchProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const core_1 = require("@passl/core");
const infra_1 = require("@passl/infra");
let DispatchProcessor = class DispatchProcessor extends bullmq_1.WorkerHost {
    constructor() {
        super(...arguments);
        this.batchEngine = new core_1.BatchingEngine(new infra_1.OsrmClient());
        this.repo = new infra_1.PrismaOrderRepository();
        this.redisLock = new infra_1.RedisLock();
    }
    async process(job) {
        console.log(`Running batch evaluation job: ${job.id}`);
        const orders = await this.repo.findByStatus('BATCHING');
        const batches = await this.batchEngine.evaluateBatches(orders);
        for (const batch of batches) {
            if (batch.length > 1) {
                console.log(`Formed batch with orders: ${batch.map(batchedOrder => batchedOrder.id).join(', ')}`);
                const lock = await this.redisLock.redlock.acquire([`batch-lock`], 5000);
                try {
                    for (const currOrder of batch) {
                        currOrder.transition('READY');
                    }
                    await this.repo.saveMany(batch);
                }
                finally {
                    await lock.release();
                }
            }
        }
        const readyOrders = await this.repo.findByStatus('READY');
        console.log(`Ready for dispatch: ${readyOrders.length} orders.`);
    }
};
exports.DispatchProcessor = DispatchProcessor;
exports.DispatchProcessor = DispatchProcessor = __decorate([
    (0, bullmq_1.Processor)('dispatch-queue')
], DispatchProcessor);
//# sourceMappingURL=dispatch.processor.js.map