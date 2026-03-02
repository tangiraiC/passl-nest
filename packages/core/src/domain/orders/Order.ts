export enum OrderState {
    RAW = 'RAW',
    BATCHING = 'BATCHING',
    READY = 'READY',
    ASSIGNED = 'ASSIGNED',
    PICKED_UP = 'PICKED_UP',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED'
}

export interface LatLon {
    lat: number;
    lon: number;
}

export class Order {
    constructor(
        public readonly id: string,
        public status: OrderState,
        public readonly pickup: LatLon,
        public readonly dropoff: LatLon,
        public readonly createdAt: Date,
        public batchId: string | null = null,
        public restaurantId: string = "default"
    ) { }

    canTransition(to: OrderState): boolean {
        const transitions: Record<OrderState, OrderState[]> = {
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

    transition(to: OrderState): void {
        if (!this.canTransition(to)) throw new Error(`Invalid transition from ${this.status} to ${to}`);
        this.status = to;
    }

    get ageSeconds(): number {
        return (Date.now() - this.createdAt.getTime()) / 1000;
    }
}
