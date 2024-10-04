import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { Product } from './entity/product.entity';
import {
    ProductCreationException,
    ProductNotFoundException,
    InsufficientStockException,
    ProductUpdateException,
} from './exceptions/product.exception';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';

describe('ProductService', () => {
    let service: ProductService;
    let productRepository: Repository<Product>;
    let cacheManager: Cache;

    const mockProductRepository = {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        remove: jest.fn(),
        findAndCount: jest.fn(),
    };

    const mockCacheManager = {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductService,
                { provide: getRepositoryToken(Product), useValue: mockProductRepository },
                { provide: 'CACHE_MANAGER', useValue: mockCacheManager },
            ],
        }).compile();

        service = module.get<ProductService>(ProductService);
        productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
        cacheManager = module.get<Cache>('CACHE_MANAGER');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a product', async () => {
        const productData = { name: 'Test Product', price: 100, stock: 10 };
        const product = { ...productData, id: 1 };

        mockProductRepository.create.mockReturnValue(product);
        mockProductRepository.save.mockResolvedValue(product);
        mockCacheManager.get.mockResolvedValue({ data: [], count: 0 });

        const result = await service.createProduct(productData as Product);

        expect(result).toEqual({
            success: true,
            message: 'Product created successfully',
            data: product,
        });
        expect(mockProductRepository.create).toHaveBeenCalledWith(productData);
        expect(mockProductRepository.save).toHaveBeenCalledWith(product);
        expect(mockCacheManager.set).toHaveBeenCalledWith('allProductsCache', { data: [product], count: 1 }, 300000);
    });

    it('should throw ProductCreationException on error', async () => {
        const productData = { name: 'Test Product', price: 100, stock: 10 };
        mockProductRepository.create.mockReturnValue(productData);
        mockProductRepository.save.mockRejectedValue(new Error('Database Error'));

        await expect(service.createProduct(productData as Product)).rejects.toThrow(ProductCreationException);
    });

    it('should retrieve products from cache', async () => {
        const cachedProducts = { data: [{ id: 1, name: 'Product A', price: 100, stock: 10 }], count: 1 };
        mockCacheManager.get.mockResolvedValue(cachedProducts);

        const result = await service.getProducts(); // Updated function call

        expect(result).toEqual({
            success: true,
            message: 'Products retrieved successfully (from cache)',
            count: cachedProducts.count,
            data: cachedProducts.data,
        });
    });

    it('should retrieve products from database if cache is empty', async () => {
        const products = [{ id: 1, name: 'Product A', price: 100, stock: 10 }];
        mockCacheManager.get.mockResolvedValue(null);
        mockProductRepository.findAndCount.mockResolvedValue([products, products.length]);

        const result = await service.getProducts(); // Updated function call

        expect(result).toEqual({
            success: true,
            message: 'Products retrieved successfully',
            count: products.length,
            data: products,
        });
        expect(mockCacheManager.set).toHaveBeenCalledWith('allProductsCache', { data: products, count: products.length }, 300000);
    });

    it('should throw ProductNotFoundException if product not found', async () => {
        const productId = 1;
        mockProductRepository.findOne.mockResolvedValue(null);

        await expect(service.getProductById(productId)).rejects.toThrow(ProductNotFoundException);
    });

    it('should retrieve a product by ID', async () => {
        const productId = 1;
        const product = { id: productId, name: 'Product A', price: 100, stock: 10 };
        mockProductRepository.findOne.mockResolvedValue(product);

        const result = await service.getProductById(productId);

        expect(result).toEqual({
            success: true,
            message: 'Product retrieved successfully',
            data: product,
        });
        expect(mockCacheManager.set).toHaveBeenCalledWith(`product_${productId}`, product, 300000);
    });

    it('should update product stock', async () => {
        const productId = 1;
        const quantity = 5;
        const product = { id: productId, name: 'Product A', price: 100, stock: 10 };
        mockProductRepository.findOne.mockResolvedValue(product);
        mockProductRepository.save.mockResolvedValue({ ...product, stock: 5 });

        const result = await service.updateProduct(productId, quantity);

        expect(result).toEqual({
            success: true,
            message: 'Product updated successfully',
            data: { ...product, stock: 5 },
        });
        expect(mockProductRepository.save).toHaveBeenCalledWith({ ...product, stock: 5 });
        expect(mockCacheManager.del).toHaveBeenCalledWith('allProductsCache');
    });

    it('should throw InsufficientStockException if stock is not enough', async () => {
        const productId = 1;
        const quantity = 15;
        const product = { id: productId, name: 'Product A', price: 100, stock: 10 };
        mockProductRepository.findOne.mockResolvedValue(product);

        await expect(service.updateProduct(productId, quantity)).rejects.toThrow(InsufficientStockException);
    });

    it('should delete a product', async () => {
        const productId = 1;
        const product = { id: productId, name: 'Product A', price: 100, stock: 10 };
        mockProductRepository.findOne.mockResolvedValue(product);
        mockProductRepository.remove.mockResolvedValue(undefined);

        const result = await service.deleteProduct(productId);

        expect(result).toEqual({
            success: true,
            message: 'Product deleted successfully',
        });
        expect(mockProductRepository.remove).toHaveBeenCalledWith(product);
        expect(mockCacheManager.del).toHaveBeenCalledWith('allProductsCache');
    });

    it('should throw ProductNotFoundException on delete if product not found', async () => {
        const productId = 1;
        mockProductRepository.findOne.mockResolvedValue(null);

        await expect(service.deleteProduct(productId)).rejects.toThrow(ProductNotFoundException);
    });
});
