# Create Turbo Sanity

A professional-grade package for scaffolding modern Turborepo + Next.js + Sanity CMS projects.

## Quick Start

Create a new project with a single command:

```bash
npm create turbo-sanity my-app
```

This will:

1. 🔐 Authenticate you with Sanity
2. 📋 Let you select or create a Sanity project
3. 📊 Set up datasets for your content
4. 🏗️ Generate a complete monorepo with Next.js and Sanity Studio
5. ⚙️ Configure environment variables automatically
6. 📦 Install all dependencies

## What You Get

### Project Structure

```
my-app/
├── apps/
│   ├── web/           # Next.js 15 app with App Router
│   └── studio/        # Sanity Studio CMS
├── packages/
│   ├── eslint-config/ # Shared ESLint configuration
│   └── typescript-config/ # Shared TypeScript configuration
├── turbo.json         # Turborepo configuration
└── package.json       # Workspace configuration
```

### Tech Stack

- **[Next.js 15](https://nextjs.org/)** - React framework with App Router and React 19
- **[Sanity](https://www.sanity.io/)** - Headless CMS with real-time collaboration
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Turborepo](https://turbo.build/)** - High-performance build system for monorepos
- **[TypeScript](https://www.typescriptlang.org/)** - Static type checking
- **[PNPM](https://pnpm.io/)** - Fast, disk space efficient package manager

### Features

- 🚀 **Modern Development**: Latest Next.js with App Router, React 19, TypeScript
- 📝 **Content Management**: Full-featured Sanity Studio with rich content editing
- 🎨 **Beautiful UI**: Tailwind CSS with Typography plugin for blog-style content
- 🔧 **Developer Experience**: ESLint, Prettier, Hot Module Reloading
- 📦 **Monorepo Ready**: Organized with Turborepo for easy scaling
- 🌐 **SEO Optimized**: Meta tags, Open Graph, structured data out of the box
- 📱 **Responsive Design**: Mobile-first approach with modern CSS
- ⚡ **Performance**: Optimized images, static generation, CDN ready
- 🔒 **Type Safety**: End-to-end TypeScript with Sanity schema generation

## CLI Options

```bash
npm create turbo-sanity [project-name] [options]
```

### Options

- `--project <projectId>` - Use specific Sanity project ID
- `--dataset <dataset>` - Use specific dataset name
- `--organization <orgId>` - Use specific Sanity organization
- `--template <template>` - Project template (default: 'default')
- `--package-manager <manager>` - Package manager: npm, yarn, pnpm (default: pnpm)
- `--yes` - Skip interactive prompts, use defaults

### Examples

```bash
# Interactive setup (recommended)
npm create turbo-sanity my-blog

# With specific options
npm create turbo-sanity my-blog --project abc123 --dataset production

# Unattended installation
npm create turbo-sanity my-blog --yes --project abc123 --dataset production
```

## Development

After creating your project:

```bash
cd my-blog
pnpm dev
```

This starts:

- **Next.js app**: http://localhost:3000
- **Sanity Studio**: http://localhost:3333

### Available Scripts

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all apps and packages
- `pnpm lint` - Lint all code
- `pnpm typecheck` - Type check all packages
- `pnpm sanity:deploy` - Deploy Sanity Studio
- `pnpm sanity:typegen` - Generate TypeScript types from schema

## Deployment

### Next.js App (Vercel - Recommended)

1. Push your code to GitHub
2. Import repository in [Vercel](https://vercel.com)
3. Environment variables are automatically configured
4. Deploy!

### Sanity Studio

```bash
pnpm sanity:deploy
```

Your studio will be available at `https://your-project.sanity.studio`

### Other Platforms

The generated project works with any Node.js hosting provider:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Development setup
- Commit conventions
- Release process
- Testing guidelines

## Automatic Updates

This project uses [Renovate](https://renovatebot.com/) to keep dependencies up-to-date automatically. Updates are grouped by category and scheduled weekly.

## Versioning

This project follows [Semantic Versioning](https://semver.org/) with automated releases:

- `feat:` commits trigger minor releases (1.1.0)
- `fix:` commits trigger patch releases (1.0.1)
- `feat!:` commits trigger major releases (2.0.0)

## Requirements

- **Node.js** 22 or later
- **Package Manager**: npm, yarn, or pnpm
- **Sanity Account**: Free at [sanity.io](https://www.sanity.io/)

## Support

- 📚 [Documentation](https://github.com/rcmaples/create-turbo-sanity/blob/main/README.md)
- 🐛 [Report Issues](https://github.com/rcmaples/create-turbo-sanity/issues)
- 💬 [Discussions](https://github.com/rcmaples/create-turbo-sanity/discussions)
- 🚀 [Sanity Community](https://www.sanity.io/community)

## License

MIT License
