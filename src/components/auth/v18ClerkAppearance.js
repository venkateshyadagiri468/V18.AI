import { dark } from "@clerk/themes";

/**
 * Senior Engineer Grade Clerk Theme Configuration
 * Tailored for V18.AI Smoked-Glass Cinematic Dark Mode
 */
export const v18ClerkAppearance = {
  baseTheme: dark,
  layout: {
    socialButtonsPlacement: "top",
    socialButtonsVariant: "blockButton",
    showOptionalFields: false,
    helpPageUrl: undefined,
    privacyPageUrl: undefined,
    termsPageUrl: undefined,
  },
  variables: {
    colorPrimary: "#ffffff",
    colorBackground: "transparent",
    colorText: "#ffffff",
    colorTextSecondary: "#a1a1aa",
    colorInputBackground: "rgba(255, 255, 255, 0.05)",
    colorInputText: "#ffffff",
    colorNeutral: "#ffffff",
    borderRadius: "0.875rem",
    fontFamily: "inherit",
  },
  elements: {
    rootBox: "w-full max-w-[440px] mx-auto px-0",
    cardBox: "w-full shadow-none",
    card: "w-full bg-black/50 backdrop-blur-2xl border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] rounded-2xl p-4 xs:p-6 sm:p-8",
    header: "space-y-1 mb-4 sm:mb-6 text-center",
    headerTitle: "text-white text-xl sm:text-2xl font-bold tracking-tight",
    headerSubtitle: "text-zinc-400 text-xs sm:text-sm font-normal",
    socialButtonsBlockButton: 
      "bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/10 text-white font-medium rounded-xl h-10 sm:h-11 text-xs sm:text-sm transition-all duration-200 shadow-sm",
    socialButtonsBlockButtonText: "text-zinc-200 text-xs sm:text-sm font-medium",
    socialButtonsProviderIcon: "w-4 h-4 sm:w-5 sm:h-5",
    dividerRow: "my-3.5 sm:my-5",
    dividerLine: "bg-white/10",
    dividerText: "text-zinc-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider px-2 sm:px-3",
    form: "space-y-3 sm:space-y-4",
    formFieldLabel: "text-zinc-300 text-xs font-medium mb-1 sm:mb-1.5 block",
    formFieldInput: 
      "bg-white/[0.04] border border-white/10 text-white placeholder-zinc-500 rounded-xl h-10 sm:h-11 px-3 sm:px-3.5 focus:border-white/30 focus:ring-1 focus:ring-white/20 text-xs sm:text-sm transition-all outline-none",
    formButtonPrimary: 
      "bg-white text-black hover:bg-zinc-200 active:bg-zinc-300 font-semibold rounded-xl h-10 sm:h-11 shadow-lg transition-all duration-200 text-xs sm:text-sm mt-2 sm:mt-3 w-full",
    footer: "mt-4 sm:mt-6 border-t border-white/5 pt-3 sm:pt-4 text-center",
    footerAction: "text-zinc-400 text-xs flex flex-wrap items-center justify-center gap-1.5",
    footerActionText: "text-zinc-400 text-[11px] sm:text-xs",
    footerActionLink: "text-zinc-200 hover:text-white font-semibold transition-colors underline-offset-4 hover:underline text-[11px] sm:text-xs",
    identityPreview: "bg-white/[0.04] border border-white/10 rounded-xl text-white p-2 sm:p-2.5",
    identityPreviewText: "text-white font-medium text-xs sm:text-sm",
    identityPreviewEditButton: "text-zinc-400 hover:text-white text-xs",
    otpCodeFieldInput: "bg-white/[0.05] border border-white/15 text-white text-lg sm:text-xl font-bold rounded-xl focus:border-white focus:ring-1 focus:ring-white/20 h-10 sm:h-12",
    formFieldErrorText: "text-rose-400 text-[11px] sm:text-xs mt-1",
    alert: "bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl p-2.5 sm:p-3 text-xs",
    alertText: "text-rose-300 text-xs",
  }
};
