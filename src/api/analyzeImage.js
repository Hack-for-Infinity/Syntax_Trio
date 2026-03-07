/**
 * analyzeImage.js
 * Sends an image to the Google Gemini Vision API and returns a structured
 * { literal, vibe } description object.
 *
 * Supports:
 *   - File upload  → converts to base64 inline data
 *   - URL paste    → fetches and converts to base64 inline data
 *
 * Model fallback order (confirmed live via ListModels API, Mar 2026):
 *   gemini-2.0-flash-lite → gemini-2.5-flash-lite → gemini-2.0-flash → gemini-2.5-flash
 *
 * @module analyzeImage
 */

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Models tried in order — lightest/cheapest first to conserve free-tier quota.
 * All confirmed present via ListModels API with generateContent support.
 */
const MODEL_FALLBACKS = [
  'gemini-flash-latest',     // Stable alias → always latest Gemini Flash release
  'gemini-2.0-flash-lite',   // Lightest fallback
  'gemini-2.5-flash-lite',   // Lite-tier fallback
  'gemini-2.0-flash',        // Standard fallback
];

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Converts a File object to a base64-encoded string.
 * @param {File} file - The image file to convert.
 * @returns {Promise<{base64: string, mimeType: string}>}
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // result is "data:image/png;base64,XXXXXXX"
      const [header, base64] = reader.result.split(',');
      const mimeType = header.match(/:(.*?);/)[1];
      resolve({ base64, mimeType });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Fetches a remote image URL and converts it to base64.
 * @param {string} url - The public image URL.
 * @returns {Promise<{base64: string, mimeType: string}>}
 */
async function urlToBase64(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
  const blob = await response.blob();
  const mimeType = blob.type || 'image/jpeg';
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const [, base64] = reader.result.split(',');
      resolve({ base64, mimeType });
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * The dual-output prompt sent to Gemini.
 * Instructs the model to return ONLY valid JSON with `literal` and `vibe` keys.
 */
const PROMPT = `You are VibeVision, an accessibility AI assistant helping blind and low-vision users understand images in rich depth.

Analyse the provided image and respond with ONLY a valid JSON object (no markdown, no code block, no extra text) in exactly this format:
{
  "literal": "A factual, detailed description of what is physically in the image — objects, people, text, layout, colours, and any visible actions. Be precise and thorough (3-5 sentences).",
  "vibe": "The emotional tone, humour, cultural context, internet/meme culture references, aesthetic mood, and overall 'vibe' of the image. Explain any jokes, references, or cultural nuances a sighted person would immediately 'get'. Be warm and engaging (3-5 sentences)."
}`;

/**
 * Analyses an image using the Gemini Vision API.
 *
 * @param {File|null} file - An image File object (from file upload). Pass null if using URL.
 * @param {string|null} imageUrl - A public image URL. Pass null if using file.
 * @returns {Promise<{literal: string, vibe: string}>} The dual descriptions.
 * @throws {Error} If the API call fails or the response is malformed.
 */
export async function analyzeImage(file, imageUrl) {
  if (!API_KEY) {
    throw new Error('Gemini API key is missing. Add VITE_GEMINI_API_KEY to your .env file.');
  }

  // Convert to base64
  let base64, mimeType;
  if (file) {
    ({ base64, mimeType } = await fileToBase64(file));
  } else if (imageUrl) {
    ({ base64, mimeType } = await urlToBase64(imageUrl));
  } else {
    throw new Error('Provide either a file or a URL.');
  }

  // Build Gemini request body
  const requestBody = {
    contents: [
      {
        parts: [
          { text: PROMPT },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  };

  // Try each model in fallback order
  let lastError = null;
  for (const model of MODEL_FALLBACKS) {
    const url = `${GEMINI_BASE}/${model}:generateContent?key=${API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (response.status === 429) {
      // Rate limited on this model — parse the error to find the cause
      let retryMsg = '';
      let isZeroLimit = false;
      try {
        const errJson = await response.json();
        const violations = errJson?.error?.details?.find(
          (d) => d['@type']?.includes('QuotaFailure')
        )?.violations ?? [];
        // Detect "limit: 0" — meaning the project's daily free-tier quota is fully exhausted
        isZeroLimit = violations.some((v) => v.quotaId?.includes('PerDay'));
        const retryDelay = errJson?.error?.details?.find(
          (d) => d['@type']?.includes('RetryInfo')
        )?.retryDelay;
        if (retryDelay) retryMsg = ` Retry in ${retryDelay}.`;
      } catch { /* ignore parse error */ }

      if (isZeroLimit) {
        // Daily quota exhausted — no point trying other models for today
        throw new Error(
          `Your Gemini API key's free-tier daily quota is exhausted for today. ` +
          `To fix this: go to https://aistudio.google.com/app/apikey, ` +
          `create a new key under a different Google account, ` +
          `and update VITE_GEMINI_API_KEY in your .env file.`
        );
      }

      lastError = new Error(
        `Rate limit on ${model}.${retryMsg} Trying next model…`
      );
      continue; // try fallback
    }

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    // ── Success path ──────────────────────────────────────────────────────────
    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('Empty response from Gemini API.');

    const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error(`Could not parse Gemini response as JSON.\n\nRaw: ${rawText}`);
    }

    if (!parsed.literal || !parsed.vibe) {
      throw new Error('Gemini response is missing "literal" or "vibe" fields.');
    }

    return { literal: parsed.literal, vibe: parsed.vibe };
  }

  // All models exhausted
  throw lastError || new Error('All Gemini models are currently rate-limited. Please wait a minute and try again.');
}
