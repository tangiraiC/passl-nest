import { OrderRepository, Order, OrderState } from '@passl/core';
import { PrismaClient } from '@prisma/client';

export class PrismaOrderRepository implements OrderRepository {
    private prisma = new PrismaClient();

    async findById(id: string): Promise<Order | null> {
        const dbOrder = await this.prisma.order.findUnique({ where: { id } });
        if (!dbOrder) return null;
        return new Order(
            dbOrder.id,
            dbOrder.status as OrderState,
            { lat: dbOrder.pickupLat, lon: dbOrder.pickupLon },
            { lat: dbOrder.dropoffLat, lon: dbOrder.dropoffLon },
            dbOrder.createdAt,
            dbOrder.batchId,
            dbOrder.restaurantId
        );
    }

    async save(order: Order): Promise<void> {
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

    async saveMany(orders: Order[]): Promise<void> {
        if (orders.length === 0) return;

        const operations = orders.map(order =>
            this.prisma.order.upsert({
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
            })
        );

        await this.prisma.$transaction(operations);
    }

    /**
     * Retrieves all orders currently labeled under a specific status.
     * @param status The string OrderState you are querying (e.g. "BATCHING")
     * @returns Mapped domain Order class instances
     */
    async findByStatus(status: string): Promise<Order[]> {
        const rows = await this.prisma.order.findMany({ where: { status } });
        return rows.map((dbRecord: any) => new Order(
            dbRecord.id,
            dbRecord.status as OrderState,
            { lat: dbRecord.pickupLat, lon: dbRecord.pickupLon },
            { lat: dbRecord.dropoffLat, lon: dbRecord.dropoffLon },
            dbRecord.createdAt,
            dbRecord.batchId,
            dbRecord.restaurantId
        ));
    }
}
