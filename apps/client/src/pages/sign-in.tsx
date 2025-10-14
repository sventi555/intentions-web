export const SignIn: React.FC = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center">
        <div className="text-3xl">Intentions</div>
        <div>act intentionally</div>
      </div>
      <div className="flex flex-col gap-1">
        <input placeholder="username" className="rounded-sm border p-1" />
        <input
          placeholder="password"
          type="password"
          className="rounded-sm border p-1"
        />
        <button className="rounded-sm bg-blue-200">Sign in</button>
      </div>
      <div>New user? Sign up</div>
    </div>
  );
};
