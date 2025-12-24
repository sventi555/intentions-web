Fixes:
- script to copy comments to root level
- delete comments when deleting post
- comment DPs aren't updating
- script for fixing comment dps

Features:
- forgot password flow
- see your own follows and followers
- image placeholders
- error UI for failed fetching and actions
- edit post UI
- notification alert badge?
- create post progressive disclosure (or at least don't lose image when making intentions)
- intention pie chart breakdown (colour coding!)?
- comment notifications?

Tech debt:
- restructure firebase directory?
- paginate notifications and comments
- error schemas for api error responses
- invalidate everything on sign out
    - less rigorous invalidation otherwise (only navigable things)
- delete old profile picture when changing DP
- delete post image when deleting post
