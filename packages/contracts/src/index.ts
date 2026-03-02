import { IsNumber, IsString } from 'class-validator';

export class CreateOrderDto {
    @IsString() restaurantId!: string;
    @IsNumber() pLat!: number;
    @IsNumber() pLon!: number;
    @IsNumber() dLat!: number;
    @IsNumber() dLon!: number;
}
