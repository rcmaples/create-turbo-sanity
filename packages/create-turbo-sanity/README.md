# create-turbo-sanity Package

This package allows users to create a new Turbo + Next.js + Sanity monorepo with a single command.

## Usage

```bash
npm create turbo-sanity my-app
```

## Development

To test this package locally:

1. Link the package:
   ```bash
   cd packages/create-turbo-sanity
   npm link
   ```

2. Test creating a new project:
   ```bash
   cd /tmp
   npm create turbo-sanity test-app
   ```

## Publishing

```bash
cd packages/create-turbo-sanity
npm publish
```
