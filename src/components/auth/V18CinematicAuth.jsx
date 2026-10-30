import React, { useState, useEffect } from "react";
import { SignIn, SignUp } from "@clerk/clerk-react";
import { v18ClerkAppearance } from "./v18ClerkAppearance";
import bgImage from "../../assets/images/v18-cinematic-bg.jpg";
import { ArrowLeft, CheckCircle2, Shield, Sparkles, AlertCircle } from "lucide-react";

/**
 * V18.AI Cinematic Authentication Component
 * Supports Sign In, Create Account (Sign Up), and Forgot/Reset Password
 * Includes real-time Clerk SDK integration and fallback preview mode.
 */
export default function V18CinematicAuth({ onEnterGuest }) {
  const publishableKey = 
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 
    import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isClerkConfigured = Boolean(
    publishableKey && 
    publishableKey.startsWith("pk_") && 
    !publishableKey.includes("YOUR_")
  );

  // Flow State: 'sign-in' | 'sign-up' | 'forgot-password'
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      if (window.location.hash === "#sign-up") return "sign-up";
      if (window.location.hash === "#forgot-password") return "forgot-password";
    }
    return "sign-in";
  });

  // Preview Mode Form State (for zero-config instant interaction)
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

  const handleSocialClick = (providerName) => {
    if (!isClerkConfigured) {
      setModalProvider(providerName);
      setShowKeyModal(true);
    }
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
    e.preventDefault();
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
        }, 800);
      } else {
        setStatusMessage({ 
          type: "success", 
          text: "Authenticated! Connecting to V18.AI workspace..." 
        });
        setTimeout(() => {
          onEnterGuest?.();
        }, 800);
      }
    }, 600);
  };

  return (
    <div className="relative h-[100dvh] w-full overflow-y-auto overflow-x-hidden bg-black text-white select-none">
      {/* 1. Cinematic Ambient Background Layer - Fixed to stay stable during mobile scroll */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none transform scale-105 transition-transform duration-1000 ease-out z-0"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        {/* Soft atmospheric gradient & cinematic vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/60 pointer-events-none" />
        <div className="absolute inset-0 bg-radial-vignette pointer-events-none" />
      </div>

      {/* 2. Responsive Content Container with Safe-Area insets */}
      <div className="relative z-10 min-h-full w-full flex flex-col justify-between items-center px-3.5 sm:px-6 py-5 sm:py-8 md:py-10">
        {/* Top Header Brand Mark */}
        <header className="flex-shrink-0 flex flex-col items-center gap-1.5 transition-all">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Custom V18 Metallic Emblem */}
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
        </header>

        {/* 3. Centered Smoked-Glass Authentication Module */}
        <main className="w-full max-w-[440px] my-4 sm:my-6 flex-shrink-0 transition-all duration-300">
        {isClerkConfigured ? (
          /* Live Clerk Authentication Component */
          <div className="w-full">
            {activeTab === "sign-up" ? (
              <SignUp 
                routing="hash"
                appearance={v18ClerkAppearance}
                signInUrl="#sign-in"
              />
            ) : (
              <SignIn 
                routing="hash"
                appearance={v18ClerkAppearance}
                signUpUrl="#sign-up"
              />
            )}
          </div>
        ) : (
          /* Interactive Senior-Engineer Smoked-Glass Console (Preview & Fallback Mode) */
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
                    onClick={() => handlePreviewSubmit({ preventDefault: () => {} })}
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
                    onClick={() => handlePreviewSubmit({ preventDefault: () => {} })}
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

                {/* Footer Switch */}
                <div className="mt-5 pt-4 border-t border-white/5 text-center">
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
                    onClick={() => handlePreviewSubmit({ preventDefault: () => {} })}
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
                    onClick={() => handlePreviewSubmit({ preventDefault: () => {} })}
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

      {/* 4. Cinematic Description Footer */}
      <footer className="relative z-10 text-center max-w-xl mx-auto px-4 mt-2">
        <p className="text-zinc-300/85 text-xs sm:text-sm font-light tracking-wide leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
          V18.AI • Next-Generation Autonomous Multi-Agent Intelligence Platform — Orchestrating cognitive workflows and real-time reasoning.
        </p>

        {/* Quick Developer Switcher Bar */}
        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-[11px] text-zinc-400">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Screen Preview:</span>
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
  </div>
);
}
