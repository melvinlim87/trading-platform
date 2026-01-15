import { Controller, Post, Get, Body, UseGuards, Request, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
    constructor(private ordersService: OrdersService) { }

    @Post()
    async placeOrder(@Request() req: any, @Body() createOrderDto: CreateOrderDto) {
        return this.ordersService.placeOrder(req.user.userId, createOrderDto);
    }

    @Get(':accountId')
    async getOrders(@Param('accountId') accountId: string) {
        return this.ordersService.getOrders(accountId);
    }
}
