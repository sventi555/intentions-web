import mime from 'mime-types';
import sharp, { type Sharp } from 'sharp';

export class ImageObj {
  private _sharp: Sharp;

  private static validate(dataUrl: string) {
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
  }

  constructor(dataUrl: string, size?: number) {
    ImageObj.validate(dataUrl);

    const [, image] = splitDataUrl(dataUrl);

    // bake in exif rotation with call to `.rotate()`
    this._sharp = sharp(Buffer.from(image, 'base64')).rotate();

    if (size != null) {
      this._sharp.resize(size);
    }
  }

  async toBuffer() {
    return this._sharp.webp().toBuffer();
  }

  async dimensions() {
    const metadata = await this._sharp.metadata();

    return { width: metadata.width, height: metadata.height };
  }
}

const splitDataUrl = (dataUrl: string) => {
  const commaIndex = dataUrl.indexOf(',');

  return [dataUrl.substring(0, commaIndex), dataUrl.substring(commaIndex + 1)];
};
