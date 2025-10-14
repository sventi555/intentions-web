import { useQuery } from '@tanstack/react-query';

export const useDownloadUrl = (storagePath?: string) => {
  const {
    data: downloadUrl,
    isLoading,
    isError,
  } = useQuery({
    enabled: storagePath != null,
    queryKey: ['download-url', storagePath],
    queryFn: async () => {
      return 'https://placehold.co/480x480/png';
    },
  });

  return { downloadUrl, isLoading, isError };
};
