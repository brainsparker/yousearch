# Migration Guide: Flask to Next.js 15

This document explains the migration from the Flask application to Next.js 15.

## Architecture Changes

### Before (Flask)

```
├── app.py                 # Flask server with routes
├── you_search.py          # Python API client
├── templates/
│   └── index.html        # Jinja2 template
└── static/
    ├── css/style.css     # Styles
    └── js/app.js         # Vanilla JavaScript
```

### After (Next.js 15)

```
├── app/
│   ├── api/
│   │   └── search/route.ts    # API routes
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Main page (React)
│   └── globals.css            # Global styles
└── lib/
    └── you-search.ts          # TypeScript API client
```

## Key Changes

### 1. Server-Side Framework

**Flask → Next.js 15 App Router**
- Server routes moved to API routes (`app/api/*/route.ts`)
- Template rendering replaced with React components
- Built-in TypeScript support

### 2. Frontend

**Vanilla JS → React with TypeScript**
- DOM manipulation → React state and hooks
- `document.getElementById()` → `useState` and refs
- Event listeners → React event handlers
- Template strings → JSX

### 3. API Client

**Python → TypeScript**
- `requests` library → `fetch` API
- Python classes → TypeScript classes with interfaces
- Type hints → TypeScript types

### 4. Styling

**No changes needed!**
- Same CSS file, just moved to `app/globals.css`
- All CSS classes and variables preserved

## Code Comparison

### Server Route Handler

**Flask (Python)**
```python
@app.route('/search')
def search():
    query = request.args.get('q')
    client = YouSearchClient()
    results = client.search(query)
    return jsonify({'query': query, 'results': results})
```

**Next.js (TypeScript)**
```typescript
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');
  const client = new YouSearchClient();
  const results = await client.search(query);
  return NextResponse.json({ query, results });
}
```

### Frontend Search Handler

**Vanilla JS**
```javascript
searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  const response = await fetch(`/search?q=${encodeURIComponent(query)}`);
  const data = await response.json();
  displayResults(data);
});
```

**React**
```typescript
const handleSearch = async (e: FormEvent) => {
  e.preventDefault();
  const query = searchQuery.trim();
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  const data = await response.json();
  setResults(data);
};
```

### DOM Manipulation

**Vanilla JS**
```javascript
const resultDiv = document.createElement('div');
resultDiv.className = 'result-item';
resultDiv.innerHTML = `<h3>${result.title}</h3>`;
resultsContainer.appendChild(resultDiv);
```

**React**
```tsx
const ResultItem = ({ result }) => (
  <div className="result-item">
    <h3>{result.title}</h3>
  </div>
);
```

## Benefits of Next.js Version

### Performance
- **Server-Side Rendering**: Faster initial page loads
- **Code Splitting**: Automatic optimization
- **Image Optimization**: Built-in (if we add images)
- **Caching**: Intelligent fetch caching

### Developer Experience
- **Type Safety**: Catch errors at compile time
- **Hot Reload**: Instant updates during development
- **Better IDE Support**: IntelliSense and autocomplete
- **Modern Tooling**: Latest React features

### Production Ready
- **Built-in Optimization**: Minification, compression, etc.
- **Easy Deployment**: One-click deploy to Vercel
- **Environment Variables**: Better secrets management
- **API Routes**: No need for separate backend

### Scalability
- **Component Reusability**: Easy to extend
- **Testing**: Better testing tools available
- **State Management**: Can easily add Redux/Zustand if needed
- **Internationalization**: Built-in i18n support

## Running Both Versions

### Flask Version
```bash
python app.py
# Runs on http://localhost:5001
```

### Next.js Version
```bash
npm run dev
# Runs on http://localhost:3000
```

Both versions can coexist in the same repository!

## Deployment Comparison

### Flask Deployment
- Requires Python runtime
- Need WSGI server (Gunicorn, uWSGI)
- Manual configuration for production
- Common platforms: Heroku, AWS, DigitalOcean

### Next.js Deployment
- Single `npm run build` command
- Optimized production build
- One-click deploy to Vercel
- Also works on: Netlify, AWS Amplify, Railway, Render

## Environment Variables

### Flask
```
# .env
YOU_API_KEY=your_key_here
```

### Next.js
```
# .env.local
YOU_API_KEY=your_key_here
```

**Note**: Next.js uses `.env.local` for local development and environment variables in hosting platform for production.

## API Compatibility

Both versions expose the same API endpoints:

- `GET /search?q=query` or `GET /api/search?q=query`
- `POST /search` or `POST /api/search`

The Next.js version adds the `/api/` prefix to distinguish API routes from pages.

## What Stayed the Same

- ✅ All CSS styling (100% preserved)
- ✅ API functionality
- ✅ Search features
- ✅ UI/UX design
- ✅ Output formats (Web, JSON, LLM)

## What Changed

- ⚡ Framework: Flask → Next.js
- 📝 Language: Python/JS → TypeScript
- ⚛️ Frontend: Vanilla JS → React
- 🎯 Type Safety: None → Full TypeScript
- 🚀 Deployment: Manual → One-click

## Recommendation

**Use Next.js version if:**
- You want modern React architecture
- Type safety is important
- Easy deployment is a priority
- You're building a larger application

**Use Flask version if:**
- You prefer Python
- You have existing Python infrastructure
- You want simpler server architecture
- Your team is more familiar with Flask

## Questions?

Open an issue on GitHub if you have questions about the migration!
