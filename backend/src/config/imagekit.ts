// eslint-disable-next-line @typescript-eslint/no-require-imports
const ImageKit = require('imagekit');
import { env } from './env';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let imagekitInstance: any | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getImageKit = (): any => {
  if (!imagekitInstance) {
    if (!env.IMAGEKIT_PUBLIC_KEY || !env.IMAGEKIT_PRIVATE_KEY || !env.IMAGEKIT_URL_ENDPOINT) {
      throw new Error('ImageKit credentials are not configured');
    }
    imagekitInstance = new ImageKit({
      publicKey: env.IMAGEKIT_PUBLIC_KEY,
      privateKey: env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
    });
  }
  return imagekitInstance;
};
