"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisLock = void 0;
const ioredis_1 = require("ioredis");
const redlock_1 = require("redlock");
class RedisLock {
    constructor() {
        this.client = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379');
        this.redlock = new redlock_1.default([this.client], {
            retryCount: 3,
            retryDelay: 200,
        });
    }
}
exports.RedisLock = RedisLock;
//# sourceMappingURL=RedisLock.js.map