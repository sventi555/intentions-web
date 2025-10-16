import { Link, Redirect } from 'wouter';
import { useIntentions } from '../hooks/intentions';
import { useAuthState } from '../state/auth';

export const CreatePost: React.FC = () => {
  const authUser = useAuthState().authUser;
  if (authUser == null) {
    throw new Error('Must be logged in to view create post page');
  }

  const { intentions } = useIntentions(authUser.uid);
  console.log(intentions);

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
        <select>
          {intentions.map((intention) => (
            <option>{intention.data.name}</option>
          ))}
        </select>
        <Link href="/create/intention">Add intention</Link>
      </div>

      <div className="flex h-32 flex-col items-center justify-center rounded-sm border">
        <div>Select an image</div>
      </div>

      <textarea placeholder="description" className="rounded-sm border p-1" />

      <button className="rounded-sm bg-blue-200 p-1">Create</button>
    </div>
  );
};
