#!/bin/bash

# Script to copy your existing create-turbo-sanity structure to the template directory
# Run this from the root of your create-turbo-sanity repository

set -e

TEMPLATE_DIR="packages/create-turbo-sanity/templates/default"
SOURCE_DIR="."

echo "Copying template files to $TEMPLATE_DIR..."

# Create necessary directories
mkdir -p "$TEMPLATE_DIR/apps/web/src"
mkdir -p "$TEMPLATE_DIR/apps/studio/src"
mkdir -p "$TEMPLATE_DIR/packages/eslint-config"
mkdir -p "$TEMPLATE_DIR/packages/typescript-config"

# Copy root level files (excluding the packages directory we just created)
echo "Copying root configuration files..."
cp tsconfig.json "$TEMPLATE_DIR/" 2>/dev/null || echo "tsconfig.json not found"
cp pnpm-workspace.yaml "$TEMPLATE_DIR/" 2>/dev/null || echo "pnpm-workspace.yaml not found"
cp .gitignore "$TEMPLATE_DIR/" 2>/dev/null || echo ".gitignore not found"
cp .prettierignore "$TEMPLATE_DIR/" 2>/dev/null || echo ".prettierignore not found"
cp vitest.config.ts "$TEMPLATE_DIR/" 2>/dev/null || echo "vitest.config.ts not found"

# Copy apps/web directory
echo "Copying Next.js web app..."
if [ -d "apps/web" ]; then
  # Copy all files except node_modules, .next, and .env files
  rsync -av --exclude='node_modules' --exclude='.next' --exclude='.env*' --exclude='dist' apps/web/ "$TEMPLATE_DIR/apps/web/"
  echo "Web app copied successfully"
else
  echo "apps/web directory not found"
fi

# Copy apps/studio directory
echo "Copying Sanity Studio..."
if [ -d "apps/studio" ]; then
  # Copy all files except node_modules, dist, and .env files
  rsync -av --exclude='node_modules' --exclude='dist' --exclude='.env*' apps/studio/ "$TEMPLATE_DIR/apps/studio/"
  echo "Studio copied successfully"
else
  echo "apps/studio directory not found"
fi

# Copy packages (excluding the create-turbo-sanity package we just created)
echo "Copying shared packages..."
if [ -d "packages/eslint-config" ]; then
  cp -r packages/eslint-config/* "$TEMPLATE_DIR/packages/eslint-config/"
  echo "eslint-config copied"
fi

if [ -d "packages/typescript-config" ]; then
  cp -r packages/typescript-config/* "$TEMPLATE_DIR/packages/typescript-config/"
  echo "typescript-config copied"
fi

# Update template files with placeholders
echo "Updating template files with placeholders..."

# Update sanity.config.ts in studio
if [ -f "$TEMPLATE_DIR/apps/studio/sanity.config.ts" ]; then
  sed -i.bak "s/name: '[^']*'/name: '{{PROJECT_NAME}}'/g" "$TEMPLATE_DIR/apps/studio/sanity.config.ts"
  sed -i.bak "s/title: '[^']*'/title: '{{DISPLAY_NAME}}'/g" "$TEMPLATE_DIR/apps/studio/sanity.config.ts"
  rm "$TEMPLATE_DIR/apps/studio/sanity.config.ts.bak" 2>/dev/null || true
  echo "Updated sanity.config.ts with placeholders"
fi

# Create a templated README
cat > "$TEMPLATE_DIR/README.md" << 'EOF'
# {{DISPLAY_NAME}}

A modern monorepo starter built with:

- **[Turborepo](https://turbo.build/)** for efficient monorepo management
- **[Next.js](https://nextjs.org/)** for the frontend application
- **[Sanity](https://www.sanity.io/)** for content management
- **[TypeScript](https://www.typescriptlang.org/)** for type safety
- **[Tailwind CSS](https://tailwindcss.com/)** for styling

## Project Structure

```
{{PROJECT_NAME}}/
├── apps/
│   ├── web/          # Next.js application
│   └── studio/       # Sanity Studio
├── packages/
│   ├── eslint-config/     # Shared ESLint configuration
│   └── typescript-config/ # Shared TypeScript configuration
└── package.json      # Root package.json with workspace configuration
```

## Getting Started

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start development servers:**
   ```bash
   pnpm dev
   ```
   
   This will start:
   - Next.js app at http://localhost:3000
   - Sanity Studio at http://localhost:3333

## Available Scripts

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all applications
- `pnpm lint` - Lint all packages
- `pnpm typecheck` - Type check all packages
- `pnpm sanity:deploy` - Deploy Sanity Studio
- `pnpm sanity:typegen` - Generate TypeScript types from Sanity schema

## Sanity Configuration

Your Sanity project details:
- **Project ID:** {{PROJECT_ID}}
- **Dataset:** {{DATASET_NAME}}

## Environment Variables

The following environment variables are configured:

### Root (.env)
```
NEXT_PUBLIC_SANITY_PROJECT_ID={{PROJECT_ID}}
NEXT_PUBLIC_SANITY_DATASET={{DATASET_NAME}}
SANITY_API_READ_TOKEN=
```

### Apps/Web (.env)
```
NEXT_PUBLIC_SANITY_PROJECT_ID={{PROJECT_ID}}
NEXT_PUBLIC_SANITY_DATASET={{DATASET_NAME}}
SANITY_API_READ_TOKEN=
```

### Apps/Studio (.env)
```
SANITY_STUDIO_PROJECT_ID={{PROJECT_ID}}
SANITY_STUDIO_DATASET={{DATASET_NAME}}
SANITY_API_READ_TOKEN=
SANITY_STUDIO_HOST=
```

## Learn More

- [Turborepo Documentation](https://turbo.build/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Sanity Documentation](https://www.sanity.io/docs)
- [Sanity + Next.js Guide](https://www.sanity.io/docs/next-js)

## Deploy

### Vercel (Recommended for Next.js)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Configure environment variables in Vercel dashboard
4. Deploy!

### Sanity Studio

Deploy your Sanity Studio

Deploy your Sanity Studio:
```bash
pnpm sanity:deploy
```

Your studio will be available at `https://{{PROJECT_NAME}}.sanity.studio`
EOF

echo "Created templated README.md"

# Remove any existing .env files from template (they will be generated)
find "$TEMPLATE_DIR" -name ".env*" -not -name "*.example" -delete 2>/dev/null || true

echo ""
echo "✅ Template files copied successfully!"
echo ""
echo "Next steps:"
echo "1. Review the files in $TEMPLATE_DIR"
echo "2. Test your package locally:"
echo "   cd packages/create-turbo-sanity && npm link"
echo "   cd /tmp && npm create turbo-sanity test-app"
echo "3. Publish to npm when ready:"
echo "   cd packages/create-turbo-sanity && npm publish"
