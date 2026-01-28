import sharp from 'sharp';

export const splitDataUrl = (dataUrl: string) => {
  const commaIndex = dataUrl.indexOf(',');

  return [dataUrl.substring(0, commaIndex), dataUrl.substring(commaIndex + 1)];
};

export const getImageDimensions = async (dataUrl: string) => {
  const [, image] = splitDataUrl(dataUrl);
  const buffer = Buffer.from(image, 'base64');

  const metadata = await sharp(buffer).metadata();

  return { width: metadata.width, height: metadata.height };
};
