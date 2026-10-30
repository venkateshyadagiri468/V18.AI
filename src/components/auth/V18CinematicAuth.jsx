import React, { useState, useEffect, Component } from "react";
import { SignIn, SignUp } from "@clerk/clerk-react";
import { v18ClerkAppearance } from "./v18ClerkAppearance";
import bgImage from "../../assets/images/v18-cinematic-bg.jpg";
import { ArrowLeft, CheckCircle2, Sparkles, ExternalLink, Key, X, AlertTriangle } from "lucide-react";

function GithubIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function LinkedinIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
    </svg>
  );
}

class ClerkErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full bg-black/60 backdrop-blur-2xl border border-amber-500/30 rounded-2xl p-6 text-center shadow-2xl">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
          <h3 className="text-white font-semibold text-base mb-1">Clerk Sign-In Notice</h3>
          <p className="text-zinc-400 text-xs mb-4 leading-relaxed">
            Live Clerk authentication component encountered a client-side network or policy exception. You can continue directly as a Guest or reload.
          </p>
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={this.props.onFallbackGuest}
              className="px-4 py-2 bg-white text-black font-semibold text-xs rounded-xl hover:bg-zinc-200 transition-all"
            >
              Enter Workspace as Guest
            </button>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-white/10 text-white font-medium text-xs rounded-xl hover:bg-white/20 transition-all border border-white/10"
            >
              Retry Connection
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * V18.AI Cinematic Authentication Component
 * Supports Live Clerk Authentication (Google OAuth, Sign-In, Sign-Up)
 * and Interactive Cinematic Smoked-Glass Console.
 */
const DEFAULT_CLERK_PUBLISHABLE_KEY = "pk_test_YWRhcHRlZC12aXBlci04MjQuY2xlcmsuYWNjb3VudHMuZGV2JA";

