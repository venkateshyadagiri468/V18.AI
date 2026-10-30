import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import './styles/index.css';
import App from './App.jsx';

const PUBLISHABLE_KEY = 
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 
  import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  (typeof window !== 'undefined' ? localStorage.getItem('v18_clerk_publishable_key') : null);

const isClerkKeyValid = Boolean(
  PUBLISHABLE_KEY && 
  PUBLISHABLE_KEY.startsWith('pk_') && 
  !PUBLISHABLE_KEY.includes('YOUR_')
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isClerkKeyValid ? (
      <ClerkProvider 
        publishableKey={PUBLISHABLE_KEY}
        fallbackRedirectUrl="/"
        forceRedirectUrl="/"
        signInFallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
        afterSignOutUrl="/"
      >
        <App isClerkActive={true} />
      </ClerkProvider>
    ) : (
      <App isClerkActive={false} />
    )}
  </StrictMode>
);
