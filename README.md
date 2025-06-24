# Create Turbo Sanity

A modern Turborepo starter template with Next.js 15 and Sanity CMS.

## What's Inside?

This turborepo includes the following packages/apps:

### Apps and Packages

- `web`: a [Next.js](https://nextjs.org/) app with [Tailwind CSS](https://tailwindcss.com/)
- `studio`: a [Sanity Studio](https://www.sanity.io/) app for content management
- `@workspace/eslint-config`: shared `eslint` configurations
- `@workspace/typescript-config`: shared `tsconfig.json`s used throughout the monorepo

### Utilities

This turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

## Getting Started

### Prerequisites

- Node.js 20 or later
- [pnpm](https://pnpm.io/) package manager
- A [Sanity.io](https://www.sanity.io/) account

### Setup

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd create-turbo-sanity
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up Sanity**

   Create a new Sanity project at [sanity.io/manage](https://www.sanity.io/manage) and note your:
   - Project ID
   - Dataset name (usually 'production' or 'development')

4. **Configure environment variables**

   Copy the environment files and fill in your Sanity details:

   ```bash
   # Root environment
   cp env.example .env.local

   # Web app environment
   cp apps/web/env.example apps/web/.env.local

   # Studio environment
   cp apps/studio/env.example apps/studio/.env.local
   ```

   Update the following variables in all `.env.local` files:

   ```bash
   NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
   NEXT_PUBLIC_SANITY_DATASET=production
   SANITY_API_READ_TOKEN=your-read-token # Optional, for private datasets
   ```

5. **Update Sanity configuration**

   Edit the following files to match your project:
   - `apps/studio/sanity.config.ts` - Update project name and title
   - `apps/studio/sanity.cli.ts` - Update studioHost

6. **Start development servers**

   ```bash
   pnpm dev
   ```

   This will start:
   - Web app: http://localhost:3000
   - Sanity Studio: http://localhost:3333

## Project Structure

```
├── apps/
│   ├── web/           # Next.js frontend
│   └── studio/        # Sanity Studio CMS
├── packages/
│   ├── eslint-config/ # Shared ESLint config
│   └── typescript-config/ # Shared TypeScript config
├── package.json       # Root package.json
├── turbo.json        # Turborepo configuration
└── pnpm-workspace.yaml # PNPM workspace configuration
```

## Development

### Available Scripts

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all packages and apps
- `pnpm lint` - Lint all packages and apps
- `pnpm typecheck` - Type check all packages and apps
- `pnpm format` - Format code with Prettier
- `pnpm sanity:deploy` - Deploy Sanity Studio
- `pnpm sanity:typegen` - Generate TypeScript types from Sanity schema

### Adding Content

1. Start the development servers with `pnpm dev`
2. Visit the Sanity Studio at http://localhost:3000/studio
3. Create your first post and author
4. Visit http://localhost:3000 to see your content

## Deployment

### Deploying the Web App

The easiest way to deploy the Next.js app is to use [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your environment variables in Vercel's dashboard
4. Deploy!

### Deploying Sanity Studio

Deploy your Sanity Studio to make it accessible to content editors:

```bash
cd apps/studio
pnpm sanity deploy
```

## Built With

- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[Sanity](https://www.sanity.io/)** - Headless CMS
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Turborepo](https://turbo.build/)** - High-performance build system
- **[TypeScript](https://www.typescriptlang.org/)** - Static type checking
- **[PNPM](https://pnpm.io/)** - Fast, disk space efficient package manager

## Features

- 🚀 **Modern Stack**: Next.js 15 with App Router, React 19, TypeScript
- 📝 **Content Management**: Sanity Studio with rich content types
- 🎨 **Styling**: Tailwind CSS with Typography plugin
- 🔧 **Developer Experience**: ESLint, Prettier, Hot Module Reloading
- 📦 **Monorepo**: Organized with Turborepo for scalability
- 🌐 **SEO Ready**: Meta tags, Open Graph, structured data
- 📱 **Responsive**: Mobile-first design
- ⚡ **Performance**: Optimized images, static generation, CDN ready

## License

MIT
