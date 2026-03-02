export declare enum OrderState {
    RAW = "RAW",
    BATCHING = "BATCHING",
    READY = "READY",
    ASSIGNED = "ASSIGNED",
    PICKED_UP = "PICKED_UP",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED"
}
export interface LatLon {
    lat: number;
    lon: number;
}
export declare class Order {
    readonly id: string;
    status: OrderState;
    readonly pickup: LatLon;
    readonly dropoff: LatLon;
    readonly createdAt: Date;
    batchId: string | null;
    restaurantId: string;
    constructor(id: string, status: OrderState, pickup: LatLon, dropoff: LatLon, createdAt: Date, batchId?: string | null, restaurantId?: string);
    canTransition(to: OrderState): boolean;
    transition(to: OrderState): void;
    get ageSeconds(): number;
}
