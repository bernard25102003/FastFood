import prisma from '../../config/prisma';
import {
  createNotFoundError,
  createConflictError,
  createBusinessError,
} from '../../types/error';

export interface CreateCategoryDto {
  name: string;
  description?: string;
  icon?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  icon?: string;
}

export class CategoriesService {
  async createCategory(dto: CreateCategoryDto) {
    const existing = await prisma.category.findUnique({ where: { name: dto.name } });
    if (existing) {
      throw createConflictError('Category name already exists');
    }

    return prisma.category.create({ data: dto });
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw createNotFoundError('Category');
    }

    if (dto.name && dto.name !== existing.name) {
      const duplicate = await prisma.category.findUnique({ where: { name: dto.name } });
      if (duplicate) {
        throw createConflictError('Category name already exists');
      }
    }

    return prisma.category.update({ where: { id }, data: dto });
  }

  async deleteCategory(id: string) {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw createNotFoundError('Category');
    }

    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      throw createBusinessError(
        `Cannot delete category that contains ${productCount} product(s). Move or delete products first.`,
      );
    }

    await prisma.category.delete({ where: { id } });
  }

  async listCategories() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });
  }

  async getCategoryById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      throw createNotFoundError('Category');
    }

    return category;
  }
}
