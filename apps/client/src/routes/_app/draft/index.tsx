import { Button } from '@/components/atoms/button';
import { Dialog } from '@/components/atoms/dialog';
import { DraftPostProvider, useDraftPostContext } from '@/state/draft';
import { createFileRoute, useBlocker } from '@tanstack/react-router';
import { CreateIntention } from './-create-intention';
import { CreatePost } from './-create-post';
import { SelectImage } from './-select-image';
import { SelectIntention } from './-select-intention';

const Draft: React.FC = () => {
  const { stage, intentionId, isSubmitting } = useDraftPostContext();

  const blockFn = () => {
    return !!intentionId && !isSubmitting;
  };

  const { proceed, reset, status } = useBlocker({
    shouldBlockFn: blockFn,
    enableBeforeUnload: blockFn,
    withResolver: true,
  });

  return (
    <>
      {stage === 'intention-select' && <SelectIntention />}
      {stage === 'intention-create' && <CreateIntention />}
      {stage === 'image' && <SelectImage />}
      {stage === 'review' && <CreatePost />}

      <Dialog open={status === 'blocked'} onClose={() => reset?.()} size="fit">
        <div className="flex grow flex-col gap-4 p-6">
          <div>Stop creating post and discard draft?</div>
          <div className="flex gap-2">
            <div className="flex grow flex-col">
              <Button type="secondary" onClick={reset}>
                Cancel
              </Button>
            </div>
            <div className="flex grow flex-col">
              <Button type="danger" onClick={proceed}>
                Discard
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

const DraftWrapper: React.FC = () => {
  return (
    <DraftPostProvider>
      <Draft />
    </DraftPostProvider>
  );
};

export const Route = createFileRoute('/_app/draft/')({
  component: DraftWrapper,
});
