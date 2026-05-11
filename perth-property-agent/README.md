# Perth Property Search Agent

A React app that uses Claude AI with web search to find Perth properties matching your criteria (4+ beds, 2+ baths, 2+ car parks) from realestate.com.au and property.com.au.

## Project structure

```
perth-property-agent/
├── api/
│   └── chat.js              # Vercel serverless proxy (keeps API key safe)
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx             # React entry point
│   ├── App.jsx              # App shell
│   ├── PerthPropertyAgent.jsx  # Main component
│   └── index.css            # Global styles
├── index.html
├── vite.config.js
├── vercel.json
├── .env.example
└── package.json
```

## Local development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up your API key**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your key from https://console.anthropic.com
   ```

3. **Run locally**
   ```bash
   npm run dev
   ```
   Open http://localhost:5173

   > Note: The `/api/chat` proxy won't work with `vite dev` alone — for local testing of the serverless function, install and use the Vercel CLI: `npm i -g vercel && vercel dev`

## Deploy to Vercel

### Option A — Vercel CLI (recommended)
```bash
npm i -g vercel
vercel
```
Follow the prompts, then add your environment variable:
```bash
vercel env add ANTHROPIC_API_KEY
```

### Option B — GitHub + Vercel dashboard
1. Push this folder to a GitHub repo
2. Go to https://vercel.com/new → import the repo
3. In **Settings → Environment Variables**, add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your key from https://console.anthropic.com
4. Click **Deploy**

That's it — Vercel handles everything else.

## How it works

- The React frontend calls `/api/chat` (never the Anthropic API directly)
- `api/chat.js` is a Vercel serverless function that adds your API key server-side and proxies the request to Anthropic
- Claude uses the `web_search` tool to browse realestate.com.au and property.com.au in real time
- Results are parsed from Claude's JSON response and rendered as property cards
