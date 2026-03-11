import path from 'path';
import { storage } from './firebase';

export const uploadBuffer = async (
  storageDirName: string,
  buffer: Buffer,
  ext: string,
) => {
  const bucket = storage.bucket();

  const fileId = crypto.randomUUID();
  const filePath = path.join(storageDirName, `${fileId}.${ext}`);

  await bucket.file(filePath).save(buffer);

  return filePath;
};
