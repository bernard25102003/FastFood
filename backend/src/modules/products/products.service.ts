import { Prisma } from '@prisma/client';
import prisma from '../../config/prisma';
import {
  createNotFoundError,
  createBusinessError,
} from '../../types/error';
import { paginate, getSkip } from '../../utils/helpers';
import { ImageService } from '../images/images.service';

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  categoryId: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
}

export interface ListProductsQuery {
  page: number;
  limit: number;
  search?: string;
  categoryId?: string;
  sortBy: 'price' | 'soldCount' | 'avgRating' | 'createdAt';
  sortOrder: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
}

const PRODUCT_LIST_SELECT = {
  id: true,
  name: true,
  description: true,
  price: true,
  categoryId: true,
  soldCount: true,
  avgRating: true,
  reviewCount: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, name: true } },
  images: {
    orderBy: { displayOrder: 'asc' as const },
    take: 1,
    select: { id: true, imageUrl: true, thumbnailUrl: true, displayOrder: true },
  },
} as const;

const PRODUCT_DETAIL_SELECT = {
  id: true,
  name: true,
  description: true,
  price: true,
  categoryId: true,
  soldCount: true,
  avgRating: true,
  reviewCount: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, name: true, description: true } },
  images: {
    orderBy: { displayOrder: 'asc' as const },
    select: { id: true, imageUrl: true, thumbnailUrl: true, displayOrder: true },
  },
} as const;

export class ProductsService {
  private imageService = new ImageService();

  // ─── Create ───────────────────────────────────────────────────────────────

  async createProduct(dto: CreateProductDto) {
    const category = await prisma.category.findUnique({ where: { id: dto.categoryId } });
    if (!category) {
      throw createNotFoundError('Category');
    }

    return prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: new Prisma.Decimal(dto.price),
        categoryId: dto.categoryId,
      },
      select: PRODUCT_DETAIL_SELECT,
    });
  }

  // ─── Read ─────────────────────────────────────────────────────────────────

  async listProducts(query: ListProductsQuery) {
    const { page, limit, search, categoryId, sortBy, sortOrder, minPrice, maxPrice } = query;
    const skip = getSkip(page, limit);

    const where: Prisma.ProductWhereInput = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = new Prisma.Decimal(minPrice);
      if (maxPrice !== undefined) where.price.lte = new Prisma.Decimal(maxPrice);
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = { [sortBy]: sortOrder };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: PRODUCT_LIST_SELECT,
      }),
      prisma.product.count({ where }),
    ]);

    return paginate(products, total, page, limit);
  }

  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      select: PRODUCT_DETAIL_SELECT,
    });

    if (!product) {
      throw createNotFoundError('Product');
    }

    return product;
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  async updateProduct(id: string, dto: UpdateProductDto) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw createNotFoundError('Product');
    }

    if (dto.categoryId && dto.categoryId !== product.categoryId) {
      const category = await prisma.category.findUnique({ where: { id: dto.categoryId } });
      if (!category) {
        throw createNotFoundError('Category');
      }
    }

    const updateData: Prisma.ProductUpdateInput = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.price !== undefined) updateData.price = new Prisma.Decimal(dto.price);
    if (dto.categoryId !== undefined) updateData.category = { connect: { id: dto.categoryId } };

    return prisma.product.update({
      where: { id },
      data: updateData,
      select: PRODUCT_DETAIL_SELECT,
    });
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  async deleteProduct(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: { select: { fileId: true } } },
    });

    if (!product) {
      throw createNotFoundError('Product');
    }

    // Delete images from ImageKit (non-fatal)
    await Promise.allSettled(
      product.images
        .filter((img) => img.fileId)
        .map((img) => this.imageService.deleteImage(img.fileId!)),
    );

    await prisma.product.delete({ where: { id } });
  }

  // ─── Images ───────────────────────────────────────────────────────────────

  async addProductImages(
    productId: string,
    uploadedImages: { fileId: string; url: string; thumbnailUrl: string }[],
  ) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw createNotFoundError('Product');
    }

    // Get current max displayOrder
    const maxOrder = await prisma.productImage.aggregate({
      where: { productId },
      _max: { displayOrder: true },
    });
    const startOrder = (maxOrder._max.displayOrder ?? -1) + 1;

    const images = await prisma.$transaction(
      uploadedImages.map((img, idx) =>
        prisma.productImage.create({
          data: {
            productId,
            imageUrl: img.url,
            thumbnailUrl: img.thumbnailUrl,
            fileId: img.fileId,
            displayOrder: startOrder + idx,
          },
        }),
      ),
    );

    return images;
  }

  async deleteProductImage(productId: string, imageId: string) {
    const image = await prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });

    if (!image) {
      throw createNotFoundError('Product image');
    }

    // Delete from ImageKit (non-fatal)
    if (image.fileId) {
      await this.imageService.deleteImage(image.fileId);
    }

    await prisma.productImage.delete({ where: { id: imageId } });
  }

  async reorderProductImages(productId: string, orderedImageIds: string[]) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw createNotFoundError('Product');
    }

    const images = await prisma.productImage.findMany({ where: { productId } });
    const imageIds = new Set(images.map((img) => img.id));

    for (const id of orderedImageIds) {
      if (!imageIds.has(id)) {
        throw createBusinessError(`Image ${id} does not belong to this product`);
      }
    }

    await prisma.$transaction(
      orderedImageIds.map((id, idx) =>
        prisma.productImage.update({
          where: { id },
          data: { displayOrder: idx },
        }),
      ),
    );
  }

  // ─── Aggregations ─────────────────────────────────────────────────────────

  async recalculateProductStats(productId: string) {
    const [soldCountResult, reviewStats] = await Promise.all([
      prisma.orderItem.aggregate({
        where: { productId, order: { status: 'COMPLETED' } },
        _sum: { quantity: true },
      }),
      prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    const soldCount = soldCountResult._sum.quantity ?? 0;
    const avgRating = reviewStats._avg.rating
      ? new Prisma.Decimal(reviewStats._avg.rating).toDecimalPlaces(2)
      : new Prisma.Decimal(0);
    const reviewCount = reviewStats._count.rating;

    await prisma.product.update({
      where: { id: productId },
      data: { soldCount, avgRating, reviewCount },
    });
  }
}
