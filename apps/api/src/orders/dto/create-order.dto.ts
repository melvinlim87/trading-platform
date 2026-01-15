import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { OrderSide, OrderType } from '../order.entity';

export class CreateOrderDto {
    @IsString()
    @IsNotEmpty()
    accountId: string;

    @IsString()
    @IsNotEmpty()
    symbol: string;

    @IsEnum(OrderSide)
    side: OrderSide;

    @IsEnum(OrderType)
    type: OrderType;

    @IsNumber()
    @Min(1)
    quantity: number;

    @IsNumber()
    @IsOptional()
    price?: number;
}
