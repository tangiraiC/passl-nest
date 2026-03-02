import { Order } from '../orders/Order';
import { RoutingPort } from '../../ports/RoutingPort';
export declare class BatchingEngine {
    private readonly routingPort;
    private readonly maxWaitTimeSec;
    private readonly ageWeight;
    constructor(routingPort: RoutingPort, maxWaitTimeSec?: number, ageWeight?: number);
    evaluateBatches(orders: Order[]): Promise<Order[][]>;
}
