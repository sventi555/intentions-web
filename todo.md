Fixes:

Features:
- scroll to top of feed when clicking header
- error UI for failed fetching and actions
- edit post UI
- notification alert badge?
- create post progressive disclosure (or at least don't lose image when making intentions)
- intention pie chart breakdown (colour coding!)?
- comment notifications?

Tech debt:
- add top level path alias to remove relative imports in client
- create helper to get all user info copies (like post doc denorm)
- paginate notifications and comments
- invalidate everything on sign out
    - less rigorous invalidation otherwise (only navigable things)
- delete old profile picture when changing DP
- delete post image when deleting post
