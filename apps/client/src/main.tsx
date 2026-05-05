import { AuthProvider } from '@/state/auth.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'motion/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import './index.css';
import { RouterProvider } from './state/router.tsx';
import { defaultTransition } from './style.ts';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MotionConfig transition={defaultTransition}>
          <RouterProvider />

          <Toaster richColors />
        </MotionConfig>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
