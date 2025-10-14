export const CreatePost: React.FC = () => {
  return (
    <div className="flex flex-col gap-1 p-1">
      <div className="flex flex-col">
        <label>Choose an intention:</label>
        <select>
          <option>intention 1</option>
          <option>intention 2</option>
          <option>intention 3</option>
        </select>
      </div>

      <div className="flex h-32 flex-col items-center justify-center rounded-sm border">
        <div>Select an image</div>
      </div>

      <textarea placeholder="description" className="rounded-sm border p-1" />

      <button className="rounded-sm bg-blue-200 p-1">Create</button>
    </div>
  );
};
