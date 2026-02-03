import { Loading } from '@/components/icons';
import { clsx } from 'clsx';
import { PropsWithChildren } from 'react';

interface ButtonProps {
  type: 'primary' | 'secondary' | 'submit';
  onClick?: () => void;
  loading?: boolean;
}

export const Button: React.FC<PropsWithChildren<ButtonProps>> = ({
  type,
  onClick,
  loading,
  children,
}) => {
  return (
    <button
      type={type === 'submit' ? 'submit' : 'button'}
      onClick={onClick}
      disabled={loading}
      className={clsx(
        'flex items-center justify-center gap-1 rounded-sm p-1',
        (type === 'primary' || type === 'submit') &&
          !loading &&
          'bg-[#2C3B4E] text-white',
        type === 'secondary' && !loading && 'bg-neutral-200',
        !loading && 'cursor-pointer',
        loading && 'bg-neutral-100 text-neutral-500',
      )}
    >
      {loading && <Loading className="size-[20px] animate-spin" />}
      {children}
    </button>
  );
};
