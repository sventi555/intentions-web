import { Post as _Post } from 'lib';
import { Fragment } from 'react';
import { Post } from './post';

interface PostsListProps {
  posts: { id: string; data: _Post }[];
}

export const PostsList: React.FC<PostsListProps> = ({ posts }) => {
  return (
    <div className="flex flex-col gap-1">
      {posts.map(({ id, data }, index) => {
        return (
          <Fragment key={id}>
            <Post id={id} data={data} />
            {index !== posts.length - 1 ? (
              <div className="h-px w-full bg-neutral-200" />
            ) : null}
          </Fragment>
        );
      })}
    </div>
  );
};
