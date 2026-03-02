"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OsrmClient = void 0;
const axios_1 = require("axios");
class OsrmClient {
    constructor() {
        this.baseUrl = process.env.OSRM_URL || 'http://router.project-osrm.org';
    }
    async estimateRouteSeconds(stops) {
        const coords = stops.map(stop => `${stop.lon},${stop.lat}`).join(';');
        try {
            const res = await axios_1.default.get(`${this.baseUrl}/route/v1/driving/${coords}?overview=false`);
            return res.data.routes[0]?.duration || 0;
        }
        catch {
            return 9999;
        }
    }
    async estimateMatrixSeconds(points) {
        const coords = points.map(point => `${point.lon},${point.lat}`).join(';');
        try {
            const res = await axios_1.default.get(`${this.baseUrl}/table/v1/driving/${coords}`);
            return res.data.durations;
        }
        catch {
            return points.map(() => points.map(() => 9999));
        }
    }
}
exports.OsrmClient = OsrmClient;
//# sourceMappingURL=OsrmClient.js.map