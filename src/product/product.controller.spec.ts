import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductResponse, DeleteResponse } from './interface/product.interface';
import { Product } from './entity/product.entity';

describe('ProductController', () => {
    let controller: ProductController;
    let productService: ProductService;

    const mockProductService = {
        createProduct: jest.fn(),
        getProducts: jest.fn(), // Corrected method name
        getProductById: jest.fn(),
        updateProduct: jest.fn(),
        deleteProduct: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProductController],
            providers: [
                { provide: ProductService, useValue: mockProductService },
            ],
        }).compile();

        controller = module.get<ProductController>(ProductController);
        productService = module.get<ProductService>(ProductService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a product', async () => {
        const productData = { name: 'Test Product', price: 100, stock: 10 };
        const response: ProductResponse = {
            success: true,
            message: 'Product created successfully',
            data: { ...productData, id: 1 },
        };

        mockProductService.createProduct.mockResolvedValue(response);

        const result = await controller.createProduct(productData as Product);

        expect(result).toEqual(response);
        expect(mockProductService.createProduct).toHaveBeenCalledWith(productData);
    });

    it('should retrieve products', async () => {
        const response: ProductResponse = {
            success: true,
            message: 'Products retrieved successfully',
            count: 1,
            data: [{ id: 1, name: 'Product A', price: 100, stock: 10 }],
        };

        mockProductService.getProducts.mockResolvedValue(response); // Corrected method name

        const result = await controller.getProducts();

        expect(result).toEqual(response);
        expect(mockProductService.getProducts).toHaveBeenCalled(); // Corrected method name
    });

    it('should retrieve a product by id', async () => {
        const productId = 1;
        const response: ProductResponse = {
            success: true,
            message: 'Product retrieved successfully',
            data: { id: productId, name: 'Product A', price: 100, stock: 10 },
        };

        mockProductService.getProductById.mockResolvedValue(response);

        const result = await controller.getProductById(productId);

        expect(result).toEqual(response);
        expect(mockProductService.getProductById).toHaveBeenCalledWith(productId);
    });

    it('should update a product', async () => {
        const productId = 1;
        const quantity = 5;
        const response: ProductResponse = {
            success: true,
            message: 'Product updated successfully',
            data: { id: productId, name: 'Product A', price: 100, stock: 5 },
        };

        mockProductService.updateProduct.mockResolvedValue(response);

        const result = await controller.updateProduct(productId, quantity);

        expect(result).toEqual(response);
        expect(mockProductService.updateProduct).toHaveBeenCalledWith(productId, quantity);
    });

    it('should delete a product', async () => {
        const productId = 1;
        const response: DeleteResponse = {
            success: true,
            message: 'Product deleted successfully',
        };

        mockProductService.deleteProduct.mockResolvedValue(response);

        const result = await controller.deleteProduct(productId);

        expect(result).toEqual(response);
        expect(mockProductService.deleteProduct).toHaveBeenCalledWith(productId);
    });
});
