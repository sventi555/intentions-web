import { Button } from '@/components/atoms/button';

export const CreatePost: React.FC = () => {
  return (
    <div>
      <div>Select image</div>
      <Button type="secondary" onClick={() => history.back()}>
        Back
      </Button>
      <Button type="primary" onClick={() => {}}>
        Post
      </Button>
    </div>
  );
};
