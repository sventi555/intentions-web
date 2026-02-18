Fixes:

Features:
- edit post UI
- post progressive disclosure
- intention pie chart breakdown (colour coding!)?
- comment notifications?
- make nav button movable?? Allow user to drag it around, and store the results in browser??

Tech debt:
- use debounce for searching followers and intentions
- wait on invalidating fewest possible queries on each mutate action
- invalidate everything on sign out
    - less rigorous invalidation otherwise (only navigable things)
