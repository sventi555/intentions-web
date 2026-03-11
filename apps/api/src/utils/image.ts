import mime from 'mime-types';
import sharp from 'sharp';

export const toBuffer = async (imageDataUrl: string, size?: number) => {
  validate(imageDataUrl);

  const [, image] = splitDataUrl(imageDataUrl);

  // bake in exif rotation with call to `.rotate()`
  const s = sharp(Buffer.from(image, 'base64')).rotate();

  if (size != null) {
    s.resize(size);
  }

  const res = await s.webp().toBuffer({ resolveWithObject: true });
  return { buffer: res.data, info: res.info };
};

const validate = (dataUrl: string) => {
  const [imageMeta] = splitDataUrl(dataUrl);

  // i.e. 'image/jpeg'
  const contentType = imageMeta.match(/data:(.*);base64/)?.[1];
  if (!contentType) {
    throw new Error('missing mime type');
  }

  // i.e. 'jpeg'
  const extension = mime.extension(contentType);
  if (!extension) {
    throw new Error('invalid mime type');
  }

  // i.e. 'image'
  const [mimeType] = contentType.split('/');
  if (mimeType !== 'image') {
    throw new Error(`must be an image`);
  }
};

const splitDataUrl = (dataUrl: string) => {
  const commaIndex = dataUrl.indexOf(',');

  return [dataUrl.substring(0, commaIndex), dataUrl.substring(commaIndex + 1)];
};
