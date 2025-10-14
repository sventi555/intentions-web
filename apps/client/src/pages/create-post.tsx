import { useQuery } from '@tanstack/react-query';
import { Link, Redirect } from 'wouter';

export const CreatePost: React.FC = () => {
  const authUserId = 'temp';
  const { data: intentions } = useQuery({
    enabled: authUserId != null,
    queryKey: ['intentions', { authorId: authUserId }],
    queryFn: () => [1, 2, 3],
  });

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
          {intentions.map((i) => (
            <option>intention {i}</option>
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
