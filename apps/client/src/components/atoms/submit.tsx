import { getButtonStyle } from '@/components/atoms/button';

interface SubmitProps {
  label: string;
  disabled?: boolean;
}

export const Submit: React.FC<SubmitProps> = (props) => {
  return (
    <input
      type="submit"
      disabled={props.disabled}
      value={props.label}
      className={getButtonStyle({ type: 'primary', disabled: props.disabled })}
    />
  );
};
