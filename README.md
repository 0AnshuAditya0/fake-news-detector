# 🛡️ Fake News Detector

An AI-powered web application built with Next.js 14 that detects misinformation and fake news using machine learning and multi-signal analysis.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-38bdf8)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

### Core Functionality
- ** AI-Powered Analysis**: Uses HuggingFace's RoBERTa model for fake news classification
- ** Intelligent Caching**: 60x faster responses with LRU cache (< 50ms for cached requests)
- ** Automatic Retry Logic**: 3 attempts with exponential backoff for API reliability
- ** Multi-Signal Detection**: Combines 5 different analysis methods:
  - Machine Learning prediction
  - Sentiment analysis (emotional manipulation detection)
  - Clickbait pattern recognition
  - Source credibility verification
  - Political bias detection
- ** URL & Text Analysis**: Analyze articles by URL or paste text directly
- ** Real-Time Results**: Get instant credibility scores (0-100) with detailed explanations
- ** Local Storage**: Automatic saving of analysis history
- ** Responsive Design**: Works seamlessly on desktop, tablet, and mobile

### Advanced Features
- **Text Highlighting**: Visual indicators for suspicious phrases with hover tooltips
- **Credibility Meter**: Animated circular gauge showing risk level
- **Analytics Dashboard**: Track statistics and trends across analyses
- **Admin Dashboard**: Real-time monitoring with cache stats and API metrics
- **Export Reports**: Download analysis results as text files
- **Share Results**: Native share functionality for results
- **Rate Limiting**: Built-in API rate limiting (10 requests/minute)
- **Performance Monitoring**: Track cache hit rates, API failures, and response times

## Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- HuggingFace API key (free tier available)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd fake-news
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:
```env
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

To get a HuggingFace API key:
- Visit [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
- Create a free account
- Generate a new access token

4. **Run the development server**
```bash
npm run dev
# or
yarn dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
fake-news/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts      # Main analysis endpoint
│   │   ├── scrape/route.ts       # URL content extraction
│   │   └── source/route.ts       # Source credibility check
│   ├── analyze/[id]/page.tsx     # Results page
│   ├── dashboard/page.tsx        # Analytics dashboard
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Homepage
│   └── globals.css               # Global styles
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── AnalysisForm.tsx          # Input form component
│   ├── CredibilityMeter.tsx      # Circular gauge component
│   ├── ResultCard.tsx            # Analysis results display
│   ├── TextHighlighter.tsx       # Highlighted text component
│   ├── DashboardStats.tsx        # Statistics cards
│   └── RecentAnalyses.tsx        # Analysis history
├── lib/
│   ├── ml-service.ts             # ML analysis logic
│   ├── scraper.ts                # Web scraping utilities
│   ├── types.ts                  # TypeScript interfaces
│   └── utils.ts                  # Helper functions
├── public/                       # Static assets
├── .env.local                    # Environment variables
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality React components
- **Recharts**: Data visualization library
- **Lucide React**: Icon library

### Backend & APIs
- **Next.js API Routes**: Serverless API endpoints
- **HuggingFace Inference API**: ML model hosting
- **Cheerio**: Web scraping library
- **Axios**: HTTP client

### ML & Analysis
- **RoBERTa Model**: `hamzab/roberta-fake-news-classification`
- **Rule-Based Detection**: Custom algorithms for clickbait, sentiment, and bias

## How It Works

### Analysis Pipeline

1. **Input Processing**
   - User submits URL or text
   - If URL: scrape content using Cheerio
   - Validate and clean text

2. **Multi-Signal Analysis**
   ```
   ML Score (35%) ────┐
   Clickbait (15%) ───┤
   Sentiment (15%) ───┼──→ Overall Score (0-100)
   Bias (15%) ────────┤
   Source (20%) ──────┘
   ```

3. **ML Classification**
   - Send text to HuggingFace RoBERTa model
   - Get FAKE/REAL prediction with confidence

4. **Rule-Based Checks**
   - **Clickbait**: Detect patterns like "You won't believe", numbers, excessive punctuation
   - **Sentiment**: Flag emotional manipulation keywords
   - **Bias**: Identify politically charged language
   - **Source**: Check domain against credibility lists

5. **Result Generation**
   - Calculate weighted overall score
   - Generate plain English explanation
   - Highlight suspicious phrases
   - Provide actionable insights

### Credibility Scoring

- **0-39**: High Risk (likely FAKE)
- **40-69**: Medium Risk (UNCERTAIN)
- **70-100**: Low Risk (likely REAL)

## UI Components

### CredibilityMeter
Animated circular gauge with color-coded risk levels:
- Red (< 40): High Risk
- Yellow (40-69): Medium Risk
- Green (> 70): Low Risk

### TextHighlighter
Highlights suspicious phrases with color-coded categories:
- Red: Fake indicators
- Yellow: Bias
- Orange: Clickbait
- Purple: Emotional language

### AnalysisForm
Tabbed interface for URL and text input with:
- URL validation
- Character counter
- Paste from clipboard
- Loading states

## Security & Best Practices

- **Rate Limiting**: 10 requests per minute per IP
- **Input Validation**: URL and text sanitization
- **Error Handling**: Comprehensive try-catch blocks
- **API Key Security**: Environment variables only
- **Client-Side Storage**: localStorage for demo purposes

## Analytics Dashboard

Track your analysis history with:
- Total analyses count
- Fake news detection percentage
- Average confidence scores
- Most analyzed domains
- Distribution pie chart
- Recent analyses table
- Top red flags

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `HUGGINGFACE_API_KEY`
   - `NEXT_PUBLIC_APP_URL`
4. Deploy!

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- AWS Amplify
- DigitalOcean App Platform

## Testing

### Manual Testing Checklist

- [ ] Analyze a URL from a credible source (e.g., Reuters)
- [ ] Analyze a URL from an unreliable source
- [ ] Paste text with clickbait patterns
- [ ] Test with short text (< 50 chars) - should error
- [ ] Test with very long text (> 5000 chars) - should truncate
- [ ] Check dashboard statistics update
- [ ] Test share and download features
- [ ] Verify responsive design on mobile

### Example Test URLs

**Credible Sources:**
- https://www.reuters.com/world/
- https://apnews.com/
- https://www.bbc.com/news

**Test with caution - for testing only:**
- Search for known satirical sites

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **HuggingFace** for providing the ML model API
- **shadcn/ui** for beautiful React components
- **Next.js team** for the amazing framework
- **Vercel** for hosting platform

## Contact

For questions or feedback, please open an issue on GitHub.

## Future Enhancements

- [ ] User authentication and accounts
- [ ] Chrome extension for in-browser analysis
- [ ] Batch URL analysis
- [ ] PDF export with charts
- [ ] API for developers
- [ ] Multi-language support
- [ ] Fact-checking database integration
- [ ] Social media post analysis
- [ ] Browser history scanning

## Disclaimer

This tool is designed to assist in identifying potential misinformation but should not be the sole source of truth. Always:
- Verify important information with multiple trusted sources
- Consider the context and nuance of news stories
- Use critical thinking when consuming media
- Understand that AI models can make mistakes

---

