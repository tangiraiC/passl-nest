import { LatLon } from '../orders/Order';

export class Driver {
    constructor(
        public readonly id: string,
        public location: LatLon,
        public isOnline: boolean,
        public capacity: number,
        public verified: boolean,
        public lastUpdate: Date,
        public activeJobId: string | null = null
    ) { }

    canAcceptJob(): boolean {
        return this.isOnline && this.verified && !this.activeJobId && this.capacity > 0;
    }
}
