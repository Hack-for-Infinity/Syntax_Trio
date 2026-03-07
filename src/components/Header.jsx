import React from 'react';

/**
 * Header — top banner for VibeVision.
 * Includes skip-to-content link, app logo, name, and tagline.
 *
 * @returns {JSX.Element}
 */
export default function Header() {
  return (
    <>
      {/* Skip to main content — first focusable element (WCAG 2.4.1) */}
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header role="banner" className="relative z-10 py-8 px-4 text-center">
        {/* Logo + brand name */}
        <div className="flex items-center justify-center gap-3 mb-3">
          {/* SVG eye icon with sparkle */}
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #c026d3)' }}
            aria-hidden="true"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <ellipse cx="12" cy="12" rx="10" ry="6" />
              <circle cx="12" cy="12" r="3" fill="white" stroke="none" />
              <path d="M2 12s4-8 10-8 10 8 10 8" />
              <circle cx="19" cy="5" r="1" fill="#f0abfc" stroke="none" />
            </svg>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight gradient-text">
            VibeVision
          </h1>
        </div>

        <p className="text-brand-300 text-base md:text-lg font-medium max-w-xl mx-auto leading-relaxed">
          AI-powered image accessibility —&nbsp;
          <span className="text-vibe-300">see the literal</span> and&nbsp;
          <span className="text-brand-300">feel the vibe</span>
        </p>

        {/* Hackathon badge */}
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border border-brand-700/50 text-brand-300 bg-brand-900/30">
          <span aria-hidden="true">⚡</span>
          Hack for Infinity 2K26 · PS04: AI for Ability
        </div>
      </header>
    </>
  );
}
