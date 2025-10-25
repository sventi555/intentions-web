import { HTTPException } from 'hono/http-exception';
import mime from 'mime-types';
import path from 'path';
import sharp from 'sharp';
import { storage } from './config';

/**
 * @storageDirName the bucket directory in which the file will be stored
 * @mediaBase64 a base64 encoded image (or video) prefixed by mime type
 */
export const uploadMedia = async (
  storageDirName: string,
  mediaBase64: string,
  opts?: {
    size?: number;
    validTypes?: ('image' | 'video')[];
  },
) => {
  const options = { validTypes: ['image', 'video'], ...opts };

  const [imageMeta, image] = mediaBase64.split(',');

  // i.e. 'image/jpeg'
  const contentType = imageMeta.match(/data:(.*);base64/)?.[1];
  if (!contentType) {
    throw new HTTPException(400, { message: 'missing mime type' });
  }

  // i.e. 'jpeg'
  const extension = mime.extension(contentType);
  if (!extension) {
    throw new HTTPException(400, { message: 'invalid mime type' });
  }

  // i.e. 'image'
  const [mimeType] = contentType.split('/');
  if (!(options.validTypes as string[]).includes(mimeType)) {
    throw new HTTPException(400, {
      message: `mime type must be one of [${options.validTypes.join(', ')}]`,
    });
  }

  const bucket = storage.bucket();

  const imageId = crypto.randomUUID();
  const imageFilePath = path.join(storageDirName, `${imageId}.webp`);

  let finalImageBuffer: Buffer;
  try {
    // remove the exif rotation and bake it into the image
    let processedImage = sharp(Buffer.from(image, 'base64')).rotate();
    if (opts?.size) {
      processedImage = processedImage.resize(opts.size);
    }
    finalImageBuffer = await processedImage.webp().toBuffer();
  } catch {
    throw new HTTPException(400, { message: 'image data is malformed' });
  }

  await bucket.file(imageFilePath).save(finalImageBuffer);

  return imageFilePath;
};
