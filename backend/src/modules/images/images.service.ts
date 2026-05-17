import { getImageKit } from '../../config/imagekit';
import { createBusinessError } from '../../types/error';

export interface UploadResult {
  fileId: string;
  url: string;
  thumbnailUrl: string;
  name: string;
  size: number;
  width?: number;
  height?: number;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export class ImageService {
  async uploadImage(file: Express.Multer.File, folder = 'products'): Promise<UploadResult> {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw createBusinessError(
        `Invalid file type: ${file.mimetype}. Allowed: jpeg, png, webp, gif`,
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw createBusinessError('File size exceeds 5MB limit');
    }

    const imagekit = getImageKit();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    try {
      result = await imagekit.upload({
        file: file.buffer,
        fileName: file.originalname,
        folder: `/${folder}`,
        isPrivateFile: false,
        useUniqueFileName: true,
      });
    } catch (err) {
      throw createBusinessError('Image upload failed. Please try again.');
    }

    return {
      fileId: result.fileId,
      url: result.url,
      thumbnailUrl: this.buildThumbnailUrl(result.url),
      name: result.name,
      size: result.size,
      width: result.width,
      height: result.height,
    };
  }

  async deleteImage(fileId: string): Promise<void> {
    const imagekit = getImageKit();
    try {
      await imagekit.deleteFile(fileId);
    } catch {
      // Non-fatal: log but do not throw — image may already be deleted
    }
  }

  private buildThumbnailUrl(originalUrl: string): string {
    // ImageKit URL transformation: 200x200, center crop, auto quality
    return `${originalUrl}?tr=w-200,h-200,c-at,q-80`;
  }
}
