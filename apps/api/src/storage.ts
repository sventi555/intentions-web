import path from 'path';
import { storage } from './firebase';
import { ImageObj } from './utils/image';

export const uploadImage = async (
  storageDirName: string,
  img: ImageObj,
  opts?: {
    size?: number;
  },
) => {
  const bucket = storage.bucket();

  const imageId = crypto.randomUUID();
  const imageFilePath = path.join(storageDirName, `${imageId}.webp`);

  if (opts?.size) {
    img.resize(opts.size);
  }
  const imgBuffer = await img.toBuffer();

  await bucket.file(imageFilePath).save(imgBuffer);

  return imageFilePath;
};
