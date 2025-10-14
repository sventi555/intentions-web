export const CreateIntention: React.FC = () => {
  return (
    <div className="flex flex-col gap-1 p-1">
      <input
        placeholder="eg. touch grass"
        className="rounded-sm border p-1 text-center"
      />
      <button className="rounded-sm bg-blue-200 p-1">Create intention</button>
    </div>
  );
};
