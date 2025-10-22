import { getButtonStyle } from './button';

interface SubmitProps {
  label: string;
}

export const Submit: React.FC<SubmitProps> = (props) => {
  return (
    <input
      type="submit"
      value={props.label}
      className={getButtonStyle({ type: 'primary' })}
    />
  );
};
