import { Button } from '@/components/atoms/button';
import { ImagePicker } from '@/components/atoms/image-picker';
import { Image } from '@/components/icons';
import { StickyHeader } from '@/components/sticky-header';
import { useDraftPostContext } from '@/state/draft';
import { useRef } from 'react';
import { Redirect, useLocation } from 'wouter';

export const SelectImage: React.FC = () => {
  const [, navigate] = useLocation();
  const filePickerRef = useRef<HTMLInputElement | null>(null);
  const { intentionId, base64Img, setBase64Img } = useDraftPostContext();

  if (!intentionId) {
    return <Redirect to="~/draft/select-intention" />;
  }

  return (
    <div>
      <StickyHeader>
        <div className="text-center">Select an image (optional)</div>
      </StickyHeader>
      <div className="flex flex-col items-stretch gap-4 p-4">
        <ImagePicker onPick={setBase64Img} ref={filePickerRef} />

        {!base64Img ? (
          <button
            type="button"
            onClick={() => filePickerRef.current?.click()}
            className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-sm border border-neutral-300"
          >
            <Image className="size-[80px] stroke-1 text-neutral-600" />
          </button>
        ) : (
          <div className="relative">
            <img src={base64Img} className="w-full" />
            <button
              type="button"
              onClick={() => filePickerRef.current?.click()}
              className="absolute right-2 bottom-2 left-2 cursor-pointer rounded-sm bg-black/40 p-1 text-white"
            >
              Change image
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <div className="flex grow flex-col">
            <Button
              type="secondary"
              onClick={() => navigate('~/draft/select-intention')}
            >
              Back
            </Button>
          </div>
          <div className="flex grow flex-col">
            <Button
              type="primary"
              onClick={() => navigate('~/draft/create-post')}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
