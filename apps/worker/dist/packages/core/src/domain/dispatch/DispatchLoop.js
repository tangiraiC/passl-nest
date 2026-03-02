"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DispatchLoop = void 0;
class DispatchLoop {
    constructor(router) {
        this.router = router;
    }
    async createWaves(drivers, target, maxWaves = 5) {
        const candidates = drivers.filter(driver => driver.canAcceptJob());
        const points = [target, ...candidates.map(candidate => candidate.location)];
        const matrix = await this.router.estimateMatrixSeconds(points);
        candidates.sort((a, b) => {
            const idxA = candidates.indexOf(a);
            const idxB = candidates.indexOf(b);
            const timeA = matrix[0][idxA + 1];
            const timeB = matrix[0][idxB + 1];
            return timeA - timeB;
        });
        const waves = Array.from({ length: maxWaves }, () => []);
        candidates.forEach((candidateDriver, index) => {
            waves[index % maxWaves].push(candidateDriver);
        });
        return waves;
    }
}
exports.DispatchLoop = DispatchLoop;
//# sourceMappingURL=DispatchLoop.js.map