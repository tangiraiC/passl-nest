"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DispatchLoop = void 0;
class DispatchLoop {
    static createWaves(drivers, target, maxWaves = 5) {
        const candidates = drivers.filter(d => d.canAcceptJob());
        candidates.sort((a, b) => {
            const distA = Math.hypot(a.location.lat - target.lat, a.location.lon - target.lon);
            const distB = Math.hypot(b.location.lat - target.lat, b.location.lon - target.lon);
            return distA - distB;
        });
        const waves = Array.from({ length: maxWaves }, () => []);
        candidates.forEach((c, idx) => {
            waves[idx % maxWaves].push(c);
        });
        return waves;
    }
}
exports.DispatchLoop = DispatchLoop;
//# sourceMappingURL=DispatchLoop.js.map