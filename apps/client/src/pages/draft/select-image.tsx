import { ImagePicker } from '@/components/atoms/image-picker';
import { Close, Image, Swap } from '@/components/icons';
import { StickyHeader } from '@/components/sticky-header';
import { useDraftPostContext } from '@/state/draft';
import { useRef } from 'react';
import { Redirect, useLocation } from 'wouter';
import { ProgressButtons } from './progress-buttons';

export const SelectImage: React.FC = () => {
  const [, navigate] = useLocation();
  const filePickerRef = useRef<HTMLInputElement | null>(null);
  const { intention, base64Img, setBase64Img } = useDraftPostContext();

  if (!intention) {
    return <Redirect to="~/draft/select-intention" />;
  }

  return (
    <div>
      <StickyHeader>
        <div className="text-center">Select an image (optional)</div>
      </StickyHeader>
      <div className="flex flex-col gap-[40px] p-4">
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
          <div className="flex flex-col gap-2">
            <img src={base64Img} className="w-full" />
            <div className="flex justify-center gap-2 px-20">
              <button
                type="button"
                onClick={() => filePickerRef.current?.click()}
                className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-xl border p-1"
              >
                <Swap className="size-[16px]" />
                Change
              </button>
              <button
                className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-xl border p-1"
                onClick={() => {
                  setBase64Img('');
                }}
              >
                <Close className="size-[16px]" />
                Remove
              </button>
            </div>
          </div>
        )}
        <ProgressButtons
          primary={{
            label: 'Next',
            onClick: () => navigate('~/draft/create-post'),
          }}
          secondary={{
            label: 'Back',
            onClick: () => navigate('~/draft/select-intention'),
          }}
        />
      </div>
    </div>
  );
};
