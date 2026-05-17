import { DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { CategoriesService } from '../../src/modules/categories/categories.service';
import { mockCategory } from '../helpers/factories';
import { ApiError } from '../../src/types/error';

const prismaMock = jest.requireMock('../../src/config/prisma').default as DeepMockProxy<PrismaClient>;

describe('CategoriesService', () => {
  let service: CategoriesService;

  beforeEach(() => {
    service = new CategoriesService();
  });

  // ─── createCategory ────────────────────────────────────────────────────────

  describe('createCategory', () => {
    it('should create and return a new category', async () => {
      const dto = { name: 'Electronics', description: 'Electronic devices' };
      const created = mockCategory(dto);

      prismaMock.category.findUnique.mockResolvedValueOnce(null);
      prismaMock.category.create.mockResolvedValueOnce(created as any);

      const result = await service.createCategory(dto);

      expect(result.name).toBe('Electronics');
      expect(prismaMock.category.create).toHaveBeenCalledWith({ data: dto });
    });

    it('should throw CONFLICT if name already exists', async () => {
      prismaMock.category.findUnique.mockResolvedValueOnce(mockCategory() as any);

      await expect(
        service.createCategory({ name: 'Test Category' }),
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  // ─── updateCategory ────────────────────────────────────────────────────────

  describe('updateCategory', () => {
    it('should update a category', async () => {
      const existing = mockCategory();
      const updated = { ...existing, name: 'Updated Name' };

      prismaMock.category.findUnique.mockResolvedValueOnce(existing as any);
      prismaMock.category.findUnique.mockResolvedValueOnce(null); // name uniqueness check
      prismaMock.category.update.mockResolvedValueOnce(updated as any);

      const result = await service.updateCategory(existing.id, { name: 'Updated Name' });

      expect(result.name).toBe('Updated Name');
    });

    it('should throw NOT_FOUND for missing category', async () => {
      prismaMock.category.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.updateCategory('nonexistent', { name: 'X' }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should throw CONFLICT when updating to a name that already exists', async () => {
      const existing = mockCategory({ name: 'Old Name' });
      const duplicate = mockCategory({ name: 'Taken Name' });

      prismaMock.category.findUnique.mockResolvedValueOnce(existing as any);
      prismaMock.category.findUnique.mockResolvedValueOnce(duplicate as any);

      await expect(
        service.updateCategory(existing.id, { name: 'Taken Name' }),
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  // ─── deleteCategory ────────────────────────────────────────────────────────

  describe('deleteCategory', () => {
    it('should delete a category with no products', async () => {
      const category = mockCategory();

      prismaMock.category.findUnique.mockResolvedValueOnce(category as any);
      prismaMock.product.count.mockResolvedValueOnce(0);
      prismaMock.category.delete.mockResolvedValueOnce(category as any);

      await expect(service.deleteCategory(category.id)).resolves.toBeUndefined();
    });

    it('should throw BUSINESS_RULE_VIOLATION when category has products', async () => {
      const category = mockCategory();

      prismaMock.category.findUnique.mockResolvedValueOnce(category as any);
      prismaMock.product.count.mockResolvedValueOnce(3);

      await expect(
        service.deleteCategory(category.id),
      ).rejects.toMatchObject({ statusCode: 422 });
    });

    it('should throw NOT_FOUND for missing category', async () => {
      prismaMock.category.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.deleteCategory('nonexistent'),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  // ─── listCategories ────────────────────────────────────────────────────────

  describe('listCategories', () => {
    it('should return a list of categories with product counts', async () => {
      const categories = [
        { ...mockCategory(), _count: { products: 5 } },
        { ...mockCategory({ name: 'Fashion' }), _count: { products: 10 } },
      ];
      prismaMock.category.findMany.mockResolvedValueOnce(categories as any);

      const result = await service.listCategories();

      expect(result).toHaveLength(2);
      expect(result[0]._count.products).toBe(5);
    });
  });

  // ─── getCategoryById ───────────────────────────────────────────────────────

  describe('getCategoryById', () => {
    it('should return the category', async () => {
      const category = { ...mockCategory(), _count: { products: 2 } };
      prismaMock.category.findUnique.mockResolvedValueOnce(category as any);

      const result = await service.getCategoryById(category.id);

      expect(result.id).toBe(category.id);
    });

    it('should throw NOT_FOUND for missing category', async () => {
      prismaMock.category.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.getCategoryById('nonexistent'),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });
});
