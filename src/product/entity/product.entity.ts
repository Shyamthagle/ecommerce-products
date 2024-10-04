import { IsString, IsNotEmpty, IsDecimal, IsPositive, IsInt, Min } from 'class-validator';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @IsString()
    @IsNotEmpty()
    name: string;

    @Column()
    @IsInt()
    @IsPositive()
    price: number;

    @Column()
    @IsInt()
    @IsPositive()
    @Min(0)
    stock: number;
}
