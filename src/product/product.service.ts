import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entity/product.entity';
import {
    ProductNotFoundException,
    InsufficientStockException,
    ProductCreationException,
    ProductUpdateException,
} from './exceptions/product.exception';
import { DeleteResponse, ProductResponse } from './interface/product.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ProductService {
    private readonly cacheKey = 'allProductsCache';

    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {}

    async createProduct(product: Product): Promise<ProductResponse> {
        try {
            const newProduct = this.productRepository.create(product);
            const data: Product = await this.productRepository.save(newProduct);

            const cachedProducts: { data: Product[], count: number } = await this.cacheManager.get(this.cacheKey);

            if (cachedProducts) {
                cachedProducts.data.push(data);
                cachedProducts.count += 1;
                await this.cacheManager.set(this.cacheKey, cachedProducts, 300000); // Cache for 5 minutes
            }

            return {
                success: true,
                message: 'Product created successfully',
                data: data,
            };
        } catch (error) {
            throw new ProductCreationException();
        }
    }

    async getProducts(): Promise<ProductResponse> {
        try {
            const cachedProducts: { data: Product[], count: number } = await this.cacheManager.get(this.cacheKey);

            if (cachedProducts) {
                return {
                    success: true,
                    message: 'Products retrieved successfully (from cache)',
                    count: cachedProducts.count,
                    data: cachedProducts.data,
                };
            }

            const [data, count] = await this.productRepository.findAndCount();

            await this.cacheManager.set(this.cacheKey, { data, count }, 300000); // Cache for 5 minutes

            return {
                success: true,
                message: 'Products retrieved successfully',
                count: count,
                data: data,
            };
        } catch (error) {
            throw new Error('Failed to retrieve products');
        }
    }

    async getProductById(id: number): Promise<ProductResponse> {
        const cacheKey = `product_${id}`;

        try {
            const cachedProduct: Product = await this.cacheManager.get(cacheKey);

            if (cachedProduct) {
                return {
                    success: true,
                    message: 'Product retrieved successfully (from cache)',
                    data: cachedProduct,
                };
            }

            const product = await this.productRepository.findOne({ where: { id } });

            if (!product) {
                throw new ProductNotFoundException();
            }

            await this.cacheManager.set(cacheKey, product, 300000); // Cache for 5 minutes

            return {
                success: true,
                message: 'Product retrieved successfully',
                data: product,
            };
        } catch (error) {
            if (error instanceof ProductNotFoundException) {
                throw error; // Rethrow known exceptions
            }
            throw new ProductNotFoundException();
        }
    }

    async updateProduct(id: number, quantity: number): Promise<ProductResponse> {
        try {
            const product = await this.productRepository.findOne({ where: { id } });

            if (!product) {
                throw new ProductNotFoundException();
            }

            if (product.stock < quantity) {
                throw new InsufficientStockException();
            }

            product.stock -= quantity;
            await this.productRepository.save(product);

            await this.cacheManager.del(this.cacheKey);

            return {
                success: true,
                message: 'Product updated successfully',
                data: product,
            };
        } catch (error) {
            if (error instanceof ProductNotFoundException || error instanceof InsufficientStockException) {
                throw error; // Rethrow known exceptions
            }
            throw new ProductUpdateException();
        }
    }

    async deleteProduct(id: number): Promise<DeleteResponse> {
        try {
            const product = await this.productRepository.findOne({ where: { id } });

            if (!product) {
                throw new ProductNotFoundException();
            }

            await this.productRepository.remove(product);
            await this.cacheManager.del(this.cacheKey);

            return {
                success: true,
                message: 'Product deleted successfully',
            };
        } catch (error) {
            if (error instanceof ProductNotFoundException) {
                throw error; // Rethrow known exceptions
            }
            throw new ProductNotFoundException();
        }
    }
}
