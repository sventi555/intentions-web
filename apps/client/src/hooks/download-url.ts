import { storage } from '@/firebase';
import { useQuery } from '@tanstack/react-query';
import { getDownloadURL, ref } from 'firebase/storage';

export const useDownloadUrl = (storagePath: string | undefined) => {
  const {
    data: downloadUrl,
    isLoading,
    isError,
  } = useQuery({
    enabled: storagePath != null,
    queryKey: ['download-url', storagePath],
    queryFn: async () => {
      const url = await getDownloadURL(ref(storage, storagePath));

      return url;
    },
  });

  return { downloadUrl, isLoading, isError };
};
