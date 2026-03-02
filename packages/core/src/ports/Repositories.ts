import { Order } from '../domain/orders/Order';
import { Driver } from '../domain/drivers/Driver';

export interface OrderRepository {
    findById(id: string): Promise<Order | null>;
    save(order: Order): Promise<void>;
    saveMany(orders: Order[]): Promise<void>;
    findByStatus(status: string): Promise<Order[]>;
}

export interface DriverRepository {
    findById(id: string): Promise<Driver | null>;
    save(driver: Driver): Promise<void>;
    getAvailableDrivers(): Promise<Driver[]>;
}
