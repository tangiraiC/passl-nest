import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OrdersController } from './orders/orders.controller';
import { PrismaOrderRepository } from '@passl/infra';

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true })],
    controllers: [OrdersController],
    providers: [
        { provide: 'OrderRepository', useClass: PrismaOrderRepository }
    ],
})
export class AppModule { }
