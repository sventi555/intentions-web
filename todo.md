- edit post UI
- error toasts
- invalidate everything on sign out

- see your own follows and followers

- consider creating a useAuth hook that expects user to be signed in to avoid authUser == null checks


- remove user denorm and use a document reference (if possible)
    - consider removing post denorm as well
- feed and notification rule tests
