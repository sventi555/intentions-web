import { getButtonStyle } from '@/components/atoms/button';
import { PropsWithChildren } from 'react';

interface SubmitProps {
  loading?: boolean;
  disabled?: boolean;
}

export const Submit: React.FC<PropsWithChildren<SubmitProps>> = (props) => {
  return (
    <button
      type="submit"
      disabled={props.disabled}
      className={getButtonStyle({ type: 'primary', disabled: props.disabled })}
    >
      {props.children}
    </button>
  );
};
