import { Toaster } from 'sonner';
import { Route } from 'wouter';

import { AuthProtected } from '@/components/auth-protected';
import { PageWrapper } from '@/components/page-wrapper';
import { CreatePost } from '@/pages/draft/create-post';
import { Feed } from '@/pages/feed';
import { ForgotPassword } from '@/pages/forgot-password';
import { Intention } from '@/pages/intention';
import { Notifications } from '@/pages/notifications';
import { Profile } from '@/pages/profile';
import { Search } from '@/pages/search';
import { SignIn } from '@/pages/sign-in';
import { SignUp } from '@/pages/sign-up';
import { CreateIntention } from './pages/draft/create-intention';
import { SelectImage } from './pages/draft/select-image';
import { SelectIntention } from './pages/draft/select-intention';
import { DraftPostProvider } from './state/draft';

const App: React.FC = () => {
  return (
    <>
      <Route path="/">
        <AuthProtected>
          <PageWrapper>
            <Feed />
          </PageWrapper>
        </AuthProtected>
      </Route>
      <Route path="/search">
        <AuthProtected>
          <PageWrapper>
            <Search />
          </PageWrapper>
        </AuthProtected>
      </Route>

      <Route path="/draft" nest>
        <AuthProtected>
          <DraftPostProvider>
            <Route path="/(select-intention)?">
              <PageWrapper>
                <SelectIntention />
              </PageWrapper>
            </Route>
            <Route path="/create-intention">
              <PageWrapper>
                <CreateIntention />
              </PageWrapper>
            </Route>
            <Route path="/select-image">
              <PageWrapper>
                <SelectImage />
              </PageWrapper>
            </Route>
            <Route path="/create-post">
              <PageWrapper>
                <CreatePost />
              </PageWrapper>
            </Route>
          </DraftPostProvider>
        </AuthProtected>
      </Route>

      <Route path="/notifications">
        <AuthProtected>
          <PageWrapper>
            <Notifications />
          </PageWrapper>
        </AuthProtected>
      </Route>
      <Route path="/profile/:userId">
        <AuthProtected>
          <PageWrapper>
            <Profile />
          </PageWrapper>
        </AuthProtected>
      </Route>
      <Route path="/profile/:userId/intention/:intentionId">
        <AuthProtected>
          <PageWrapper>
            <Intention />
          </PageWrapper>
        </AuthProtected>
      </Route>

      <Route path="/sign-in">
        <PageWrapper showNav={false}>
          <SignIn />
        </PageWrapper>
      </Route>
      <Route path="/sign-up">
        <PageWrapper showNav={false}>
          <SignUp />
        </PageWrapper>
      </Route>
      <Route path="/forgot-password">
        <PageWrapper showNav={false}>
          <ForgotPassword />
        </PageWrapper>
      </Route>

      <Toaster richColors />
    </>
  );
};

export default App;
