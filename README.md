# 👁️ VibeVision — See the Vibe

> **Hack for Infinity 2K26 · PS04: AI for Ability**
> Built by **Syntax Trio** | IEEE Computer Society OUCE Student Chapter

---

## 🏷️ Project Title

**VibeVision** — AI-powered image accessibility that helps blind and low-vision users understand not just *what* is in an image, but its mood, humour, and cultural context.

---

## 👥 Team Members

| Name | Role |
|------|------|
| Hanif | ImageInput component · analyzeImage API · App scaffold |
| Hassaan | DescriptionCard component · Header component |
| Vinay | ReadAloudButton component · useSpeech hook |

---

## ❓ Problem Statement

Blind and low-vision users relying on screen readers only receive basic alt text like "a funny image" — missing the humour, cultural references, or emotional tone that sighted users instantly grasp. This is especially painful with memes, social media content, and expressive photography.

VibeVision bridges this gap using Google Gemini Vision AI to provide a *dual description*: a factual **Literal Description** and a culturally-aware **Vibe Description** — both readable via browser text-to-speech.

---

## 🏗️ System Architecture

```
┌──────────────────────────────────┐
│         Browser (React SPA)      │
│                                  │
│  ImageInput (file / URL)         │
│       ↓                          │
│  analyzeImage.js                 │
│   └─ Gemini Vision API ──────────┼───► Google AI (gemini-1.5-flash)
│       ↓                          │
│  DescriptionCard × 2             │
│   (literal + vibe)               │
│       ↓                          │
│  ReadAloudButton                 │
│   └─ Web SpeechSynthesis API     │
└──────────────────────────────────┘
```

---

## 🛠️ Technologies Used

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5 |
| Styling | Tailwind CSS 3 |
| AI Vision | Google Gemini Vision API (`gemini-1.5-flash`) |
| Text-to-Speech | Web Speech API (`SpeechSynthesis`) |
| Deploy | Vercel |

---

## ⭐ Key Features

- 📁 **Image upload** via drag-and-drop or file picker
- 🔗 **URL paste** for any public image
- 👁️ **Literal Description** — factual, detailed image content
- ✨ **Vibe Description** — mood, humour, meme/cultural context
- 🔊 **Read Aloud** — browser TTS reads both descriptions
- ♿ **Full WCAG 2.1 AA accessibility** — aria-live, keyboard nav, skip links, focus indicators

---

## ⚙️ How It Works

1. User uploads an image file or pastes a public URL
2. Image is converted to base64 and sent to Gemini Vision API with a dual-output prompt
3. Gemini returns a JSON object with `literal` and `vibe` descriptions
4. Both appear in `aria-live="polite"` cards — screen readers auto-announce them
5. "Read Aloud" button uses `SpeechSynthesis` to narrate both descriptions

---

## 🚀 How to Run

```bash
# 1. Clone the repo
git clone https://github.com/Hack-for-Infinity/Syntax_Trio.git
cd Syntax_Trio

# 2. Install dependencies
npm install

# 3. Add your Gemini API key
echo "VITE_GEMINI_API_KEY=your_key_here" > .env
# Get a free key at: https://aistudio.google.com/app/apikey

# 4. Start the dev server
npm run dev
# Open http://localhost:5173
```

> **Deploy to Vercel:** Connect this repo on [vercel.com](https://vercel.com), add `VITE_GEMINI_API_KEY` as an environment variable, and deploy.

---

## ♿ Accessibility Highlights

- `aria-live="polite"` on both description cards
- Skip-to-content link as first focusable element
- `aria-label` on every interactive element
- `aria-pressed` on the Read Aloud toggle
- `:focus-visible` ring on all controls
- WCAG 2.1 AA colour contrast throughout
example
git clone <repo-url>
cd <project-folder>
# add your setup/run commands here
```
