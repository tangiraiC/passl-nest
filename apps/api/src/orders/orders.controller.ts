import { Controller, Post, Body, Get, Param, Query, Inject } from '@nestjs/common';
import { CreateOrderDto } from '@passl/contracts';
import { Order, OrderState, OrderRepository } from '@passl/core';
import { v4 as uuidv4 } from 'uuid';

@Controller('orders')
export class OrdersController {
    constructor(@Inject('OrderRepository') private readonly repo: OrderRepository) { }

    @Post()
    async createOrder(@Body() dto: CreateOrderDto) {
        const order = new Order(
            uuidv4(),
            OrderState.RAW,
            { lat: dto.pLat, lon: dto.pLon },
            { lat: dto.dLat, lon: dto.dLon },
            new Date(),
            null,
            dto.restaurantId
        );
        order.transition(OrderState.BATCHING); // Auto-push to batching pool
        await this.repo.save(order);
        return order;
    }

    @Post(':id/cancel')
    async cancelOrder(@Param('id') id: string) {
        const order = await this.repo.findById(id);
        if (!order) throw new Error('Not found');
        order.transition(OrderState.CANCELLED);
        await this.repo.save(order);
        return order;
    }

    @Get(':id')
    async getOrder(@Param('id') id: string) {
        return await this.repo.findById(id);
    }

    @Get()
    async getOrders(@Query('status') status: string) {
        return await this.repo.findByStatus(status);
    }
}
