import { Driver } from '../drivers/Driver';
import { LatLon } from '../orders/Order';
import { RoutingPort } from '../../ports/RoutingPort';

export class DispatchLoop {
    constructor(private readonly router: RoutingPort) { }

    /**
     * Creates broadcast waves from candidate drivers sorted by real proximity.
     * @param drivers Full array of drivers in the system
     * @param target The central location pickup for the batch
     * @param maxWaves How many groups to segment drivers into
     * @returns Array of driver chunks ordered by OSRM ETA matching
     */
    async createWaves(drivers: Driver[], target: LatLon, maxWaves: number = 5): Promise<Driver[][]> {
        const candidates = drivers.filter(driver => driver.canAcceptJob());

        // We build a single array: [target, ...candidates]
        // estimateMatrixSeconds will return a 2D array of times where m[0] is time from target to each index
        const points = [target, ...candidates.map(candidate => candidate.location)];
        const matrix = await this.router.estimateMatrixSeconds(points);

        // Sorting by true estimated travel duration from Target to Driver!
        candidates.sort((a, b) => {
            const idxA = candidates.indexOf(a);
            const idxB = candidates.indexOf(b);

            // matrix[0] corresponds to the 'target', so matrix[0][idx + 1] gets the time from target to the candidate driver
            const timeA = matrix[0][idxA + 1];
            const timeB = matrix[0][idxB + 1];

            return timeA - timeB;
        });

        const waves: Driver[][] = Array.from({ length: maxWaves }, () => []);
        candidates.forEach((candidateDriver, index) => {
            waves[index % maxWaves].push(candidateDriver);
        });

        return waves;
    }
}
