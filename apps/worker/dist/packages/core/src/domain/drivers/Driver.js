"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Driver = void 0;
class Driver {
    constructor(id, location, isOnline, capacity, verified, lastUpdate, activeJobId = null) {
        this.id = id;
        this.location = location;
        this.isOnline = isOnline;
        this.capacity = capacity;
        this.verified = verified;
        this.lastUpdate = lastUpdate;
        this.activeJobId = activeJobId;
    }
    canAcceptJob() {
        return this.isOnline && this.verified && !this.activeJobId && this.capacity > 0;
    }
}
exports.Driver = Driver;
//# sourceMappingURL=Driver.js.map