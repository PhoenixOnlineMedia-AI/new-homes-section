# New Homes Section

A modern, SEO-optimized platform for searching and displaying new home communities, builders, and individual new homes for sale.

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn/UI](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: [Vercel](https://vercel.com/)

## 📁 Project Structure

```
newhomessection/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout with metadata
│   │   ├── page.tsx           # Homepage
│   │   ├── globals.css        # Global styles
│   │   ├── search/            # Search page
│   │   ├── [state]/           # Dynamic state routes
│   │   │   ├── page.tsx
│   │   │   └── [city]/        # Dynamic city routes
│   │   │       ├── page.tsx
│   │   │       └── [builderSlug]/  # Builder detail pages
│   │   │           └── page.tsx
│   │   ├── not-found.tsx      # Custom 404 page
│   │   ├── robots.ts          # Robots.txt generation
│   │   └── sitemap.ts         # Sitemap generation
│   ├── components/
│   │   ├── ui/                # Shadcn/UI components
│   │   ├── layout/            # Header, Footer, Navigation
│   │   ├── search/            # Search components
│   │   └── seo/               # SEO components (JsonLd)
│   ├── lib/
│   │   ├── utils.ts           # Utility functions (cn helper)
│   │   ├── constants.ts       # App constants
│   │   └── supabase/          # Supabase clients
│   │       ├── client.ts      # Browser client
│   │       ├── server.ts      # Server client
│   │       └── database.types.ts  # TypeScript types
│   └── types/
│       └── index.ts           # Shared TypeScript types
├── public/                    # Static assets
├── .env.local.example         # Environment variables template
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind configuration
└── package.json
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for database)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd newhomessection
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Add your Supabase credentials to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-side only) | No |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics ID | No |

## 🎨 Features

### SEO Optimized
- Dynamic metadata for all pages
- JSON-LD structured data (Schema.org)
- Automatic sitemap generation
- Robots.txt configuration
- Open Graph tags
- Twitter Cards

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Accessible components from Radix UI

### Route Structure
- `/` - Homepage with hero search
- `/search` - Search results page
- `/[state]` - State listing page (e.g., `/texas`)
- `/[state]/[city]` - City listing page (e.g., `/texas/austin`)
- `/[state]/[city]/[builderSlug]` - Builder detail page

### Database Schema

The app expects the following tables in Supabase:

- **builders** - Home builder information
- **communities** - New home communities
- **homes** - Individual home listings

See `src/lib/supabase/database.types.ts` for full type definitions.

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

The project is configured for static export in `next.config.ts`.

## 📚 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔧 Customization

### Adding New Shadcn Components

```bash
npx shadcn add [component-name]
```

### Updating Database Types

After modifying your Supabase schema:

```bash
npx supabase gen types typescript --project-id your-project-id --schema public > src/lib/supabase/database.types.ts
```

### Colors

The project uses a slate/emerald color scheme defined in `globals.css`:
- Primary: Emerald (emerald-600)
- Secondary: Slate (slate-900, slate-700, etc.)
- Background: White / Slate-50
- Accent: Emerald

## 📄 License

[MIT](LICENSE)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

---

Built with ❤️ by the New Homes Section team.
