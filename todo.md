Fixes:

Features:
- edit post UI
- create post progressive disclosure (or at least don't lose image when making intentions)
- intention pie chart breakdown (colour coding!)?
- comment notifications?

Tech debt:
- wait on invalidating fewest possible queries on each mutate action
- paginate notifications and comments
- invalidate everything on sign out
    - less rigorous invalidation otherwise (only navigable things)
