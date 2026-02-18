import { Button } from '@/components/atoms/button';

interface ProgressButtonsProps {
  primary: {
    label: string;
    onClick: () => void;
  };
  secondary: {
    label: string;
    onClick: () => void;
  };
}

export const ProgressButtons: React.FC<ProgressButtonsProps> = (props) => {
  return (
    <div className="flex gap-2">
      <div className="flex grow flex-col">
        <Button type="secondary" onClick={props.secondary.onClick}>
          {props.secondary.label}
        </Button>
      </div>
      <div className="flex grow flex-col">
        <Button type="primary" onClick={props.primary.onClick}>
          {props.primary.label}
        </Button>
      </div>
    </div>
  );
};
