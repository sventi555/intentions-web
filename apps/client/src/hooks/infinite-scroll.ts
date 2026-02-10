import { useEffect } from 'react';
import { useThrottledCallback } from 'use-debounce';

export const useInfiniteScroll = ({
  fetchNextPage,
  isFetchingNextPage,
  hasNextPage,
  triggerDistance = 400,
}: {
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  triggerDistance?: number;
}) => {
  const throttledFetchPage = useThrottledCallback(fetchNextPage, 500);

  useEffect(() => {
    if (isFetchingNextPage || !hasNextPage) {
      return;
    }

    // in case page is too tall to scroll but still more pages to load
    if (distToBottom() < triggerDistance) {
      throttledFetchPage();
    }

    const onScroll = () => {
      if (distToBottom() < triggerDistance) throttledFetchPage();
    };

    document.addEventListener('scroll', onScroll);

    return () => document.removeEventListener('scroll', onScroll);
  }, [throttledFetchPage, isFetchingNextPage, hasNextPage, triggerDistance]);
};

const distToBottom = () =>
  document.body.scrollHeight - window.scrollY - window.innerHeight;
