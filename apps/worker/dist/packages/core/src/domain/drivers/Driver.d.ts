import { LatLon } from '../orders/Order';
export declare class Driver {
    readonly id: string;
    location: LatLon;
    isOnline: boolean;
    capacity: number;
    verified: boolean;
    lastUpdate: Date;
    activeJobId: string | null;
    constructor(id: string, location: LatLon, isOnline: boolean, capacity: number, verified: boolean, lastUpdate: Date, activeJobId?: string | null);
    canAcceptJob(): boolean;
}
