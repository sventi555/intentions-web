import { Route } from 'wouter';
import { TabBar } from './components/tab-bar';
import { CreateIntention } from './pages/create-intention';
import { CreatePost } from './pages/create-post';
import { Feed } from './pages/feed';
import { Intention } from './pages/intention';
import { Notifications } from './pages/notifications';
import { Profile } from './pages/profile';
import { Search } from './pages/search';

const App: React.FC = () => {
  return (
    <>
      <div className="pb-[40px]">
        <Route path="/">
          <Feed />
        </Route>
        <Route path="/search">
          <Search />
        </Route>
        <Route path="/create">
          <CreatePost />
        </Route>
        <Route path="/create/intention">
          <CreateIntention />
        </Route>
        <Route path="/notifications">
          <Notifications />
        </Route>
        <Route path="/profile/:userId">
          <Profile />
        </Route>
        <Route path="/intention/:intentionId">
          <Intention />
        </Route>
      </div>

      <TabBar />
    </>
  );
};

export default App;
