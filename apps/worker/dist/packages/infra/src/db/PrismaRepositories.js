"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaOrderRepository = void 0;
const core_1 = require("@passl/core");
const client_1 = require("@prisma/client");
class PrismaOrderRepository {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async findById(id) {
        const dbOrder = await this.prisma.order.findUnique({ where: { id } });
        if (!dbOrder)
            return null;
        return new core_1.Order(dbOrder.id, dbOrder.status, { lat: dbOrder.pickupLat, lon: dbOrder.pickupLon }, { lat: dbOrder.dropoffLat, lon: dbOrder.dropoffLon }, dbOrder.createdAt, dbOrder.batchId, dbOrder.restaurantId);
    }
    async save(order) {
        await this.prisma.order.upsert({
            where: { id: order.id },
            update: { status: order.status, batchId: order.batchId },
            create: {
                id: order.id,
                status: order.status,
                restaurantId: order.restaurantId,
                pickupLat: order.pickup.lat,
                pickupLon: order.pickup.lon,
                dropoffLat: order.dropoff.lat,
                dropoffLon: order.dropoff.lon,
                createdAt: order.createdAt,
                batchId: order.batchId
            }
        });
    }
    async saveMany(orders) {
        if (orders.length === 0)
            return;
        const operations = orders.map(order => this.prisma.order.upsert({
            where: { id: order.id },
            update: { status: order.status, batchId: order.batchId },
            create: {
                id: order.id,
                status: order.status,
                restaurantId: order.restaurantId,
                pickupLat: order.pickup.lat,
                pickupLon: order.pickup.lon,
                dropoffLat: order.dropoff.lat,
                dropoffLon: order.dropoff.lon,
                createdAt: order.createdAt,
                batchId: order.batchId
            }
        }));
        await this.prisma.$transaction(operations);
    }
    async findByStatus(status) {
        const rows = await this.prisma.order.findMany({ where: { status } });
        return rows.map((dbRecord) => new core_1.Order(dbRecord.id, dbRecord.status, { lat: dbRecord.pickupLat, lon: dbRecord.pickupLon }, { lat: dbRecord.dropoffLat, lon: dbRecord.dropoffLon }, dbRecord.createdAt, dbRecord.batchId, dbRecord.restaurantId));
    }
}
exports.PrismaOrderRepository = PrismaOrderRepository;
//# sourceMappingURL=PrismaRepositories.js.map