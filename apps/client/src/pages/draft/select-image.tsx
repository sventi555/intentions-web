import { Button } from '@/components/atoms/button';
import { ImagePicker } from '@/components/atoms/image-picker';
import { Close, Swap } from '@/components/icons';
import { PageHeader } from '@/components/page-header';
import { useDraftPostContext } from '@/state/draft';
import { useRef } from 'react';
import { Redirect, useLocation } from 'wouter';

export const SelectImage: React.FC = () => {
  const { intentionId, base64Img, setBase64Img } = useDraftPostContext();
  const [, navigate] = useLocation();

  const filePickerRef = useRef<HTMLInputElement | null>(null);

  if (intentionId == null) {
    return <Redirect to="~/draft" replace={true} />;
  }

  return (
    <div>
      <PageHeader title="Create a post" subtitle="Select an image (optional)" />

      <div className="flex flex-col gap-4 p-4">
        <div className="flex gap-2">
          <div className="flex grow flex-col">
            <Button
              type="secondary"
              onClick={() => navigate('~/draft/intention', { replace: true })}
            >
              Prev
            </Button>
          </div>
          <div className="flex grow flex-col">
            <Button
              type="primary"
              onClick={() => navigate('~/draft/review', { replace: true })}
            >
              Next
            </Button>
          </div>
        </div>

        <ImagePicker onPick={setBase64Img} ref={filePickerRef} />

        {!base64Img ? (
          <button
            type="button"
            onClick={() => filePickerRef.current?.click()}
            className="flex aspect-square w-3/4 cursor-pointer flex-col items-center justify-center self-center rounded-2xl border border-neutral-300"
          >
            <div className="text-neutral-600">Select an image</div>
            <div className="text-sm text-neutral-600">(Optional)</div>
          </button>
        ) : (
          <div className="relative mx-4">
            <img src={base64Img} className="w-full rounded-2xl" />
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                type="button"
                onClick={() => filePickerRef.current?.click()}
                className="cursor-pointer rounded-full border-[1.5px] border-white bg-black p-1 text-white opacity-70"
              >
                <Swap />
              </button>
              <button
                type="button"
                onClick={() => setBase64Img('')}
                className="cursor-pointer rounded-full border-[1.5px] border-black bg-red-600 p-1 text-white opacity-70"
              >
                <Close />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
