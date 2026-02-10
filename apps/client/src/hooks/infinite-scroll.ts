import { useEffect } from 'react';
import { useThrottledCallback } from 'use-debounce';

export const useInfiniteScroll = ({
  fetchNextPage,
  isFetchingNextPage,
  hasNextPage,
  triggerDistance = 400,
  container,
}: {
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  triggerDistance?: number;
  container?: HTMLElement | null;
}) => {
  const throttledFetchPage = useThrottledCallback(fetchNextPage, 500);

  useEffect(() => {
    if (isFetchingNextPage || !hasNextPage || container === null) {
      return;
    }

    const onScroll = () => {
      if (distToBottom(container) < triggerDistance) throttledFetchPage();
    };

    // in case element is too tall to scroll but still more pages to load
    onScroll();

    (container || document).addEventListener('scroll', onScroll);

    return () =>
      (container || document).removeEventListener('scroll', onScroll);
  }, [
    throttledFetchPage,
    isFetchingNextPage,
    hasNextPage,
    triggerDistance,
    container,
  ]);
};

const distToBottom = (e: HTMLElement | undefined) => {
  if (e) {
    return e.scrollHeight - e.scrollTop - e.clientHeight;
  }

  return document.body.scrollHeight - window.scrollY - window.innerHeight;
};
