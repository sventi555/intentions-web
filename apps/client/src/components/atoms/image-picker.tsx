import { forwardRef } from 'react';

interface ImagePickerProps {
  onPick: (dataUrl: string) => void;
}

export const ImagePicker = forwardRef<HTMLInputElement, ImagePickerProps>(
  (props, ref) => {
    return (
      <input
        type="file"
        accept="image/png, image/jpeg, image/webp"
        hidden={true}
        onChange={(e) => {
          const reader = new FileReader();
          const file = e.target.files?.[0];
          if (file == null) {
            return;
          }

          reader.readAsDataURL(file);
          reader.onload = (ev) => props.onPick(ev.target?.result as string);

          // Reset input value to support selecting same image repeatedly
          e.target.value = '';
        }}
        ref={ref}
      />
    );
  },
);
