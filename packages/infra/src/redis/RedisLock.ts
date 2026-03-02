import Redis from 'ioredis';
import Redlock from 'redlock';

export class RedisLock {
    private client: Redis;
    public redlock: Redlock;

    constructor() {
        this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
        this.redlock = new Redlock([this.client], {
            retryCount: 3,
            retryDelay: 200,
        });
    }
}
