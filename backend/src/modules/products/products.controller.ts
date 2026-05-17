import { Request, Response } from 'express';
import multer from 'multer';
import { ProductsService } from './products.service';
import { ImageService } from '../images/images.service';
import { sendSuccess, sendCreated, sendNoContent } from '../../middleware/responseHandler';
import { createBusinessError } from '../../types/error';

const productsService = new ProductsService();
const imageService = new ImageService();

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export class ProductsController {
  // ─── Products ─────────────────────────────────────────────────────────────

  async listProducts(req: Request, res: Response): Promise<void> {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minPrice,
      maxPrice,
    } = req.query as Record<string, string>;

    const result = await productsService.listProducts({
      page: Math.max(1, Number(page)),
      limit: Math.min(100, Math.max(1, Number(limit))),
      search: search || undefined,
      categoryId: categoryId || undefined,
      sortBy: (sortBy as 'price' | 'soldCount' | 'avgRating' | 'createdAt') || 'createdAt',
      sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });

    sendSuccess(res, result, 'Products retrieved');
  }

  async getProductById(req: Request, res: Response): Promise<void> {
    const product = await productsService.getProductById(req.params.productId);
    sendSuccess(res, product, 'Product retrieved');
  }

  async createProduct(req: Request, res: Response): Promise<void> {
    const product = await productsService.createProduct(req.body);
    sendCreated(res, product, 'Product created');
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    const product = await productsService.updateProduct(req.params.productId, req.body);
    sendSuccess(res, product, 'Product updated');
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    await productsService.deleteProduct(req.params.productId);
    sendNoContent(res);
  }

  // ─── Product images ───────────────────────────────────────────────────────

  async uploadProductImages(req: Request, res: Response): Promise<void> {
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      throw createBusinessError('No image files provided');
    }

    // Upload all files to ImageKit
    const uploadedImages = await Promise.all(
      files.map((file) => imageService.uploadImage(file, 'products')),
    );

    // Associate with product
    const images = await productsService.addProductImages(
      req.params.productId,
      uploadedImages,
    );

    sendCreated(res, { images }, 'Images uploaded successfully');
  }

  async deleteProductImage(req: Request, res: Response): Promise<void> {
    await productsService.deleteProductImage(req.params.productId, req.params.imageId);
    sendNoContent(res);
  }

  async reorderProductImages(req: Request, res: Response): Promise<void> {
    const { imageIds } = req.body as { imageIds: string[] };
    await productsService.reorderProductImages(req.params.productId, imageIds);
    sendSuccess(res, null, 'Images reordered');
  }
}
