"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = exports.OrderState = void 0;
var OrderState;
(function (OrderState) {
    OrderState["RAW"] = "RAW";
    OrderState["BATCHING"] = "BATCHING";
    OrderState["READY"] = "READY";
    OrderState["ASSIGNED"] = "ASSIGNED";
    OrderState["PICKED_UP"] = "PICKED_UP";
    OrderState["DELIVERED"] = "DELIVERED";
    OrderState["CANCELLED"] = "CANCELLED";
})(OrderState || (exports.OrderState = OrderState = {}));
class Order {
    constructor(id, status, pickup, dropoff, createdAt, batchId = null, restaurantId = "default") {
        this.id = id;
        this.status = status;
        this.pickup = pickup;
        this.dropoff = dropoff;
        this.createdAt = createdAt;
        this.batchId = batchId;
        this.restaurantId = restaurantId;
    }
    canTransition(to) {
        const transitions = {
            [OrderState.RAW]: [OrderState.BATCHING, OrderState.CANCELLED],
            [OrderState.BATCHING]: [OrderState.READY, OrderState.CANCELLED],
            [OrderState.READY]: [OrderState.ASSIGNED, OrderState.CANCELLED],
            [OrderState.ASSIGNED]: [OrderState.PICKED_UP, OrderState.CANCELLED],
            [OrderState.PICKED_UP]: [OrderState.DELIVERED, OrderState.CANCELLED],
            [OrderState.DELIVERED]: [],
            [OrderState.CANCELLED]: []
        };
        return transitions[this.status]?.includes(to) ?? false;
    }
    transition(to) {
        if (!this.canTransition(to))
            throw new Error(`Invalid transition from ${this.status} to ${to}`);
        this.status = to;
    }
    get ageSeconds() {
        return (Date.now() - this.createdAt.getTime()) / 1000;
    }
}
exports.Order = Order;
//# sourceMappingURL=Order.js.map