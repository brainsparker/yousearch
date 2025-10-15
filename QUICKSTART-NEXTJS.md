# Quick Start Guide - Next.js Version

Get up and running with YouSearch Next.js in 2 minutes!

## Prerequisites

- Node.js 18.0 or higher
- You.com API key ([Get one here](https://api.you.com/))

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Your API Key

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your You.com API key:

```env
YOU_API_KEY=your_actual_api_key_here
```

### 3. Start the Development Server

```bash
npm run dev
```

### 4. Open Your Browser

Navigate to [http://localhost:3000](http://localhost:3000)

## That's It!

You should now see the YouSearch interface. Try searching for something like "Latest news on AI" or click one of the example cards.

## What You Can Do

- **Search**: Type any query in the search box
- **View Modes**: Toggle between Visual and Code view
- **Output Formats**: Choose between Web View, JSON, or LLM Format
- **Example Queries**: Click on any of the example cards to search

## Building for Production

```bash
npm run build
npm run start
```

## Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/briansparker/yousearch)

Remember to add your `YOU_API_KEY` environment variable in Vercel's project settings!

## Troubleshooting

**Problem**: "API key is required" error
**Solution**: Make sure you've created `.env.local` and added your API key

**Problem**: Port 3000 is already in use
**Solution**: Stop the other process or use a different port: `PORT=3001 npm run dev`

**Problem**: Module not found errors
**Solution**: Delete `node_modules` and `.next` folders, then run `npm install` again

## Next Steps

- Check out the full [README-NEXTJS.md](README-NEXTJS.md) for more details
- Explore the API routes in `app/api/`
- Customize the UI in `app/page.tsx` and `app/globals.css`
- Deploy your application to Vercel or another hosting platform

## Support

For issues or questions, please open an issue on [GitHub](https://github.com/briansparker/yousearch/issues).
