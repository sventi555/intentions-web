import { Button } from '@/components/atoms/button';
import { TextArea } from '@/components/atoms/text-area';
import { StickyHeader } from '@/components/sticky-header';
import { useDraftPostContext } from '@/state/draft';
import { Redirect } from 'wouter';

export const CreatePost: React.FC = () => {
  const { intentionId, base64Img } = useDraftPostContext();

  if (!intentionId) {
    return <Redirect to="~/draft/select-intention" />;
  }

  return (
    <div>
      <StickyHeader>
        <div className="text-center">Create post</div>
      </StickyHeader>
      <div className="flex flex-col items-stretch gap-4 p-4">
        <div>
          <TextArea placeholder="Description..." />
        </div>

        <div className="flex gap-2">
          <div className="flex grow flex-col">
            <Button type="secondary" onClick={() => history.back()}>
              Back
            </Button>
          </div>
          <div className="flex grow flex-col">
            <Button type="primary" onClick={() => {}}>
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
