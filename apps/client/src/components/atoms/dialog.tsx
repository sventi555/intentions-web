import { DialogPanel, Dialog as HeadlessDialog } from '@headlessui/react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
import { PropsWithChildren } from 'react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  size: 'default' | 'fit';
}

export const Dialog: React.FC<PropsWithChildren<DialogProps>> = ({
  onClose,
  open,
  children,
  size = 'default',
}) => {
  return (
    <AnimatePresence>
      {open && (
        <HeadlessDialog
          static
          open={open}
          onClose={onClose}
          className="relative z-50"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20"
          ></motion.div>
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel
              as={motion.div}
              initial={{ opacity: 0, translateY: 5 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: 5 }}
              className={clsx(
                'flex max-w-[540px] flex-col overflow-hidden rounded-lg bg-white',
                size === 'default' && 'h-1/2 w-full',
              )}
            >
              {children}
            </DialogPanel>
          </div>
        </HeadlessDialog>
      )}
    </AnimatePresence>
  );
};
