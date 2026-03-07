import { useState, useRef, useCallback } from 'react';

/**
 * useSpeech — custom hook wrapping the Web Speech API (SpeechSynthesis).
 *
 * @returns {{
 *   speak: (text: string) => void,
 *   stop: () => void,
 *   isSpeaking: boolean,
 *   isSupported: boolean
 * }}
 */
export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef(null);

  /** Whether the browser supports the Web Speech API */
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  /**
   * Speaks the given text using the browser's speech synthesis.
   * Cancels any ongoing speech before starting.
   * @param {string} text - The text to read aloud.
   */
  const speak = useCallback((text) => {
    if (!isSupported) return;

    // Cancel any in-progress speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    utterance.volume = 1;

    // Prefer a natural-sounding English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find((v) => v.name.toLowerCase().includes('natural') && v.lang.startsWith('en')) ||
      voices.find((v) => v.lang.startsWith('en-'));
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported]);

  /**
   * Stops any currently active speech synthesis.
   */
  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  return { speak, stop, isSpeaking, isSupported };
}
