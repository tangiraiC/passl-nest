import { RoutingPort, LatLon } from '@passl/core';
import axios from 'axios';

export class OsrmClient implements RoutingPort {
    private readonly baseUrl = process.env.OSRM_URL || 'http://router.project-osrm.org';

    async estimateRouteSeconds(stops: LatLon[]): Promise<number> {
        const coords = stops.map(stop => `${stop.lon},${stop.lat}`).join(';');
        try {
            const res = await axios.get(`${this.baseUrl}/route/v1/driving/${coords}?overview=false`);
            return res.data.routes[0]?.duration || 0;
        } catch {
            return 9999;
        }
    }

    async estimateMatrixSeconds(points: LatLon[]): Promise<number[][]> {
        const coords = points.map(point => `${point.lon},${point.lat}`).join(';');
        try {
            const res = await axios.get(`${this.baseUrl}/table/v1/driving/${coords}`);
            return res.data.durations;
        } catch {
            return points.map(() => points.map(() => 9999));
        }
    }
}
