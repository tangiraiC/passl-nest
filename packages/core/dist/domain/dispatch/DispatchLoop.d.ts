import { Driver } from '../drivers/Driver';
import { LatLon } from '../orders/Order';
export declare class DispatchLoop {
    static createWaves(drivers: Driver[], target: LatLon, maxWaves?: number): Driver[][];
}
