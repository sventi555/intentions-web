import { Post as _Post } from 'lib';
import { Fragment } from 'react';

import { Post } from '@/components/post';
import { useInfiniteScroll } from '@/hooks/infinite-scroll';

interface PostsListProps {
  posts: { id: string; data: _Post }[];
  fetchNextPage: () => Promise<unknown>;
  fetchingPage: boolean;
  hasNextPage: boolean;
}

export const PostsList: React.FC<PostsListProps> = (props) => {
  useInfiniteScroll({
    fetchNextPage: props.fetchNextPage,
    isFetchingNextPage: props.fetchingPage,
    hasNextPage: props.hasNextPage,
  });

  return (
    <div className="flex flex-col gap-1 p-4 pt-1 pb-[80px]">
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
    </div>
  );
};
