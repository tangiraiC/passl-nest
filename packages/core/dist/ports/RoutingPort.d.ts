import { LatLon } from '../domain/orders/Order';
export interface RoutingPort {
    estimateRouteSeconds(stops: LatLon[]): Promise<number>;
    estimateMatrixSeconds(points: LatLon[]): Promise<number[][]>;
}
