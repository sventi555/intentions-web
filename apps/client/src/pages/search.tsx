export const Search: React.FC = () => {
  return (
    <div className="flex flex-col gap-1 p-1">
      <input placeholder="username" className="rounded-sm border p-1" />
      <button className="self-start rounded-sm bg-neutral-200 p-1">
        Send follow request
      </button>
    </div>
  );
};
