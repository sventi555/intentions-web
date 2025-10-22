import { clsx } from 'clsx';
import { PropsWithChildren } from 'react';

interface ButtonProps {
  type: 'primary' | 'secondary';
  onClick: () => void;
  disabled?: boolean;
}

export const Button: React.FC<PropsWithChildren<ButtonProps>> = (props) => {
  return (
    <button
      onClick={props.onClick}
      disabled={props.disabled}
      className={getButtonStyle(props)}
    >
      {props.children}
    </button>
  );
};

export const getButtonStyle = ({
  type,
  disabled,
}: Pick<ButtonProps, 'type' | 'disabled'>) => {
  return clsx(
    'rounded-sm p-1',
    type === 'primary' && !disabled && 'bg-blue-200 hover:bg-blue-300',
    type === 'secondary' && !disabled && 'bg-neutral-200 hover:bg-neutral-300',
    !disabled && 'cursor-pointer',
    disabled && 'bg-neutral-100 text-neutral-500',
  );
};
