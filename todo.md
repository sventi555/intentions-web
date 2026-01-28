Fixes:
- lower case username for adding users and searching in proflie
- profile page remember tab navigation

Features:
- have profile tab as part of nav state?
- store image size/ratio on post data for better placeholder sizing
- error UI for failed fetching and actions
- edit post UI
- create post progressive disclosure (or at least don't lose image when making intentions)
- intention pie chart breakdown (colour coding!)?
- comment notifications?

Tech debt:
- paginate notifications and comments
- invalidate everything on sign out
    - less rigorous invalidation otherwise (only navigable things)
- delete old profile picture when changing DP
- delete post image when deleting post
