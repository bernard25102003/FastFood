import { Request, Response } from 'express';
import { CategoriesService } from './categories.service';
import { sendSuccess, sendCreated, sendNoContent } from '../../middleware/responseHandler';

const categoriesService = new CategoriesService();

export class CategoriesController {
  async listCategories(_req: Request, res: Response): Promise<void> {
    const categories = await categoriesService.listCategories();
    sendSuccess(res, categories, 'Categories retrieved');
  }

  async getCategoryById(req: Request, res: Response): Promise<void> {
    const category = await categoriesService.getCategoryById(req.params.categoryId);
    sendSuccess(res, category, 'Category retrieved');
  }

  async createCategory(req: Request, res: Response): Promise<void> {
    const category = await categoriesService.createCategory(req.body);
    sendCreated(res, category, 'Category created');
  }

  async updateCategory(req: Request, res: Response): Promise<void> {
    const category = await categoriesService.updateCategory(req.params.categoryId, req.body);
    sendSuccess(res, category, 'Category updated');
  }

  async deleteCategory(req: Request, res: Response): Promise<void> {
    await categoriesService.deleteCategory(req.params.categoryId);
    sendNoContent(res);
  }
}
