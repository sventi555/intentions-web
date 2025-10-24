import { Post as _Post } from 'lib';
import { Fragment, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useThrottledCallback } from 'use-debounce';
import { Post } from './post';

interface PostsListProps {
  posts: { id: string; data: _Post }[];
  fetchNextPage: () => Promise<any>;
  fetchingPage: boolean;
  hasNextPage: boolean;
}

export const PostsList: React.FC<PostsListProps> = (props) => {
  const [ref, inView] = useInView();
  const throttledFetchPage = useThrottledCallback(props.fetchNextPage, 1000);

  useEffect(() => {
    if (props.fetchingPage || !props.hasNextPage || !inView) {
      return;
    }

    throttledFetchPage();
  }, [inView, props.fetchingPage, props.hasNextPage]);

  return (
    <div className="flex flex-col gap-1">
      {props.posts.map(({ id, data }, index) => {
        return (
          <Fragment key={id}>
            <Post id={id} data={data} />
            {index !== props.posts.length - 1 ? (
              <div className="h-px w-full bg-neutral-200" />
            ) : null}
          </Fragment>
        );
      })}

      <div ref={ref} className="h-px" />
    </div>
  );
};
