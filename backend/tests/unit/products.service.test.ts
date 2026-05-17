import { DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient, Prisma } from '@prisma/client';
import { ProductsService } from '../../src/modules/products/products.service';
import { mockProduct, mockCategory } from '../helpers/factories';

const prismaMock = jest.requireMock('../../src/config/prisma').default as DeepMockProxy<PrismaClient>;

// Mock ImageService to avoid ImageKit calls in unit tests
jest.mock('../../src/modules/images/images.service', () => ({
  ImageService: jest.fn().mockImplementation(() => ({
    uploadImage: jest.fn(),
    deleteImage: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(() => {
    service = new ProductsService();
  });

  // ─── createProduct ─────────────────────────────────────────────────────────

  describe('createProduct', () => {
    it('should create a product when category exists', async () => {
      const category = mockCategory();
      const product = {
        ...mockProduct({ categoryId: category.id }),
        category: { id: category.id, name: category.name, description: category.description },
        images: [],
      };

      prismaMock.category.findUnique.mockResolvedValueOnce(category as any);
      prismaMock.product.create.mockResolvedValueOnce(product as any);

      const result = await service.createProduct({
        name: product.name,
        description: product.description,
        price: 99.99,
        categoryId: category.id,
      });

      expect(result.name).toBe(product.name);
      expect(prismaMock.product.create).toHaveBeenCalledTimes(1);
    });

    it('should throw NOT_FOUND when category does not exist', async () => {
      prismaMock.category.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.createProduct({
          name: 'Test',
          description: 'A test product description',
          price: 10,
          categoryId: 'nonexistent',
        }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  // ─── listProducts ──────────────────────────────────────────────────────────

  describe('listProducts', () => {
    it('should return paginated products', async () => {
      const products = [mockProduct(), mockProduct({ name: 'Product 2' })];
      prismaMock.product.findMany.mockResolvedValueOnce(products as any);
      prismaMock.product.count.mockResolvedValueOnce(2);

      const result = await service.listProducts({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.items).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should apply search filter', async () => {
      prismaMock.product.findMany.mockResolvedValueOnce([]);
      prismaMock.product.count.mockResolvedValueOnce(0);

      await service.listProducts({
        page: 1,
        limit: 10,
        search: 'laptop',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      const callArg = prismaMock.product.findMany.mock.calls[0][0] as any;
      expect(callArg.where.OR).toBeDefined();
    });

    it('should apply price range filter', async () => {
      prismaMock.product.findMany.mockResolvedValueOnce([]);
      prismaMock.product.count.mockResolvedValueOnce(0);

      await service.listProducts({
        page: 1,
        limit: 10,
        minPrice: 100,
        maxPrice: 500,
        sortBy: 'price',
        sortOrder: 'asc',
      });

      const callArg = prismaMock.product.findMany.mock.calls[0][0] as any;
      expect(callArg.where.price).toBeDefined();
    });
  });

  // ─── getProductById ────────────────────────────────────────────────────────

  describe('getProductById', () => {
    it('should return the product', async () => {
      const product = {
        ...mockProduct(),
        category: { id: 'cat1', name: 'Cat', description: null },
        images: [],
      };
      prismaMock.product.findUnique.mockResolvedValueOnce(product as any);

      const result = await service.getProductById(product.id);

      expect(result.id).toBe(product.id);
    });

    it('should throw NOT_FOUND for missing product', async () => {
      prismaMock.product.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.getProductById('nonexistent'),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  // ─── updateProduct ─────────────────────────────────────────────────────────

  describe('updateProduct', () => {
    it('should update a product', async () => {
      const product = mockProduct();
      const updatedProduct = {
        ...product,
        name: 'Updated',
        category: { id: 'cat1', name: 'Cat', description: null },
        images: [],
      };

      prismaMock.product.findUnique.mockResolvedValueOnce(product as any);
      prismaMock.product.update.mockResolvedValueOnce(updatedProduct as any);

      const result = await service.updateProduct(product.id, { name: 'Updated' });

      expect(result.name).toBe('Updated');
    });

    it('should throw NOT_FOUND when product does not exist', async () => {
      prismaMock.product.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.updateProduct('nonexistent', { name: 'X' }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should throw NOT_FOUND when new categoryId does not exist', async () => {
      const product = mockProduct();

      prismaMock.product.findUnique.mockResolvedValueOnce(product as any);
      prismaMock.category.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.updateProduct(product.id, { categoryId: 'nonexistent-cat' }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  // ─── deleteProduct ─────────────────────────────────────────────────────────

  describe('deleteProduct', () => {
    it('should delete a product and its images', async () => {
      const product = {
        ...mockProduct(),
        images: [{ fileId: 'ik_file_123' }, { fileId: null }],
      };

      prismaMock.product.findUnique.mockResolvedValueOnce(product as any);
      prismaMock.product.delete.mockResolvedValueOnce(product as any);

      await expect(service.deleteProduct(product.id)).resolves.toBeUndefined();
      expect(prismaMock.product.delete).toHaveBeenCalledWith({ where: { id: product.id } });
    });

    it('should throw NOT_FOUND when product does not exist', async () => {
      prismaMock.product.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.deleteProduct('nonexistent'),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });
});
