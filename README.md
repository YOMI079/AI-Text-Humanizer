# 🚀 AI Text Humanizer

> Transform AI-generated content into natural, undetectable human writing

![AI Text Humanizer](https://img.shields.io/badge/Powered%20by-Gemini%202.5%20Flash-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- **🎯 Advanced Humanization** - Uses Gemini 2.5 Flash with extensive prompt engineering
- **✅ Verification System** - Tests output against AI detection patterns
- **🔄 Feedback Loop** - Automatically improves text until it passes verification (75% threshold)
- **📚 25 Examples** - Model learns from comprehensive before/after examples
- **🧠 Learning History** - Learns from your writing patterns over time
- **🎨 5 Writing Modes** - Casual, Professional, Academic, Creative, Conversational
- **⚙️ 3 Intensity Levels** - Light, Medium, Heavy transformation
- **💾 Local History** - All your conversions saved locally
- **📱 Responsive Design** - Works on all devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **AI Engine**: Google Gemini 2.5 Flash
- **API**: Next.js API Routes

## 🚀 Quick Start

### 1. Clone & Install

```bash
cd "c:\Users\Omprakash\Desktop\AI TEXT HUMANIZER"
npm install
```

### 2. Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy the key

### 3. Configure Environment

Edit `.env.local` and add your API key:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 How It Works

### 1. Humanization Process

```
┌─────────────────────────────────────────────────────────┐
│                    User Input Text                       │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│              HUMANIZER ENGINE (Gemini)                   │
│  • 17 Humanization Commandments                         │
│  • 25 Before/After Examples                             │
│  • Mode-specific Instructions                           │
│  • User History Learning                                │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│             VERIFICATION AGENT (Gemini)                  │
│  • 10 Scoring Criteria                                  │
│  • AI Pattern Detection                                 │
│  • Detailed Issue Identification                        │
└─────────────────────┬───────────────────────────────────┘
                      ▼
              Score >= 75%?
              /           \
           Yes             No
            ▼               ▼
     ┌──────────┐   ┌────────────────────┐
     │  OUTPUT  │   │ IMPROVEMENT LOOP   │
     │  READY   │   │ (Max 3 attempts)   │
     └──────────┘   │ Feed issues back   │
                    └────────────────────┘
```

### 2. Verification Criteria

The verification agent scores text on 10 weighted criteria:

| Criteria | Weight | What It Checks |
|----------|--------|----------------|
| Perplexity | 15% | Word choice unpredictability |
| Burstiness | 15% | Sentence length variation |
| Emotional Authenticity | 12% | Genuine personality |
| Structural Variety | 10% | Organic flow |
| Conversational Markers | 10% | Natural speech patterns |
| Specificity | 8% | Concrete examples |
| Hedging & Uncertainty | 8% | Natural qualifiers |
| Transition Naturalness | 7% | Casual connectors |
| First-Person Voice | 7% | Personal authenticity |
| Micro-Patterns | 8% | Stylistic quirks |

### 3. Writing Modes

| Mode | Best For |
|------|----------|
| **Casual** | Blog posts, social media, personal writing |
| **Professional** | Business emails, reports, presentations |
| **Academic** | Essays, research papers, scholarly content |
| **Creative** | Fiction, poetry, artistic expression |
| **Conversational** | Chat responses, informal communication |

## 📁 Project Structure

```
AI TEXT HUMANIZER/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── humanize/      # Main humanization endpoint
│   │   │   ├── verify/        # Verification-only endpoint
│   │   │   └── quick-humanize/# Fast mode (no verification)
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── TextEditor.tsx
│   │   ├── SettingsPanel.tsx
│   │   ├── ProcessingStatus.tsx
│   │   ├── ResultsPanel.tsx
│   │   ├── HistoryPanel.tsx
│   │   └── Footer.tsx
│   └── lib/
│       ├── prompts/
│       │   ├── humanizer-prompt.ts  # 25 examples + instructions
│       │   └── verification-prompt.ts
│       ├── gemini.ts          # Gemini API client
│       ├── humanizer.ts       # Core processing engine
│       ├── history.ts         # History management
│       ├── store.ts           # Zustand state
│       ├── types.ts           # TypeScript types
│       └── utils.ts           # Utility functions
├── .env.local                 # API key configuration
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## 🔧 API Endpoints

### POST /api/humanize

Full humanization with verification loop.

```typescript
// Request
{
  text: string;           // Text to humanize
  mode: 'casual' | 'professional' | 'academic' | 'creative' | 'conversational';
  intensity: 'light' | 'medium' | 'heavy';
  preserveKeyPoints: boolean;
  targetAudience?: string;
  userHistory?: string[]; // Previous humanized texts for learning
}

// Response
{
  success: boolean;
  data: {
    finalText: string;
    finalScore: number;
    attempts: Array<{
      attemptNumber: number;
      humanizedText: string;
      verificationScore: number;
      passed: boolean;
    }>;
    totalProcessingTime: number;
  }
}
```

### POST /api/quick-humanize

Fast humanization without verification.

### POST /api/verify

Verify text for AI detection patterns.

## 🎯 Best Practices

1. **Use Appropriate Mode**: Match the mode to your content type
2. **Start with Medium Intensity**: Adjust based on results
3. **Provide Feedback**: 👍/👎 ratings improve future results
4. **Use History**: The more you use it, the better it learns your style
5. **Review Output**: Always read through the humanized text

## 🔒 Privacy

- All processing is done via API calls to Google Gemini
- History is stored locally in your browser (localStorage)
- No data is sent to any server other than Google's Gemini API
- Your API key is stored only in your local environment

## 📝 License

MIT License - feel free to use for any purpose.

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

---

**Built with ❤️ using Next.js and Gemini 2.5 Flash**
