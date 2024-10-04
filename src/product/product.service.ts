import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entity/product.entity';
import { ProductNotFoundException, InsufficientStockException, ProductCreationException, ProductUpdateException } from './exceptions/product.exception';
import { DeleteResponse, ProductResponse } from './interface/product.interface';

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) { }

    async createProduct(product: Product): Promise<ProductResponse> {
        try {
            const newProduct = this.productRepository.create(product);
            const data: Product = await this.productRepository.save(newProduct);

            return {
                success: true,
                message: "Product saved successfully",
                data: data,
            }

        } catch (error) {
            throw new ProductCreationException();
        }
    }

    async GetProducts(): Promise<ProductResponse> {
        try {
            const [data, count] = await this.productRepository.findAndCount();
            return {
                success: true,
                message: "Products retrieved successfully",
                count: count,
                data: data,
            }

        } catch (error) {
            throw new Error(error.message);
        }
    }

    async getProductById(id: number): Promise<ProductResponse> {
        const product = await this.productRepository.findOneBy({ id });
        if (!product) {
            throw new ProductNotFoundException(id);
        }
        return {
            success: true,
            message: "Product retrieved successfully",
            data: product,
        }
    }

    async updateProduct(id: number, quantity: number): Promise<ProductResponse> {
        try {
            const product = await this.productRepository.findOne({ where: { id } });

            if (!product) {
                throw new ProductNotFoundException(id);
            }
            if (product.stock < quantity) {
                throw new InsufficientStockException();
            }
            product.stock -= quantity;

            await this.productRepository.save(product);

            return {
                success: true,
                message: "Product updated successfully",
                data: product,
            }
        } catch (error) {
            throw new ProductUpdateException()
        }
    }

    async deleteProduct(id: number): Promise<DeleteResponse> {
        try {
            const product = await this.productRepository.findOne({ where: { id } });

            if (!product) {
                throw new ProductNotFoundException(id);
            }
            await this.productRepository.remove(product);

            return {
                success: true,
                message: "Product deleted successfully",
            }
        } catch (error) {
            throw new ProductNotFoundException(error);
        }
    }
}
