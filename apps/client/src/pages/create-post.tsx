import { useState } from 'react';
import { Link, Redirect, useLocation } from 'wouter';
import { useIntentions } from '../hooks/intentions';
import { useCreatePost } from '../hooks/posts';
import { useAuthState } from '../state/auth';

export const CreatePost: React.FC = () => {
  const authUser = useAuthState().authUser;

  if (authUser == null) {
    throw new Error('Must be logged in to view create post page');
  }

  const { intentions } = useIntentions(authUser.uid);
  const [selectedIntentionId, setSelectedIntentionId] = useState<string | null>(
    null,
  );
  const [description, setDescription] = useState('');

  const createPost = useCreatePost();
  const [, setLocation] = useLocation();

  if (intentions == null) {
    return null;
  }

  if (intentions.length === 0) {
    return <Redirect to="/create/intention" />;
  }

  return (
    <div className="flex flex-col gap-1 p-1">
      <div className="flex flex-col">
        <label>Choose an intention:</label>
        <div className="flex gap-1">
          <select
            onChange={(e) => setSelectedIntentionId(e.target.value)}
            value={selectedIntentionId ?? undefined}
            className="grow rounded-sm border"
          >
            {intentions.map(({ id, data }) => (
              <option value={id} key={id}>
                {data.name}
              </option>
            ))}
          </select>
          <Link href="/create/intention" className="rounded-lg border px-2">
            +
          </Link>
        </div>
      </div>

      <div className="flex h-32 flex-col items-center justify-center rounded-sm border">
        <div>Select an image</div>
      </div>

      <textarea
        placeholder="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="h-24 rounded-sm border p-1"
      />

      <button
        onClick={() =>
          createPost({
            body: {
              intentionId: selectedIntentionId ?? intentions[0].id,
              description,
            },
          }).then(() => setLocation('/'))
        }
        className="rounded-sm bg-blue-200 p-1"
      >
        Create
      </button>
    </div>
  );
};
