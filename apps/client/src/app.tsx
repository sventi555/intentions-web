import { useQuery } from '@tanstack/react-query';
import { GetGreetingsQuery, GetGreetingsReturn } from 'lib';

const App: React.FC = () => {
  const { data: greeting } = useQuery({
    queryKey: [],
    queryFn: async () => {
      const query: GetGreetingsQuery = { name: 'World' };
      const greetingRes = await fetch(
        `${import.meta.env.VITE_API_HOST}/api/greetings?${new URLSearchParams(query).toString()}`,
      );
      if (!greetingRes.ok) {
        throw new Error();
      }
      return (await greetingRes.json()) as GetGreetingsReturn;
    },
  });

  return <div className="text-lg">{greeting}</div>;
};

export default App;
