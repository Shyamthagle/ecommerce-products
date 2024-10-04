import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { Product } from './entity/product.entity';
import { ProductNotFoundException, InsufficientStockException, ProductCreationException, ProductUpdateException } from './exceptions/product.exception';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ProductService', () => {
    let productService: ProductService;
    let productRepository: Repository<Product>;

    const mockProductRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOneBy: jest.fn(),
        findOne: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductService,
                {
                    provide: getRepositoryToken(Product),
                    useValue: mockProductRepository,
                },
            ],
        }).compile();

        productService = module.get<ProductService>(ProductService);
        productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
    });

    it('should be defined', () => {
        expect(productService).toBeDefined();
    });

    describe('createProduct', () => {
        it('should create a product successfully', async () => {
            const product = new Product(); // Mock product object
            const createdProductResponse = {
                success: true,
                message: "Product saved successfully",
                data: product,
            };

            mockProductRepository.create.mockReturnValue(product);
            mockProductRepository.save.mockResolvedValue(product);

            const result = await productService.createProduct(product);

            expect(result).toEqual(createdProductResponse);
            expect(mockProductRepository.create).toHaveBeenCalledWith(product);
            expect(mockProductRepository.save).toHaveBeenCalledWith(product);
        });

        it('should throw a ProductCreationException on error', async () => {
            const product = new Product();

            mockProductRepository.create.mockReturnValue(product);
            mockProductRepository.save.mockRejectedValue(new Error('Some error'));

            await expect(productService.createProduct(product)).rejects.toThrow(ProductCreationException);
        });
    });

    describe('GetProducts', () => {
        it('should return an array of products successfully', async () => {
            const products = [new Product(), new Product()]; // Mock product array
            const productsResponse = {
                success: true,
                message: "Products retrieved successfully",
                data: products,
            };

            mockProductRepository.find.mockResolvedValue(products);

            const result = await productService.GetProducts();

            expect(result).toEqual(productsResponse);
            expect(mockProductRepository.find).toHaveBeenCalled();
        });

        it('should throw an error on failure', async () => {
            mockProductRepository.find.mockRejectedValue(new Error('Some error'));

            await expect(productService.GetProducts()).rejects.toThrow(Error);
        });
    });

    describe('getProductById', () => {
        it('should return a product successfully', async () => {
            const productId = 1;
            const product = new Product(); // Mock product object
            mockProductRepository.findOneBy.mockResolvedValue(product);

            const result = await productService.getProductById(productId);

            expect(result).toEqual({
                success: true,
                message: "Product retrieved successfully",
                data: product,
            });
            expect(mockProductRepository.findOneBy).toHaveBeenCalledWith({ id: productId });
        });

        it('should throw a ProductNotFoundException if product does not exist', async () => {
            const productId = 1;
            mockProductRepository.findOneBy.mockResolvedValue(null);

            await expect(productService.getProductById(productId)).rejects.toThrow(ProductNotFoundException);
        });
    });

    describe('updateProduct', () => {
        it('should update a product successfully', async () => {
            const productId = 1;
            const quantity = 5; // Quantity to update
            const product = new Product();
            product.stock = 10; // Initial stock

            mockProductRepository.findOne.mockResolvedValue(product);
            mockProductRepository.save.mockResolvedValue(product);

            const result = await productService.updateProduct(productId, quantity);

            expect(result).toEqual({
                success: true,
                message: "Product updated successfully",
                data: product,
            });
            expect(product.stock).toBe(5); // Stock should be updated
            expect(mockProductRepository.findOne).toHaveBeenCalledWith({ where: { id: productId } });
            expect(mockProductRepository.save).toHaveBeenCalledWith(product);
        });

        it('should throw an InsufficientStockException if not enough stock', async () => {
            const productId = 1;
            const quantity = 15; // Quantity to update
            const product = new Product();
            product.stock = 10; // Initial stock

            mockProductRepository.findOne.mockResolvedValue(product);

            await expect(productService.updateProduct(productId, quantity)).rejects.toThrow(InsufficientStockException);
        });

        it('should throw a ProductNotFoundException if product does not exist', async () => {
            const productId = 1;
            const quantity = 5;

            mockProductRepository.findOne.mockResolvedValue(null);

            await expect(productService.updateProduct(productId, quantity)).rejects.toThrow(ProductNotFoundException);
        });

        it('should throw a ProductUpdateException on error', async () => {
            const productId = 1;
            const quantity = 5;
            const product = new Product();
            product.stock = 10; // Initial stock

            mockProductRepository.findOne.mockResolvedValue(product);
            mockProductRepository.save.mockRejectedValue(new Error('Some error'));

            await expect(productService.updateProduct(productId, quantity)).rejects.toThrow(ProductUpdateException);
        });
    });

    describe('deleteProduct', () => {
        it('should delete a product successfully', async () => {
            const productId = 1;
            const product = new Product();

            mockProductRepository.findOne.mockResolvedValue(product);
            mockProductRepository.remove.mockResolvedValue(product);

            const result = await productService.deleteProduct(productId);

            expect(result).toEqual({
                success: true,
                message: "Product deleted successfully",
            });
            expect(mockProductRepository.findOne).toHaveBeenCalledWith({ where: { id: productId } });
            expect(mockProductRepository.remove).toHaveBeenCalledWith(product);
        });

        it('should throw a ProductNotFoundException if product does not exist', async () => {
            const productId = 1;
            mockProductRepository.findOne.mockResolvedValue(null);

            await expect(productService.deleteProduct(productId)).rejects.toThrow(ProductNotFoundException);
        });

        it('should throw a ProductNotFoundException on error', async () => {
            const productId = 1;
            const product = new Product();

            mockProductRepository.findOne.mockResolvedValue(product);
            mockProductRepository.remove.mockRejectedValue(new Error('Some error'));

            await expect(productService.deleteProduct(productId)).rejects.toThrow(ProductNotFoundException);
        });
    });
});
