# ARIA - ABA Report & Intervention Assistant

An AI-powered assistant for creating comprehensive ABA assessment reports for BCBAs and behavior analysts.

## Features

- **Multi-Step Assessment Wizard**: Guided workflow through client info, assessment data, treatment goals, hours justification, and review
- **AI-Powered SMART Goals**: Generate and validate treatment goals using Claude AI
- **Insurance Compliance**: Pre-configured templates for Aetna, BCBS, UHC, Cigna, and more
- **Real-time Validation**: Inline validation with checkmarks and error messages
- **Draft Saving**: Auto-save drafts to localStorage
- **Mobile Responsive**: Optimized for smartphones and tablets
- **Professional UI**: Clean, modern interface with smooth animations

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + shadcn/ui
- **AI**: Anthropic Claude (via AI SDK)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Anthropic API key

### Installation

1. Clone the repository
\`\`\`bash
git clone https://github.com/yourusername/aria-aba-assistant.git
cd aria-aba-assistant
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables
\`\`\`bash
cp .env.example .env.local
\`\`\`

Add your Anthropic API key:
\`\`\`
ANTHROPIC_API_KEY=your_api_key_here
\`\`\`

4. Run the development server
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

\`\`\`
├── app/
│   ├── api/
│   │   ├── chat/              # AI chat endpoint
│   │   ├── aba-generate/      # ABA content generation
│   │   └── generate-content/  # Alternative content generation
│   ├── assessment/
│   │   └── new/               # Assessment wizard
│   ├── chat/                  # Chat helper page
│   ├── assessments/           # My assessments (placeholder)
│   ├── page.tsx               # Landing page
│   └── layout.tsx             # Root layout
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── navbar.tsx             # Global navigation
│   ├── chat-interface.tsx     # Chat component
│   └── icons.tsx              # Custom SVG icons
├── lib/
│   ├── ai-prompts.ts          # AI prompt templates
│   ├── aba-prompts.ts         # ABA-specific prompts
│   └── types.ts               # TypeScript types
└── public/                    # Static assets
\`\`\`

## Key Features

### Assessment Wizard

5-step guided workflow:
1. **Client Info**: Demographics, diagnosis, insurance
2. **Assessment Data**: Domain scores with auto-calculations
3. **Treatment Goals**: AI-generated SMART goals with validation
4. **Hours & Justification**: Service recommendations
5. **Review & Export**: Final review and PDF export

### AI Integration

- Claude Sonnet 4 for high-quality content generation
- SMART goal validation (0-100 scoring)
- Medical necessity statements
- Hours justification
- Insurance-specific compliance

### Rate Limiting

- 10 requests per minute per IP
- Protects against API abuse
- Edge runtime for optimal performance

## Deployment

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for complete deployment guide.

Quick deploy to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/aria-aba-assistant)

## Environment Variables

Required:
- `ANTHROPIC_API_KEY`: Your Anthropic API key

## License

MIT

## Support

For questions or issues, please open a GitHub issue or contact support.
