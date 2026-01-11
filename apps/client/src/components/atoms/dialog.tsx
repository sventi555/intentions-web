import { DialogPanel, Dialog as HeadlessDialog } from '@headlessui/react';
import { PropsWithChildren } from 'react';

interface DialogProps {
  onClose: () => void;
}

export const Dialog: React.FC<PropsWithChildren<DialogProps>> = ({
  onClose,
  children,
}) => {
  return (
    <HeadlessDialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 flex items-center justify-center bg-black/20 p-4">
        <DialogPanel className="flex h-1/2 w-full max-w-[540px] flex-col overflow-hidden rounded-lg bg-white">
          {children}
        </DialogPanel>
      </div>
    </HeadlessDialog>
  );
};
