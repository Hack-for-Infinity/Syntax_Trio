import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ImageInput from './components/ImageInput';
import DescriptionCard from './components/DescriptionCard';
import ReadAloudButton from './components/ReadAloudButton';
import { analyzeImage } from './api/analyzeImage';

/**
 * App — root component for VibeVision.
 * Manages global state and orchestrates the image-to-description flow.
 *
 * State:
 *   selectedFile  {File|null}   — file from upload
 *   imageUrl      {string|null} — URL from paste
 *   literal       {string|null} — Gemini literal description
 *   vibe          {string|null} — Gemini vibe description
 *   isLoading     {boolean}     — API call in flight
 *   error         {string|null} — error message to display
 *
 * @returns {JSX.Element}
 */
export default function App() {
  const [selectedFile, setSelectedFile]   = useState(null);
  const [imageUrl, setImageUrl]           = useState(null);
  const [literal, setLiteral]             = useState(null);
  const [vibe, setVibe]                   = useState(null);
  const [isLoading, setIsLoading]         = useState(false);
  const [error, setError]                 = useState(null);

  /**
   * Runs the Gemini analysis for a file or URL.
   * @param {File|null} file
   * @param {string|null} url
   */
  const runAnalysis = useCallback(async (file, url) => {
    setError(null);
    setLiteral(null);
    setVibe(null);
    setIsLoading(true);
    try {
      const result = await analyzeImage(file, url);
      setLiteral(result.literal);
      setVibe(result.vibe);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Called when ImageInput selects a file */
  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setImageUrl(null);
    runAnalysis(file, null);
  };

  /** Called when ImageInput submits a URL */
  const handleUrlSubmit = (url) => {
    setImageUrl(url);
    setSelectedFile(null);
    runAnalysis(null, url);
  };

  const hasResults = !!(literal || vibe || isLoading);

  return (
    <div className="bg-animated min-h-screen">
      <div className="max-w-3xl mx-auto px-4 pb-16">
        {/* ── App Header ── */}
        <Header />

        {/* ── Main content ── */}
        <main id="main-content" aria-label="VibeVision main content">

          {/* Image input */}
          <ImageInput
            onFileSelect={handleFileSelect}
            onUrlSubmit={handleUrlSubmit}
            isLoading={isLoading}
          />

          {/* Error banner */}
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-900/20 text-red-300 text-sm flex items-start gap-3 animate-fade-in"
            >
              <span className="text-xl flex-shrink-0" aria-hidden="true">⚠️</span>
              <div>
                <p className="font-semibold mb-0.5">Something went wrong</p>
                <p className="text-red-400/80">{error}</p>
              </div>
            </div>
          )}

          {/* Results section */}
          {hasResults && (
            <section aria-label="Analysis results" className="space-y-4">
              {/* Status heading */}
              <div className="flex items-center gap-3 mb-2" aria-live="polite">
                {isLoading ? (
                  <p className="text-brand-400 text-sm font-medium flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                    Analysing image with Gemini Vision AI…
                  </p>
                ) : (
                  <p className="text-green-400 text-sm font-medium flex items-center gap-2">
                    <span aria-hidden="true">✅</span>
                    Analysis complete
                  </p>
                )}
              </div>

              {/* Description cards */}
              <div className="grid gap-4 md:grid-cols-1">
                <DescriptionCard
                  id="literal"
                  title="Literal Description"
                  emoji="👁️"
                  content={literal}
                  isLoading={isLoading}
                  accentClass="text-brand-300"
                  gradientFrom="#6d28d9"
                  gradientTo="#8b5cf6"
                />
                <DescriptionCard
                  id="vibe"
                  title="Vibe Description"
                  emoji="✨"
                  content={vibe}
                  isLoading={isLoading}
                  accentClass="text-vibe-300"
                  gradientFrom="#c026d3"
                  gradientTo="#d946ef"
                />
              </div>

              {/* Read aloud button */}
              {!isLoading && (
                <div className="pt-4">
                  <ReadAloudButton literalText={literal} vibeText={vibe} />
                </div>
              )}
            </section>
          )}

          {/* Empty state */}
          {!hasResults && !error && (
            <div className="text-center py-16 animate-fade-in">
              <div
                className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center text-4xl"
                style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(192,38,211,0.15))', border: '1px solid rgba(167,139,250,0.15)' }}
                aria-hidden="true"
              >
                🎨
              </div>
              <h2 className="text-2xl font-bold text-brand-300 mb-2">Ready to vibe</h2>
              <p className="text-brand-600 max-w-sm mx-auto text-sm leading-relaxed">
                Upload any image — a meme, photo, artwork, or screenshot — and VibeVision will
                describe what's in it and capture the feeling behind it.
              </p>
            </div>
          )}
        </main>

        {/* ── Footer ── */}
        <footer className="text-center mt-12 text-brand-700 text-xs" role="contentinfo">
          <p>
            Built with ❤️ by <strong className="text-brand-500">Syntax Trio</strong> for Hack for Infinity 2K26
            &nbsp;·&nbsp; Powered by{' '}
            <a
              href="https://ai.google.dev/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Google Gemini AI (opens in new tab)"
              className="text-brand-400 hover:text-brand-300 underline underline-offset-2"
            >
              Google Gemini
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