export default function V18CinematicAuth({ onEnterGuest }) {
  const publishableKey = 
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 
    import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    (typeof window !== "undefined" ? localStorage.getItem("v18_clerk_publishable_key") : null) ||
    DEFAULT_CLERK_PUBLISHABLE_KEY;

  const isClerkConfigured = Boolean(
    publishableKey && 
    publishableKey.startsWith("pk_") && 
    !publishableKey.includes("YOUR_")
  );

  // Preference: whether to show live Clerk SDK or cinematic preview card
  const [preferClerkSDK, setPreferClerkSDK] = useState(() => isClerkConfigured);

  // Flow State: 'sign-in' | 'sign-up' | 'forgot-password'
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      if (window.location.hash === "#sign-up") return "sign-up";
      if (window.location.hash === "#forgot-password") return "forgot-password";
    }
    return "sign-in";
  });

  // Preview Mode Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    resetCode: "",
  });
  const [resetSent, setResetSent] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [modalProvider, setModalProvider] = useState("Google");
  const [customClerkKey, setCustomClerkKey] = useState("");

  const handleSocialClick = (providerName) => {
    setModalProvider(providerName);
    if (isClerkConfigured) {
      // If Clerk is configured, switch directly to live Clerk SDK view
      setPreferClerkSDK(true);
      setStatusMessage({
        type: "info",
        text: `Switched to Live Clerk Authentication for ${providerName} sign-in.`,
      });
    } else {
      // Show configuration modal to let user connect Clerk key or enter as Google guest
      setShowKeyModal(true);
    }
  };

  const handleSaveCustomKey = (e) => {
    e.preventDefault();
    if (!customClerkKey.trim().startsWith("pk_")) {
      alert("Please enter a valid Clerk publishable key starting with pk_test_ or pk_live_");
      return;
    }
    localStorage.setItem("v18_clerk_publishable_key", customClerkKey.trim());
    window.location.reload();
  };

  // Sync with browser hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#sign-up") setActiveTab("sign-up");
      else if (hash === "#forgot-password") setActiveTab("forgot-password");
      else setActiveTab("sign-in");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setStatusMessage(null);
    setResetSent(false);
    if (typeof window !== "undefined") {
      window.location.hash = tab === "sign-in" ? "#sign-in" : tab === "sign-up" ? "#sign-up" : "#forgot-password";
    }
  };

  const handlePreviewSubmit = (e) => {
    e?.preventDefault?.();
    setIsLoading(true);
    setStatusMessage(null);

    setTimeout(() => {
      setIsLoading(false);
      if (activeTab === "forgot-password") {
        setResetSent(true);
        setStatusMessage({ type: "success", text: "Verification code sent to " + (formData.email || "your email") });
      } else if (activeTab === "sign-up") {
        setStatusMessage({ 
          type: "success", 
          text: `Account created for ${formData.name || "Agent User"}! Connecting to workspace...` 
        });
        setTimeout(() => {
          onEnterGuest?.();
        }, 600);
      } else {
        setStatusMessage({ 
          type: "success", 
          text: "Authenticated! Connecting to V18.AI workspace..." 
        });
        setTimeout(() => {
          onEnterGuest?.();
        }, 600);
      }
    }, 400);
  };

  return (
    <div className="relative h-[100dvh] w-full overflow-y-auto overflow-x-hidden bg-black text-white select-none">
      {/* 1. Cinematic Ambient Background Layer */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none transform scale-105 transition-transform duration-1000 ease-out z-0"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/60 pointer-events-none" />
        <div className="absolute inset-0 bg-radial-vignette pointer-events-none" />
      </div>

      {/* 2. Responsive Content Container */}
      <div className="relative z-10 min-h-full w-full flex flex-col justify-between items-center px-3.5 sm:px-6 py-5 sm:py-8 md:py-10">
        {/* Top Header Brand Mark & Developer Social Links */}
        <header className="w-full max-w-xl flex items-center justify-between px-2 sm:px-4 flex-shrink-0 transition-all">
          <div className="w-16 hidden sm:block" />

          {/* Centered Brand Mark */}
          <div className="flex items-center gap-2.5 sm:gap-3 mx-auto sm:mx-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-white/20 via-white/5 to-white/0 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.15)] flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.5)]" viewBox="0 0 40 40" fill="none">
                <path d="M10 8L20 32L30 8H23L20 22L17 8H10Z" fill="currentColor" />
                <path d="M26 12L32 26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
              </svg>
            </div>
            <span className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
              V18.AI
            </span>
          </div>

          {/* Top-Right Developer Links */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <a
              href="https://github.com/venkateshyadagiri468"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] active:bg-white/[0.15] border border-white/10 hover:border-white/30 flex items-center justify-center text-zinc-400 hover:text-white transition-all shadow-sm"
              title="Venkatesh Yadagiri on GitHub"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
            <a
              href="https://www.linkedin.com/in/venkateshyadagiri468/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] active:bg-white/[0.15] border border-white/10 hover:border-[#0a66c2]/50 flex items-center justify-center text-zinc-400 hover:text-[#0a66c2] transition-all shadow-sm"
              title="Venkatesh Yadagiri on LinkedIn"
            >
              <LinkedinIcon className="w-4 h-4" />
            </a>
          </div>
        </header>

        {/* 3. Centered Authentication Module */}
        <main className="w-full max-w-[440px] my-4 sm:my-6 flex-shrink-0 transition-all duration-300">
          {isClerkConfigured && preferClerkSDK ? (
            /* Live Clerk Authentication Component wrapped in ErrorBoundary */
            <ClerkErrorBoundary onFallbackGuest={() => onEnterGuest?.()}>
              <div className="w-full">
                {activeTab === "sign-up" ? (
                  <SignUp 
                    routing="hash"
                    appearance={v18ClerkAppearance}
                    signInUrl="#sign-in"
                    fallbackRedirectUrl="/"
                    forceRedirectUrl="/"
                    signUpFallbackRedirectUrl="/"
                  />
                ) : (
                  <SignIn 
                    routing="hash"
                    appearance={v18ClerkAppearance}
                    signUpUrl="#sign-up"
                    fallbackRedirectUrl="/"
                    forceRedirectUrl="/"
                    signInFallbackRedirectUrl="/"
                  />
                )}
              </div>
            </ClerkErrorBoundary>
          ) : (
            /* Interactive Smoked-Glass Console (Cinematic & Guest Mode) */
            <div className="w-full bg-black/55 backdrop-blur-2xl border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] rounded-2xl p-4 xs:p-6 sm:p-8 transition-all">
              {/* V18 Badge Inside Card */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="w-4 h-4 text-white/80" viewBox="0 0 40 40" fill="none">
                  <path d="M10 8L20 32L30 8H23L20 22L17 8H10Z" fill="currentColor" />
                  <path d="M26 12L32 26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
                </svg>
                <span className="text-[11px] sm:text-xs font-semibold tracking-wider text-zinc-300 uppercase">V18.AI</span>
              </div>

              {/* SCREEN 1: SIGN IN */}
              {activeTab === "sign-in" && (
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white text-center">
                    Sign in to V18.AI
                  </h1>
                  <p className="text-zinc-400 text-xs text-center mt-1 mb-5 sm:mb-6">
                    Access your autonomous intelligence workspace
                  </p>

                  {/* Social Auth Providers */}
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={() => handleSocialClick("Google")}
                      className="w-full h-11 bg-white/[0.05] hover:bg-white/[0.09] active:bg-white/[0.12] border border-white/10 rounded-xl px-4 flex items-center justify-center gap-3 text-sm font-medium text-zinc-200 transition-all duration-150"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                        <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                        <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
                        <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z" />
                      </svg>
                      Continue with Google
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSocialClick("GitHub")}
                      className="w-full h-11 bg-white/[0.05] hover:bg-white/[0.09] active:bg-white/[0.12] border border-white/10 rounded-xl px-4 flex items-center justify-center gap-3 text-sm font-medium text-zinc-200 transition-all duration-150"
                    >
                      <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                      Continue with GitHub
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="relative my-5 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10" />
                    </div>
                    <span className="relative bg-[#0d0f12] px-3 text-[11px] font-semibold tracking-wider uppercase text-zinc-500">
                      or
                    </span>
                  </div>

                  {/* Form Fields */}
                  <form onSubmit={handlePreviewSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-zinc-300 text-xs font-medium mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full h-11 bg-white/[0.04] border border-white/10 text-white placeholder-zinc-500 rounded-xl px-3.5 text-sm focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-zinc-300 text-xs font-medium">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => switchTab("forgot-password")}
                          className="text-xs text-zinc-400 hover:text-white transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full h-11 bg-white/[0.04] border border-white/10 text-white placeholder-zinc-500 rounded-xl px-3.5 text-sm focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 bg-white hover:bg-zinc-200 active:bg-zinc-300 text-black font-semibold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                    >
                      {isLoading ? "Authenticating..." : "Continue ↵"}
                    </button>
                  </form>

                  {/* Quick Guest Enter */}
                  <div className="mt-4 pt-3 text-center">
                    <button
                      type="button"
                      onClick={() => onEnterGuest?.()}
                      className="text-xs text-zinc-400 hover:text-white transition-colors underline-offset-4 hover:underline"
                    >
                      ⚡ Quick Enter as Guest (No account needed)
                    </button>
                  </div>

                  {/* Footer Switch */}
                  <div className="mt-4 pt-3 border-t border-white/5 text-center">
                    <p className="text-zinc-400 text-xs">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => switchTab("sign-up")}
                        className="text-white font-medium hover:underline ml-1"
                      >
                        Sign up
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {/* SCREEN 2: CREATE ACCOUNT / SIGN UP */}
              {activeTab === "sign-up" && (
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white text-center">
                    Create your V18.AI Account
                  </h1>
                  <p className="text-zinc-400 text-xs text-center mt-1 mb-5">
                    Get started with autonomous intelligence
                  </p>

                  {/* Social Sign Up */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => handleSocialClick("Google")}
                      className="h-10 bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 rounded-xl px-2 flex items-center justify-center gap-2 text-xs font-medium text-zinc-200 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                        <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                        <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
                        <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z" />
                      </svg>
                      Google
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSocialClick("GitHub")}
                      className="h-10 bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 rounded-xl px-2 flex items-center justify-center gap-2 text-xs font-medium text-zinc-200 transition-all"
                    >
                      <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                      GitHub
                    </button>
                  </div>

                  <div className="relative my-3 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10" />
                    </div>
                    <span className="relative bg-[#0d0f12] px-2 text-[10px] font-semibold tracking-wider uppercase text-zinc-500">
                      or sign up with email
                    </span>
                  </div>

                  <form onSubmit={handlePreviewSubmit} className="space-y-3">
                    <div>
                      <label className="block text-zinc-300 text-xs font-medium mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Alan Turing"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full h-10 bg-white/[0.04] border border-white/10 text-white placeholder-zinc-500 rounded-xl px-3 text-sm focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-300 text-xs font-medium mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full h-10 bg-white/[0.04] border border-white/10 text-white placeholder-zinc-500 rounded-xl px-3 text-sm focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-300 text-xs font-medium mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="At least 8 characters"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full h-10 bg-white/[0.04] border border-white/10 text-white placeholder-zinc-500 rounded-xl px-3 text-sm focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 bg-white hover:bg-zinc-200 active:bg-zinc-300 text-black font-semibold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 mt-3 disabled:opacity-50"
                    >
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </button>
                  </form>

                  <div className="mt-4 pt-3 border-t border-white/5 text-center">
                    <p className="text-zinc-400 text-xs">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => switchTab("sign-in")}
                        className="text-white font-medium hover:underline ml-1"
                      >
                        Sign in
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {/* SCREEN 3: FORGOT / RESET PASSWORD */}
              {activeTab === "forgot-password" && (
                <div>
                  <button
                    type="button"
                    onClick={() => switchTab("sign-in")}
                    className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white text-xs mb-3 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
                  </button>

                  <h1 className="text-2xl font-bold tracking-tight text-white text-center">
                    Reset your password
                  </h1>
                  <p className="text-zinc-400 text-xs text-center mt-1 mb-6 leading-relaxed">
                    Enter your email address and we will send you a verification code to reset your password.
                  </p>

                  <form onSubmit={handlePreviewSubmit} className="space-y-4">
                    <div>
                      <label className="block text-zinc-300 text-xs font-medium mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full h-11 bg-white/[0.04] border border-white/10 text-white placeholder-zinc-500 rounded-xl px-3.5 text-sm focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all outline-none"
                      />
                    </div>

                    {resetSent && (
                      <div className="space-y-1.5 animate-fadeIn">
                        <label className="block text-zinc-300 text-xs font-medium">
                          Verification Code
                        </label>
                        <input
                          type="text"
                          placeholder="6-digit code"
                          value={formData.resetCode}
                          onChange={(e) => setFormData({ ...formData, resetCode: e.target.value })}
                          className="w-full h-11 bg-white/[0.04] border border-white/20 text-white placeholder-zinc-500 rounded-xl px-3.5 text-center text-lg tracking-widest font-mono focus:border-white/40 focus:ring-1 focus:ring-white/30 transition-all outline-none"
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 bg-white hover:bg-zinc-200 active:bg-zinc-300 text-black font-semibold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                    >
                      {isLoading ? "Sending..." : resetSent ? "Verify & Set New Password" : "Send Reset Code"}
                    </button>
                  </form>

                  <div className="mt-5 pt-3 border-t border-white/5 text-center">
                    <button
                      type="button"
                      onClick={() => switchTab("sign-in")}
                      className="text-xs text-zinc-400 hover:text-white transition-colors"
                    >
                      Remember your password? <span className="text-white font-medium underline">Sign in</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Status Feedback Toast */}
              {statusMessage && (
                <div className="mt-4 p-2.5 rounded-xl bg-white/[0.06] border border-white/15 flex items-start gap-2 text-xs animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-zinc-200">{statusMessage.text}</span>
                </div>
              )}
            </div>
          )}
        </main>

        {/* 4. Cinematic Description Footer with Mode Switcher */}
        <footer className="relative z-10 text-center max-w-xl mx-auto px-4 mt-2 flex flex-col items-center gap-3">
          <p className="text-zinc-300/85 text-xs sm:text-sm font-light tracking-wide leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            V18.AI • Next-Generation Autonomous Multi-Agent Intelligence Platform — Orchestrating cognitive workflows and real-time reasoning.
          </p>

          {/* Developer Social Links Bar (GitHub & LinkedIn) */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-3 flex-wrap">
            <a
              href="https://github.com/venkateshyadagiri468"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] active:bg-white/[0.15] border border-white/10 hover:border-white/30 backdrop-blur-md text-zinc-300 hover:text-white text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-[0_0_15px_rgba(255,255,255,0.12)]"
              title="View Venkatesh Yadagiri on GitHub"
            >
              <GithubIcon className="w-3.5 h-3.5 text-zinc-300 group-hover:text-white transition-colors" />
              <span>GitHub</span>
              <ExternalLink className="w-2.5 h-2.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
            </a>

            <a
              href="https://www.linkedin.com/in/venkateshyadagiri468/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] active:bg-white/[0.15] border border-white/10 hover:border-[#0a66c2]/50 backdrop-blur-md text-zinc-300 hover:text-white text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-[0_0_15px_rgba(10,102,194,0.25)]"
              title="View Venkatesh Yadagiri on LinkedIn"
            >
              <LinkedinIcon className="w-3.5 h-3.5 text-zinc-300 group-hover:text-[#0a66c2] transition-colors" />
              <span>LinkedIn</span>
              <ExternalLink className="w-2.5 h-2.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
            </a>
          </div>

          {/* Quick Mode & Screen Switcher Bar */}
          <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-[11px] text-zinc-400 flex-wrap justify-center">
            {isClerkConfigured && (
              <>
                <button
                  type="button"
                  onClick={() => setPreferClerkSDK(!preferClerkSDK)}
                  className="px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-colors border border-white/15"
                >
                  {preferClerkSDK ? "✨ View Cinematic Console" : "⚡ View Live Clerk Sign-In"}
                </button>
                <span className="text-zinc-600">|</span>
              </>
            )}

            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Screen:</span>
            <button 
              type="button"
              onClick={() => switchTab("sign-in")}
              className={`px-2 py-0.5 rounded-full transition-colors ${activeTab === "sign-in" ? "bg-white text-black font-medium" : "hover:text-white"}`}
            >
              Sign In
            </button>
            <button 
              type="button"
              onClick={() => switchTab("sign-up")}
              className={`px-2 py-0.5 rounded-full transition-colors ${activeTab === "sign-up" ? "bg-white text-black font-medium" : "hover:text-white"}`}
            >
              Sign Up
            </button>
            <button 
              type="button"
              onClick={() => switchTab("forgot-password")}
              className={`px-2 py-0.5 rounded-full transition-colors ${activeTab === "forgot-password" ? "bg-white text-black font-medium" : "hover:text-white"}`}
            >
              Reset
            </button>
          </div>
        </footer>
      </div>

      {/* 5. Social Auth Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-zinc-950 border border-white/15 rounded-2xl p-6 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={() => setShowKeyModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white">
                <Key className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {modalProvider} Authentication
                </h3>
                <p className="text-zinc-400 text-xs">Configure Clerk OAuth Integration</p>
              </div>
            </div>

            <p className="text-zinc-300 text-xs leading-relaxed mb-4">
              Real-world {modalProvider} authentication is handled securely via Clerk. Enter your Clerk Publishable Key below to enable Google & social sign-in, or continue instantly as an authenticated Guest.
            </p>

            <form onSubmit={handleSaveCustomKey} className="space-y-3 mb-4">
              <div>
                <label className="block text-zinc-300 text-xs font-medium mb-1.5">
                  Clerk Publishable Key
                </label>
                <input
                  type="text"
                  placeholder="pk_test_..."
                  value={customClerkKey}
                  onChange={(e) => setCustomClerkKey(e.target.value)}
                  className="w-full h-10 bg-white/[0.04] border border-white/10 text-white placeholder-zinc-500 rounded-xl px-3 text-xs focus:border-white/30 focus:ring-1 focus:ring-white/20 font-mono transition-all outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full h-10 bg-white hover:bg-zinc-200 text-black font-semibold rounded-xl text-xs transition-all shadow-md"
              >
                Save Key & Connect Clerk
              </button>
            </form>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setShowKeyModal(false);
                  onEnterGuest?.();
                }}
                className="text-xs text-zinc-300 hover:text-white underline underline-offset-4"
              >
                ⚡ Continue as {modalProvider} Guest
              </button>

              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
