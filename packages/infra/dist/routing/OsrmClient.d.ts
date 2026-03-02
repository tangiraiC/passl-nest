import { RoutingPort, LatLon } from '@passl/core';
export declare class OsrmClient implements RoutingPort {
    private readonly baseUrl;
    estimateRouteSeconds(stops: LatLon[]): Promise<number>;
    estimateMatrixSeconds(points: LatLon[]): Promise<number[][]>;
}
