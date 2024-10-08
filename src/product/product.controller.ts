import { Controller, Get, Post, Body, Param, Delete, Patch, ParseIntPipe } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './entity/product.entity';
import { DeleteResponse, ProductResponse } from './interface/product.interface';

@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService,
    ) { }

    @Post()
    createProduct(@Body() product: Product): Promise<ProductResponse> {
        return this.productService.createProduct(product);
    }

    @Get()
    getProducts(): Promise<ProductResponse> {
        return this.productService.getProducts();
    }

    @Get(':id')
    getProductById(@Param('id', ParseIntPipe) id: number): Promise<ProductResponse> {
        return this.productService.getProductById(id);
    }

    @Patch(':id')
    async updateProduct(
        @Param('id', ParseIntPipe) id: number,
        @Body('quantity') quantity: number
    ): Promise<ProductResponse> {
        return this.productService.updateProduct(id, quantity);
    }

    @Delete(':id')
    deleteProduct(@Param('id', ParseIntPipe) id: number): Promise<DeleteResponse> {
        return this.productService.deleteProduct(id);
    }
}


