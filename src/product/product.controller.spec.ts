import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product } from './entity/product.entity';
import { DeleteResponse, ProductResponse } from './interface/product.interface';

describe('ProductController', () => {
    let productController: ProductController;
    let productService: ProductService;

    const mockProductService = {
        createProduct: jest.fn(),
        GetProducts: jest.fn(),
        getProductById: jest.fn(),
        updateProduct: jest.fn(),
        deleteProduct: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProductController],
            providers: [
                {
                    provide: ProductService,
                    useValue: mockProductService,
                },
            ],
        }).compile();

        productController = module.get<ProductController>(ProductController);
        productService = module.get<ProductService>(ProductService);
    });

    it('should be defined', () => {
        expect(productController).toBeDefined();
    });

    describe('createProduct', () => {
        it('should create a product successfully', async () => {
            const product = new Product(); // Mock product object
            const createdProductResponse: ProductResponse = {
                success: true,
                message: 'Product created successfully',
                data: product,
            };

            mockProductService.createProduct.mockResolvedValue(createdProductResponse);

            const result = await productController.createProduct(product);

            expect(result).toEqual(createdProductResponse);
            expect(mockProductService.createProduct).toHaveBeenCalledWith(product);
        });
    });

    describe('GetProducts', () => {
        it('should return an array of products successfully', async () => {
            const products = [new Product(), new Product()]; // Mock product array
            const productsResponse: ProductResponse = {
                success: true,
                message: 'Products retrieved successfully',
                data: products,
            };

            mockProductService.GetProducts.mockResolvedValue(productsResponse);

            const result = await productController.GetProducts();

            expect(result).toEqual(productsResponse);
            expect(mockProductService.GetProducts).toHaveBeenCalled();
        });
    });

    describe('getProductById', () => {
        it('should return a product successfully', async () => {
            const productId = 1;
            const product = new Product(); // Mock product object
            const productResponse: ProductResponse = {
                success: true,
                message: 'Product retrieved successfully',
                data: product,
            };

            mockProductService.getProductById.mockResolvedValue(productResponse);

            const result = await productController.getProductById(productId);

            expect(result).toEqual(productResponse);
            expect(mockProductService.getProductById).toHaveBeenCalledWith(productId);
        });
    });

    describe('updateProduct', () => {
        it('should update a product successfully', async () => {
            const productId = 1;
            const quantity = 5; // New quantity
            const updatedProductResponse: ProductResponse = {
                success: true,
                message: 'Product updated successfully',
                data: new Product(), // Mock updated product object
            };

            mockProductService.updateProduct.mockResolvedValue(updatedProductResponse);

            const result = await productController.updateProduct(productId, quantity);

            expect(result).toEqual(updatedProductResponse);
            expect(mockProductService.updateProduct).toHaveBeenCalledWith(productId, quantity);
        });
    });

    describe('deleteProduct', () => {
        it('should delete a product successfully', async () => {
            const productId = 1;
            const deleteResponse: DeleteResponse = {
                success: true,
                message: 'Product deleted successfully',
            };

            mockProductService.deleteProduct.mockResolvedValue(deleteResponse);

            const result = await productController.deleteProduct(productId);

            expect(result).toEqual(deleteResponse);
            expect(mockProductService.deleteProduct).toHaveBeenCalledWith(productId);
        });
    });
});
