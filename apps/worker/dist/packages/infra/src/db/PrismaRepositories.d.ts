import { OrderRepository, Order } from '@passl/core';
export declare class PrismaOrderRepository implements OrderRepository {
    private prisma;
    findById(id: string): Promise<Order | null>;
    save(order: Order): Promise<void>;
    saveMany(orders: Order[]): Promise<void>;
    findByStatus(status: string): Promise<Order[]>;
}
