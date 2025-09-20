# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a CLI package (`create-turbo-sanity`) that scaffolds modern Turborepo + Next.js + Sanity CMS projects. The generated projects follow a monorepo structure with strict conventions and automated tooling.

## Essential Commands

### Development
- `pnpm dev` - Start all development servers (Next.js at :3000, Sanity Studio at :3333)
- `pnpm build` - Build all apps and packages
- `pnpm lint` - Lint all code using Turbo
- `pnpm lint:fix` - Lint and auto-fix all code
- `pnpm typecheck` - Type check all packages
- `pnpm test` - Run tests across all packages
- `pnpm format` - Format code with Prettier

### Sanity-specific
- `pnpm sanity:deploy` - Deploy Sanity Studio (runs `turbo run deploy --filter=studio`)
- `pnpm sanity:typegen` - Generate TypeScript types from Sanity schema

### Release & Git
- `pnpm commit` - Use Commitizen for conventional commits
- `pnpm release` - Automated semantic release (CI only)

## Architecture

### Monorepo Structure
- **`packages/create-turbo-sanity/`** - Main CLI package that scaffolds projects
- **`apps/web/`** - Example Next.js 15 app with App Router and React 19
- **`apps/studio/`** - Example Sanity Studio CMS
- **`packages/eslint-config/`** - Shared ESLint configuration
- **`packages/typescript-config/`** - Shared TypeScript configuration

### Key Technologies
- **Turborepo** - Build system orchestrating the monorepo
- **PNPM** - Package manager with workspace support
- **Next.js 15** - React framework with App Router
- **Sanity** - Headless CMS with real-time collaboration
- **TypeScript** - End-to-end type safety
- **Tailwind CSS** - Utility-first styling

### Generated Project Structure
The CLI creates projects with this structure:
```
my-app/
├── apps/
│   ├── web/           # Next.js app
│   └── studio/        # Sanity Studio
├── packages/
│   ├── eslint-config/
│   └── typescript-config/
└── turbo.json
```

## Development Workflow

### Package Manager
Always use `pnpm` - it's configured as the packageManager in package.json.

### Code Quality
- Husky git hooks enforce lint-staged rules
- ESLint + Prettier run on staged files
- Conventional commits required via Commitizen
- TypeScript strict mode enforced

### Testing
- Vitest configured for Node.js environment
- Coverage via v8 provider
- Run tests with `pnpm test`

### Environment Variables
Turbo manages these global environment variables:
- `SANITY_API_READ_TOKEN`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_STUDIO_*` variables

## CLI Package Details

The main CLI is in `packages/create-turbo-sanity/` and includes:
- Templates for generated projects
- Interactive setup with Sanity authentication
- Environment variable configuration
- Dependency installation orchestration

When working on the CLI, test using the `test.sh` script in the package directory.