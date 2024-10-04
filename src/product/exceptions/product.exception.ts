import { HttpException, HttpStatus } from '@nestjs/common';

export class ProductNotFoundException extends HttpException {
    constructor(id: number) {
        super(`Product with ID ${id} not found`, HttpStatus.NOT_FOUND);
    }
}

export class InsufficientStockException extends HttpException {
    constructor() {
        super('Insufficient stock', HttpStatus.BAD_REQUEST);
    }
}

export class ProductCreationException extends HttpException {
    constructor() {
        super('Failed to create product', HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
export class ProductUpdateException extends HttpException {
    constructor() {
        super('Failed to update product', HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
