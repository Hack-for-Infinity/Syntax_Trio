import React from 'react';
import { useSpeech } from '../hooks/useSpeech';

/**
 * ReadAloudButton — triggers TTS for the combined literal + vibe descriptions.
 * Displays as "Read Aloud" when idle, "Stop" while speaking.
 * Uses aria-pressed to communicate toggle state to screen readers.
 *
 * @param {{
 *   literalText: string|null,
 *   vibeText: string|null,
 * }} props
 * @returns {JSX.Element}
 */
export default function ReadAloudButton({ literalText, vibeText }) {
  const { speak, stop, isSpeaking, isSupported } = useSpeech();

  const hasContent = !!(literalText || vibeText);

  /** Builds the full text script to be read aloud. */
  const buildScript = () => {
    const parts = [];
    if (literalText) parts.push(`Literal Description. ${literalText}`);
    if (vibeText)   parts.push(`Vibe Description. ${vibeText}`);
    return parts.join('  ');
  };

  const handleClick = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(buildScript());
    }
  };

  if (!isSupported) {
    return (
      <p role="alert" className="text-center text-brand-500 text-sm py-2">
        ⚠️ Your browser does not support text-to-speech. Try Chrome or Edge.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 animate-fade-in">
      <button
        type="button"
        aria-label={
          isSpeaking
            ? 'Stop reading aloud'
            : hasContent
            ? 'Read aloud both descriptions'
            : 'Read aloud — analyse an image first'
        }
        aria-pressed={isSpeaking}
        disabled={!hasContent}
        onClick={handleClick}
        className={`group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-base text-white shadow-lg transition-all duration-300 focus-visible:ring-4 focus-visible:ring-brand-400/60 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none ${
          isSpeaking
            ? 'bg-gradient-to-r from-vibe-600 to-vibe-700 shadow-vibe-700/40 scale-95'
            : 'bg-gradient-to-r from-brand-600 to-vibe-600 hover:from-brand-500 hover:to-vibe-500 hover:scale-105 hover:shadow-xl hover:shadow-brand-700/40'
        }`}
      >
        {/* Speaking pulse animation */}
        {isSpeaking && (
          <span className="absolute inset-0 rounded-2xl opacity-30 bg-vibe-400 animate-ping" aria-hidden="true" />
        )}

        {/* Icon */}
        <span className="text-xl" aria-hidden="true">
          {isSpeaking ? '⏹️' : '🔊'}
        </span>

        {/* Label */}
        <span>{isSpeaking ? 'Stop' : 'Read Aloud'}</span>

        {/* Sound waves animation while speaking */}
        {isSpeaking && (
          <span className="flex items-center gap-0.5" aria-hidden="true">
            {[1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="w-1 rounded-full bg-white opacity-80 animate-pulse-slow"
                style={{
                  height: `${8 + i * 4}px`,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </span>
        )}
      </button>

      {/* Helper text */}
      <p className="text-brand-500 text-xs" aria-live="polite">
        {isSpeaking
          ? 'Speaking… press Stop to cancel'
          : hasContent
          ? 'Press to hear both descriptions read aloud'
          : 'Analyse an image above to enable Read Aloud'}
      </p>
    </div>
  );
}
