# Contributing to Create Turbo Sanity

Thank you for your interest in contributing to Create Turbo Sanity! This guide will help you understand our development process, coding standards, and how to submit contributions.

## Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Commit Conventions](#commit-conventions)
- [Release Process](#release-process)
- [Dependency Management](#dependency-management)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)

## Development Setup

### Prerequisites
- Node.js 22 or later
- PNPM 10.12.3 or later
- Git
- A Sanity.io account for testing

### Initial Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/create-turbo-sanity.git
   cd create-turbo-sanity
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up git hooks**
   ```bash
   npx husky install
   ```

4. **Test the CLI locally**
   ```bash
   cd packages/create-turbo-sanity
   pnpm link --global
   cd /tmp
   pnpm create turbo-sanity test-project
   ```

## Project Structure

```
create-turbo-sanity/
├── .github/                    # GitHub workflows and templates
│   ├── workflows/
│   │   ├── ci.yml             # Continuous integration
│   │   └── release.yml        # Automated releases
│   ├── pull_request_template.md
│   └── CODEOWNERS
├── packages/
│   └── create-turbo-sanity/   # Main CLI package
│       ├── src/               # CLI source code
│       ├── templates/         # Project templates
│       └── package.json       # CLI dependencies
├── .releaserc.json           # Semantic release config
├── renovate.json             # Dependency update config
├── commitlint.config.js      # Commit message rules
└── package.json              # Root workspace config
```

### Key Areas

- **CLI Tool** (`packages/create-turbo-sanity/src/`): The main command-line interface
- **Templates** (`packages/create-turbo-sanity/templates/`): Project scaffolding templates
- **Workflows** (`.github/workflows/`): CI/CD automation
- **Configuration**: Various tool configurations for quality and automation

## Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/) for automated versioning and changelog generation.

### Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no logic changes)
- `refactor`: Code changes that neither fix bugs nor add features
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes
- `build`: Build system changes
- `revert`: Revert previous commit

### Scopes
- `template`: Changes to project templates
- `cli`: Changes to CLI tool logic
- `deps`: Dependency updates
- `docs`: Documentation updates
- `ci`: CI/CD configuration
- `config`: Tool configuration changes
- `release`: Release-related changes

### Examples

```bash
feat(template): add typescript support to next.js template
fix(cli): resolve authentication timeout issue
docs: update README with new CLI options
chore(deps): update sanity to v3.95.0
ci: add template generation test to workflow
```

### Using Interactive Commits

For easier commit creation, use our interactive tool:

```bash
pnpm commit
```

This will guide you through creating a properly formatted commit message.

## Release Process

Our release process is **fully automated** using semantic versioning:

### How Releases Work

1. **Commit Analysis**: Semantic Release analyzes commit messages
2. **Version Calculation**: 
   - `fix:` → patch release (1.0.1)
   - `feat:` → minor release (1.1.0)  
   - `feat!:` or `BREAKING CHANGE:` → major release (2.0.0)
3. **Automated Publishing**: 
   - Updates `package.json` version
   - Generates changelog
   - Creates GitHub release
   - Publishes to npm
   - Updates git tags

### Release Triggers

Releases are triggered automatically when:
- Commits are pushed to the `main` branch
- The CI tests pass
- At least one commit follows conventional format

### Manual Release

To trigger a release manually:

```bash
# From main branch
pnpm release
```

### Pre-release Testing

Before merging to `main`, test your changes:

```bash
# Test CLI functionality
cd packages/create-turbo-sanity
pnpm link --global
cd /tmp
pnpm create turbo-sanity test-project

# Run all tests
pnpm test
pnpm lint
pnpm typecheck
```

## Dependency Management

We use [Renovate](https://renovatebot.com/) for automated dependency updates.

### How It Works

- **Scheduled Updates**: Renovate checks for updates every Monday morning
- **Grouped Updates**: Dependencies are grouped by category (React, Next.js, Sanity, etc.)
- **Automated PRs**: Renovate creates pull requests with updates
- **CI Validation**: All updates are tested before merging

### Dependency Categories

Our Renovate configuration groups updates by:

- **Template Dependencies**: Dependencies in generated projects
- **CLI Dependencies**: Dependencies for the CLI tool itself
- **Development Dependencies**: Testing, linting, build tools
- **Framework Groups**: React, Next.js, Sanity, TypeScript, ESLint, etc.

### Manual Dependency Updates

To update dependencies manually:

```bash
# Update template dependencies
cd packages/create-turbo-sanity/templates/default
pnpm update

# Update CLI dependencies  
cd packages/create-turbo-sanity
pnpm update

# Update root dependencies
pnpm update
```

### Adding New Dependencies

When adding dependencies to templates:

1. Add to the appropriate template `package.json`
2. Use version ranges (e.g., `^1.0.0`) not exact versions
3. Test the generated project thoroughly
4. Update documentation if needed

## Testing

### Test Types

1. **CLI Testing**: Manual testing of the CLI tool
2. **Template Generation**: Automated testing of project generation
3. **Linting**: Code style and quality checks
4. **Type Checking**: TypeScript validation

### Running Tests

```bash
# Run all tests
pnpm test

# Individual test types
pnpm lint
pnpm typecheck

# Test template generation
cd packages/create-turbo-sanity
pnpm link --global
cd /tmp
pnpm create turbo-sanity test-project
cd test-project
pnpm install
pnpm build
```

### CI Testing

Our GitHub Actions automatically test:
- Code linting and formatting
- TypeScript compilation
- Template generation
- Project building

## Pull Request Process

### Before Submitting

1. **Create a feature branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes** following our coding standards

3. **Test thoroughly**
   ```bash
   pnpm test
   pnpm lint
   # Test CLI manually
   ```

4. **Commit using conventional format**
   ```bash
   pnpm commit
   # or
   git commit -m "feat(cli): add new authentication option"
   ```

### Submitting a PR

1. **Push your branch**
   ```bash
   git push origin feat/your-feature-name
   ```

2. **Create Pull Request** on GitHub

3. **Fill out the PR template** completely

4. **Request review** from maintainers

### PR Requirements

- ✅ All CI checks pass
- ✅ Code follows style guidelines  
- ✅ Tests are included for new features
- ✅ Documentation is updated
- ✅ Conventional commit format
- ✅ Template generation works
- ✅ No breaking changes (unless intentional)

### Review Process

1. **Automated Checks**: CI runs automatically
2. **Manual Review**: Maintainer reviews code
3. **Testing**: Reviewer tests functionality
4. **Approval**: PR is approved for merge
5. **Merge**: PR is merged to main
6. **Release**: Automated release if needed

## Code Style

### Formatting

We use Prettier for consistent code formatting:

```bash
# Format all files
pnpm format

# Check formatting
npx prettier --check .
```

### Linting

ESLint enforces code quality rules:

```bash
# Run linting
pnpm lint

# Fix auto-fixable issues
pnpm lint:fix
```

### TypeScript

- Use TypeScript for all new code
- Maintain strict type checking
- Add types for new APIs
- Generate types from Sanity schemas

### File Organization

- Keep files focused and small
- Use descriptive names
- Group related functionality
- Export public APIs clearly

## Development Workflow

### Making Changes

1. **Identify the change type**:
   - Template changes: Modify files in `templates/default/`
   - CLI changes: Modify files in `src/`
   - Documentation: Update README or guides

2. **Make focused commits**:
   - One logical change per commit
   - Clear, descriptive commit messages
   - Follow conventional commit format

3. **Test thoroughly**:
   - Test the specific change
   - Test overall functionality
   - Verify generated projects work

### Template Updates

When updating templates:

1. **Update placeholder values**: Use `{{PROJECT_NAME}}`, `{{PROJECT_ID}}`, etc.
2. **Test generation**: Ensure placeholders are replaced correctly
3. **Verify functionality**: Test the generated project works
4. **Update documentation**: Reflect any new features or changes

### CLI Updates

When updating the CLI:

1. **Maintain backward compatibility** when possible
2. **Add proper error handling** for new features
3. **Update help text** and option descriptions
4. **Test with different scenarios** (new projects, existing projects, etc.)

## Getting Help

- **Questions**: Open a [Discussion](https://github.com/your-username/create-turbo-sanity/discussions)
- **Bugs**: Create an [Issue](https://github.com/your-username/create-turbo-sanity/issues)
- **Ideas**: Start a [Discussion](https://github.com/your-username/create-turbo-sanity/discussions)
- **Urgent**: Contact maintainers directly

## Recognition

Contributors are recognized in:
- Release notes and changelogs
- GitHub contributor graphs
- Special thanks in documentation

Thank you for contributing to Create Turbo Sanity! 🚀
