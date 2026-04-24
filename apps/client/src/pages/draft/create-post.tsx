import { Redirect, useLocation } from 'wouter';

import { Button } from '@/components/atoms/button';
import { TextArea } from '@/components/atoms/text-area';
import { PageHeader } from '@/components/page-header';
import { useIntention } from '@/hooks/intentions';
import { useDraftPostContext } from '@/state/draft';

export const CreatePost: React.FC = () => {
  const {
    intentionId,
    base64Img,
    formErrors,
    registerDescription,
    onSubmit,
    isSubmitting,
  } = useDraftPostContext();

  const [, navigate] = useLocation();

  const { intention } = useIntention(intentionId ?? undefined);

  if (intentionId == null) {
    return <Redirect to="~/draft" replace={true} />;
  }

  return (
    <div>
      <PageHeader title="Create a post" subtitle="Review and submit" />

      <form onSubmit={onSubmit} className="flex flex-col gap-4 p-4 pb-[80px]">
        <div className="mx-4 flex flex-col gap-2 rounded-2xl border-[1.5px] border-neutral-400 p-4 shadow">
          <div className="min-w-[60px] self-start rounded-4xl border border-neutral-300 p-1 px-2 text-center">
            {intention?.name}
          </div>

          {base64Img && <img src={base64Img} className="rounded-2xl" />}

          <TextArea
            placeholder="description"
            errorMessage={
              formErrors.description && 'description or image is required'
            }
            formRegister={registerDescription}
          />
        </div>

        <div className="flex gap-2">
          <div className="flex grow flex-col">
            <Button
              type="secondary"
              onClick={() => navigate('~/draft/image', { replace: true })}
            >
              Prev
            </Button>
          </div>
          <div className="flex grow flex-col">
            <Button type="submit" loading={isSubmitting}>
              Post
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
