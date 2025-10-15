# YouSearch - Next.js 15 Application

Open Source AI Search Engine powered by You.com API - Built with Next.js 15, React, and TypeScript.

## Features

- **Modern Next.js 15 App Router** - Uses the latest App Router with server and client components
- **TypeScript** - Full type safety throughout the application
- **Real-time Search** - Fast, responsive search powered by You.com API
- **Multiple Output Formats** - View results as web cards, JSON, or LLM-friendly text
- **Beautiful UI** - Modern, responsive design with smooth animations
- **Server-Side API Routes** - Secure API key handling on the server

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: CSS (with CSS Variables for theming)
- **API**: You.com Search API
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm, yarn, or pnpm
- You.com API key ([Get one here](https://api.you.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/briansparker/yousearch.git
   cd yousearch
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.local.example .env.local
   ```

   Then edit `.env.local` and add your You.com API key:
   ```
   YOU_API_KEY=your_actual_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
yousearch/
├── app/                      # Next.js App Router
│   ├── api/                 # API Routes
│   │   ├── search/
│   │   │   └── route.ts    # Search endpoint
│   │   └── health/
│   │       └── route.ts    # Health check endpoint
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page (client component)
├── lib/
│   └── you-search.ts       # You.com API client
├── public/                  # Static assets
├── .env.local.example      # Environment variables template
├── next.config.js          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

## API Endpoints

### Search
- **GET** `/api/search?q=<query>&format=<json|text>`
- **POST** `/api/search` with JSON body: `{ "query": "...", "format": "json" }`

### Health Check
- **GET** `/api/health`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

### Deploy to Vercel

The easiest way to deploy this Next.js app is to use [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository to Vercel
3. Add your `YOU_API_KEY` environment variable in Vercel's project settings
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/briansparker/yousearch)

### Deploy to Other Platforms

This app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render
- DigitalOcean App Platform

Make sure to:
1. Set the `YOU_API_KEY` environment variable
2. Use Node.js 18+ runtime
3. Build command: `npm run build`
4. Start command: `npm run start`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `YOU_API_KEY` | Your You.com API key | Yes |

## Migration from Flask

This is a Next.js 15 refactor of the original Flask application. Key improvements:

- **Better Performance**: Server-side rendering and optimized React components
- **Type Safety**: Full TypeScript support
- **Modern Stack**: Latest Next.js 15 with App Router
- **Better DX**: Hot module replacement, fast refresh
- **Production Ready**: Built-in optimizations and best practices
- **Easier Deployment**: One-click deploy to Vercel

The original Flask version is still available in the repository (`app.py`, `templates/`, `static/`).

## API Key

Get your free You.com API key:
1. Visit [https://api.you.com/](https://api.you.com/)
2. Sign up for an account
3. Generate an API key
4. Add it to your `.env.local` file

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Powered by [You.com Search API](https://you.com)
- Built with [Next.js](https://nextjs.org/)
- Design inspiration from You.com platform

## Support

If you have any questions or run into issues, please open an issue on GitHub.

---

**Note**: This application requires an active You.com API key to function. The API key should be kept secure and never committed to version control.
