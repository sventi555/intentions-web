import { InputError } from '@/components/atoms/input-error';
import { TextArea } from '@/components/atoms/text-area';
import { StickyHeader } from '@/components/sticky-header';
import { useDraftPostContext } from '@/state/draft';
import { Redirect } from 'wouter';
import { ProgressButtons } from './progress-buttons';

export const CreatePost: React.FC = () => {
  const { intention, base64Img, onSubmit, formErrors, registerDescription } =
    useDraftPostContext();

  if (!intention) {
    return <Redirect to="~/draft/select-intention" />;
  }

  return (
    <div>
      <StickyHeader>
        <div className="text-center">Create post</div>
      </StickyHeader>
      <div className="flex flex-col gap-[40px] p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-4xl border border-neutral-300 p-1 px-2 whitespace-nowrap">
              {intention.name}
            </div>
            {base64Img && <img src={base64Img} className="w-1/2 rounded-2xl" />}
          </div>
          <div>
            <TextArea
              placeholder="Description..."
              formRegister={registerDescription}
            />
            {formErrors.description && (
              <InputError>{formErrors.description.message}</InputError>
            )}
          </div>
        </div>

        <ProgressButtons
          primary={{
            label: 'Post',
            onClick: onSubmit,
          }}
          secondary={{
            label: 'Back',
            onClick: () => history.back(),
          }}
        />
      </div>
    </div>
  );
};
