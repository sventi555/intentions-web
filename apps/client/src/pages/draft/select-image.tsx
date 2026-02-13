import { Button } from '@/components/atoms/button';
import { useLocation } from 'wouter';

export const SelectImage: React.FC = () => {
  const [, navigate] = useLocation();

  return (
    <div>
      <div>Select image</div>
      <Button
        type="secondary"
        onClick={() => navigate('~/draft/select-intention')}
      >
        Back
      </Button>
      <Button type="primary" onClick={() => navigate('~/draft/create-post')}>
        Next
      </Button>
    </div>
  );
};
