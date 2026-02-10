import { Toaster } from 'sonner';
import { Route } from 'wouter';

import { AuthProtected } from '@/components/auth-protected';
import { PageWrapper } from '@/components/page-wrapper';
import { CreateIntention } from '@/pages/create-intention';
import { CreatePost } from '@/pages/create-post';
import { Feed } from '@/pages/feed';
import { ForgotPassword } from '@/pages/forgot-password';
import { Intention } from '@/pages/intention';
import { Notifications } from '@/pages/notifications';
import { Profile } from '@/pages/profile';
import { Search } from '@/pages/search';
import { SignIn } from '@/pages/sign-in';
import { SignUp } from '@/pages/sign-up';
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

      <Route path="/create" nest>
        <AuthProtected>
          <DraftPostProvider>
            <Route path="/">
              <PageWrapper>
                <CreatePost />
              </PageWrapper>
            </Route>

            <Route path="/intention">
              <PageWrapper>
                <CreateIntention />
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
