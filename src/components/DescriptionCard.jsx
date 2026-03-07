import React, { useState } from 'react';

/**
 * DescriptionCard — displays one AI-generated description (literal or vibe).
 * Uses aria-live="polite" so screen readers announce new content automatically.
 *
 * @param {{
 *   id: string,           — unique id for aria-labelledby
 *   title: string,        — card heading, e.g. "Literal Description"
 *   emoji: string,        — decorative emoji prefix
 *   content: string|null, — the description text; null while loading
 *   isLoading: boolean,   — show skeleton while true
 *   accentClass: string,  — Tailwind classes for the accent colour
 *   gradientFrom: string, — inline style gradient start colour
 *   gradientTo: string,   — inline style gradient end colour
 * }} props
 * @returns {JSX.Element}
 */
export default function DescriptionCard({
  id,
  title,
  emoji,
  content,
  isLoading,
  accentClass = 'text-brand-400',
  gradientFrom = '#7c3aed',
  gradientTo = '#6d28d9',
}) {
  const [copied, setCopied] = useState(false);

  /** Copies the description text to clipboard. */
  const handleCopy = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available — silently ignore */
    }
  };

  const headingId = `${id}-heading`;

  return (
    <section
      aria-labelledby={headingId}
      className="glass-card p-6 animate-slide-up"
    >
      {/* Card header */}
      <div className="flex items-center justify-between mb-4">
        <h3 id={headingId} className={`text-lg font-bold flex items-center gap-2 ${accentClass}`}>
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${gradientFrom}33, ${gradientTo}22)`, border: `1px solid ${gradientFrom}44` }}
            aria-hidden="true"
          >
            {emoji}
          </span>
          {title}
        </h3>

        {/* Copy button — only shown when there is content */}
        {content && !isLoading && (
          <button
            type="button"
            aria-label={copied ? 'Copied to clipboard' : `Copy ${title} to clipboard`}
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 focus-visible:ring-2 focus-visible:ring-brand-400"
            style={{
              borderColor: copied ? '#34d399' : `${gradientFrom}44`,
              color: copied ? '#34d399' : '#a78bfa',
              background: copied ? 'rgba(52,211,153,0.07)' : 'rgba(124,58,237,0.07)',
            }}
          >
            {copied ? (
              <>
                <span aria-hidden="true">✓</span> Copied!
              </>
            ) : (
              <>
                <span aria-hidden="true">📋</span> Copy
              </>
            )}
          </button>
        )}
      </div>

      {/* Content area — aria-live so screen readers announce updates */}
      <div
        aria-live="polite"
        aria-atomic="true"
        aria-label={`${title} output`}
        className="min-h-[80px]"
      >
        {isLoading ? (
          /* Skeleton loader */
          <div role="status" aria-label="Loading description…" className="space-y-2.5">
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-5/6" />
            <div className="skeleton h-4 w-4/5" />
            <div className="skeleton h-4 w-3/4" />
            <span className="sr-only">Generating description, please wait…</span>
          </div>
        ) : content ? (
          <p className="text-gray-200 leading-relaxed text-sm md:text-base">{content}</p>
        ) : (
          <p className="text-brand-700 italic text-sm">
            {title} will appear here after you analyse an image.
          </p>
        )}
      </div>

      {/* Accent bottom border */}
      <div
        className="mt-5 h-0.5 rounded-full opacity-40"
        style={{ background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo}, transparent)` }}
        aria-hidden="true"
      />
    </section>
  );
}
