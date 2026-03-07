import React, { useRef, useState, useCallback } from 'react';

/**
 * ImageInput — handles image input via file upload (drag-and-drop or click)
 * or URL paste. Previews the selected image. Fully keyboard-accessible.
 *
 * @param {{
 *   onFileSelect: (file: File) => void,
 *   onUrlSubmit: (url: string) => void,
 *   isLoading: boolean
 * }} props
 * @returns {JSX.Element}
 */
export default function ImageInput({ onFileSelect, onUrlSubmit, isLoading }) {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [activeTab, setActiveTab] = useState('file'); // 'file' | 'url'
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');

  /* ── File handling ── */

  const handleFile = useCallback(
    (file) => {
      if (!file || !file.type.startsWith('image/')) return;
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleFileChange = (e) => handleFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  /** Keyboard activation for drop zone */
  const handleDropZoneKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  /* ── URL handling ── */

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    setUrlError('');
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setUrlError('Please enter an image URL.');
      return;
    }
    try {
      new URL(trimmed); // basic validation
    } catch {
      setUrlError('Please enter a valid URL (starting with http:// or https://).');
      return;
    }
    setPreviewUrl(trimmed);
    onUrlSubmit(trimmed);
  };

  /* ── Tab styling helper ── */
  const tabClass = (tab) =>
    `flex-1 py-2 px-4 text-sm font-semibold rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
      activeTab === tab
        ? 'bg-brand-600 text-white shadow'
        : 'text-brand-300 hover:text-white hover:bg-brand-800/50'
    }`;

  return (
    <section
      aria-labelledby="input-heading"
      className="glass-card p-6 md:p-8 mb-6 animate-fade-in"
    >
      <h2
        id="input-heading"
        className="text-xl font-bold text-white mb-5 flex items-center gap-2"
      >
        <span aria-hidden="true" className="text-brand-400">🖼️</span>
        Upload or Link an Image
      </h2>

      {/* Tab switcher */}
      <div
        role="tablist"
        aria-label="Image input method"
        className="flex gap-2 mb-5 bg-brand-900/40 rounded-xl p-1"
      >
        <button
          role="tab"
          aria-selected={activeTab === 'file'}
          aria-controls="panel-file"
          id="tab-file"
          className={tabClass('file')}
          onClick={() => setActiveTab('file')}
        >
          📁 Upload File
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'url'}
          aria-controls="panel-url"
          id="tab-url"
          className={tabClass('url')}
          onClick={() => setActiveTab('url')}
        >
          🔗 Paste URL
        </button>
      </div>

      {/* File upload panel */}
      {activeTab === 'file' && (
        <div
          id="panel-file"
          role="tabpanel"
          aria-labelledby="tab-file"
        >
          <div
            role="button"
            tabIndex={0}
            aria-label="Drag and drop an image here, or press Enter to browse files"
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
              isDragOver
                ? 'drop-active border-brand-400'
                : 'border-brand-700/50 hover:border-brand-500 hover:bg-brand-900/20'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={handleDropZoneKey}
          >
            <div className="text-4xl mb-3" aria-hidden="true">☁️</div>
            <p className="text-brand-300 font-medium">
              Drop your image here, or{' '}
              <span className="text-brand-400 underline underline-offset-2">browse files</span>
            </p>
            <p className="text-brand-500 text-sm mt-1">PNG, JPG, GIF, WebP — up to 20 MB</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            aria-label="Choose image file"
            className="sr-only"
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* URL paste panel */}
      {activeTab === 'url' && (
        <div
          id="panel-url"
          role="tabpanel"
          aria-labelledby="tab-url"
        >
          <form onSubmit={handleUrlSubmit} noValidate>
            <label
              htmlFor="image-url-input"
              className="block text-sm font-medium text-brand-300 mb-2"
            >
              Public image URL
            </label>
            <div className="flex gap-2">
              <input
                id="image-url-input"
                type="url"
                aria-label="Paste a public image URL"
                aria-describedby={urlError ? 'url-error' : undefined}
                aria-invalid={!!urlError}
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setUrlError('');
                }}
                placeholder="https://example.com/image.jpg"
                className="flex-1 bg-brand-900/40 border border-brand-700/50 text-white placeholder-brand-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition"
              />
              <button
                type="submit"
                aria-label="Analyse image from URL"
                disabled={isLoading}
                className="px-5 py-2.5 rounded-lg font-semibold text-sm text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #c026d3)' }}
              >
                Analyse
              </button>
            </div>
            {urlError && (
              <p id="url-error" role="alert" className="mt-2 text-red-400 text-sm">
                {urlError}
              </p>
            )}
          </form>
        </div>
      )}

      {/* Image preview */}
      {previewUrl && (
        <div className="mt-5 animate-slide-up">
          <p className="text-brand-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Preview
          </p>
          <div className="rounded-xl overflow-hidden border border-brand-700/30 max-h-64">
            <img
              src={previewUrl}
              alt="Preview of the selected image that will be analysed"
              className="w-full h-full object-contain bg-black/20"
              onError={() => setPreviewUrl(null)}
            />
          </div>
        </div>
      )}
    </section>
  );
}
