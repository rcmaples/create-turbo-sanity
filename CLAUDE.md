# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a CLI package (`create-turbo-sanity`) that scaffolds modern Turborepo + Next.js + Sanity CMS projects. The generated projects follow a monorepo structure with strict conventions and automated tooling.

## Claude Behavior Requirements

- **Package versions**: Always run `pnpm outdated` and/or `pnpm view <package>` to verify actual versions before suggesting any package upgrades or changes. Do not make assumptions about latest versions or compatibility without verification.

## Essential Commands

### Development

- `pnpm dev` - Start all development servers (Next.js at :3000, Sanity Studio at :3333)
- `pnpm build` - Build all apps and packages
- `pnpm lint` - Lint all code using Turbo
- `pnpm lint:fix` - Lint and auto-fix all code
- `pnpm typecheck` - Type check all packages
- `pnpm test` - Run tests across all packages
- `pnpm test:watch` - Run tests in watch mode (CLI package only)
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
  - `index.js` - CLI entry point using Commander.js
  - `src/sanity-utils.js` - Sanity authentication and project management
  - `src/template-utils.js` - Template copying and environment setup
  - `templates/default/` - Default project template
  - `test.sh` - Manual testing script for CLI
- **`packages/eslint-config/`** - Shared ESLint configuration
- **`packages/typescript-config/`** - Shared TypeScript configuration

### Template Structure

The CLI templates are in `packages/create-turbo-sanity/templates/default/` and generate:

```
my-app/
├── apps/
│   ├── web/           # Next.js 15 app with App Router
│   └── studio/        # Sanity Studio
├── packages/
│   ├── eslint-config/
│   └── typescript-config/
└── turbo.json
```

### Key Technologies

- **Turborepo** - Build system orchestrating the monorepo
- **PNPM 10.26.1** - Package manager with workspace support (strictly enforced)
- **Next.js 15** - React framework with App Router and React 19
- **Sanity** - Headless CMS with real-time collaboration
- **TypeScript** - End-to-end type safety
- **Tailwind CSS** - Utility-first styling
- **Vitest** - Testing framework with v8 coverage

## Development Workflow

### Package Manager

Always use `pnpm` - it's configured as the packageManager in package.json. The project requires Node.js 22 or later.

### Code Quality

- **Husky git hooks** enforce lint-staged rules on pre-commit
- **lint-staged** runs ESLint + Prettier on staged files
- **Commitizen** provides interactive commit message prompts
- **Commitlint** validates commit messages against conventional commits
- Allowed commit types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `build`, `revert`
- Scopes include: `template`, `cli`, `deps`, `docs`, `ci`, `config`, `release`

### Testing

- Vitest configured for Node.js environment in `vitest.config.ts`
- Coverage via v8 provider
- Run all tests: `pnpm test`
- Run CLI package tests: `cd packages/create-turbo-sanity && pnpm test`
- Watch mode: `cd packages/create-turbo-sanity && pnpm test:watch`

### Testing the CLI

To manually test the CLI package:

```bash
cd packages/create-turbo-sanity
pnpm link --global
cd /tmp
pnpm create turbo-sanity test-project
```

Or use the provided test script:

```bash
cd packages/create-turbo-sanity
./test.sh
```

### Environment Variables

Turbo tracks these global environment variables (defined in `turbo.json`):

- `SANITY_API_READ_TOKEN`
- `VERCEL_ENV`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_STUDIO_PROJECT_ID`
- `SANITY_STUDIO_DATASET`
- `SANITY_STUDIO_HOST`

### Release Process

This project uses semantic-release with automatic versioning:

- **`feat:`** commits trigger minor releases (1.1.0)
- **`fix:`**, **`perf:`**, **`docs:`**, etc. trigger patch releases (1.0.1)
- Breaking changes (with `!`) trigger major releases (2.0.0)
- Releases are automated via GitHub Actions on the `main` branch
- The CLI package at `packages/create-turbo-sanity/` is the published npm package
- CHANGELOG.md is automatically updated with each release

### Prettier Configuration

Prettier is configured inline in the root `package.json`:

- No semicolons
- Print width: 100
- No bracket spacing
- Single quotes

## CLI Package Architecture

The CLI (in `packages/create-turbo-sanity/`) provides an interactive setup:

1. **Sanity Authentication** - Authenticates user via `@sanity/cli`
2. **Project Selection** - Lets users select existing or create new Sanity projects
3. **Dataset Configuration** - Sets up Sanity datasets (production, staging, etc.)
4. **Template Scaffolding** - Copies and configures project template
5. **Environment Setup** - Auto-generates `.env` files with Sanity credentials
6. **Dependency Installation** - Runs package manager to install dependencies

CLI options:

- `--yes` - Skip prompts, use defaults
- `--project <projectId>` - Use specific Sanity project ID
- `--dataset <dataset>` - Use specific dataset name
- `--organization <orgId>` - Use specific Sanity organization
- `--template <template>` - Project template (default: 'default')
- `--package-manager <manager>` - Package manager: npm, yarn, pnpm (default: pnpm)

## Turborepo Configuration

The `turbo.json` defines task pipelines:

- **`build`** - Depends on workspace build tasks, outputs to `dist/`, `.next/`, `out/`
- **`dev`** - No caching (for development servers)
- **`lint`** - Depends on workspace lint tasks
- **`typecheck`** - Depends on workspace typecheck tasks
- **`test`** - Depends on workspace test tasks
- **`typegen`** - Interactive Sanity type generation (no caching)
- **`deploy`** - Interactive Sanity Studio deployment (no caching)

Global dependencies tracked:

- `tsconfig.json`
- `packages/typescript-config/**`
- `packages/eslint-config/**`
- `apps/web/.env`
- `apps/studio/.env`
