import { Route } from 'wouter';
import { AuthProtected } from './components/auth-protected';
import { TabBar } from './components/tab-bar';
import { CreateIntention } from './pages/create-intention';
import { CreatePost } from './pages/create-post';
import { Feed } from './pages/feed';
import { Intention } from './pages/intention';
import { Notifications } from './pages/notifications';
import { Profile } from './pages/profile';
import { Search } from './pages/search';
import { SignIn } from './pages/sign-in';
import { SignUp } from './pages/sign-up';

const App: React.FC = () => {
  return (
    <div className="mx-auto max-w-[640px]">
      <div className="box-border h-dvh pb-[calc(40px+env(safe-area-inset-bottom))]">
        <Route path="/">
          <AuthProtected>
            <Feed />
          </AuthProtected>
        </Route>
        <Route path="/search">
          <AuthProtected>
            <Search />
          </AuthProtected>
        </Route>
        <Route path="/create">
          <AuthProtected>
            <CreatePost />
          </AuthProtected>
        </Route>
        <Route path="/create/intention">
          <AuthProtected>
            <CreateIntention />
          </AuthProtected>
        </Route>
        <Route path="/notifications">
          <AuthProtected>
            <Notifications />
          </AuthProtected>
        </Route>
        <Route path="/profile/:userId">
          <AuthProtected>
            <Profile />
          </AuthProtected>
        </Route>
        <Route path="/profile/:userId/intention/:intentionId">
          <AuthProtected>
            <Intention />
          </AuthProtected>
        </Route>
        <Route path="/sign-in">
          <SignIn />
        </Route>
        <Route path="/sign-up">
          <SignUp />
        </Route>
      </div>
      <TabBar />
    </div>
  );
};

export default App;
