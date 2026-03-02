import { Driver } from '../drivers/Driver';
import { LatLon } from '../orders/Order';
import { RoutingPort } from '../../ports/RoutingPort';
export declare class DispatchLoop {
    private readonly router;
    constructor(router: RoutingPort);
    createWaves(drivers: Driver[], target: LatLon, maxWaves?: number): Promise<Driver[][]>;
}
