# Contributing to EduVerse LMS

Thank you for your interest in contributing to EduVerse LMS! This document outlines our development workflow, branch conventions, and pull request process.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Branch Naming Convention](#branch-naming-convention)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Testing](#testing)

---

## ✅ Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the platform and students
- Report issues via GitHub Issues

---

## 🚀 Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork:
   ```bash
   git clone https://github.com/your-username/eduverse-lms.git
   cd eduverse-lms
   ```
3. **Add upstream** remote:
   ```bash
   git remote add upstream https://github.com/your-org/eduverse-lms.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Set up environment**:
   ```bash
   cp .env.example .env.local
   # Fill in your values
   ```
6. **Set up database**:
   ```bash
   npm run db:push
   npm run db:seed
   ```
7. **Start development**:
   ```bash
   npm run dev
   ```

---

## 🌿 Branch Naming Convention

Branches must follow this pattern:

```
<type>/<short-description>
```

### Types

| Type | When to Use | Example |
|------|-------------|---------|
| `feat/` | New feature | `feat/attendance-tracking` |
| `fix/` | Bug fix | `fix/submission-upload-error` |
| `chore/` | Maintenance, deps, config | `chore/update-prisma-5` |
| `docs/` | Documentation only | `docs/api-endpoints` |
| `refactor/` | Code improvement (no new features) | `refactor/auth-middleware` |
| `test/` | Adding or fixing tests | `test/grade-api-tests` |
| `style/` | UI/UX improvements only | `style/mobile-sidebar` |
| `hotfix/` | Critical production fix | `hotfix/login-crash` |

### Examples

```bash
git checkout -b feat/dark-mode
git checkout -b fix/student-grade-display
git checkout -b docs/deployment-guide
git checkout -b chore/upgrade-nextjs-15
```

---

## 📝 Commit Message Guidelines

Follow **Conventional Commits** format:

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### Types

```
feat:     New feature
fix:      Bug fix
docs:     Documentation
style:    Formatting, no logic change
refactor: Code restructuring
test:     Adding tests
chore:    Build, deps, tooling
perf:     Performance improvement
```

### Examples

```
feat(student): add assignment submission file upload
fix(auth): resolve session timeout on inactive tabs
docs(api): document grades endpoint parameters
chore(deps): upgrade openai package to v5
test(utils): add grade calculation unit tests
refactor(sidebar): extract navigation items to config
```

---

## 🔄 Pull Request Process

### Before Opening a PR

- [ ] Branch is up to date with `main`
- [ ] All tests pass (`npm test`)
- [ ] TypeScript compiles (`npm run type-check`)
- [ ] No lint errors (`npm run lint`)
- [ ] Functionality tested manually in browser
- [ ] Database schema changes include migrations

### PR Template

When creating a PR, include:

```markdown
## Summary
Brief description of what this PR changes and why.

## Changes
- [ ] What was added/changed/removed

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested the changes.

## Screenshots (if UI changes)
Before/After screenshots

## Checklist
- [ ] Tests pass
- [ ] TypeScript compiles
- [ ] No lint errors
- [ ] Self-reviewed code
- [ ] Added tests (if applicable)
```

### PR Rules

1. **One feature per PR** — keep PRs focused and small
2. **Require one approval** from a maintainer before merging
3. **Squash merge** for feature branches
4. **No force-push** to `main`
5. **Delete branch** after merging

### Review Process

1. Open PR against `main`
2. Assign relevant reviewer
3. Address review comments
4. Wait for CI to pass
5. Maintainer approves and merges

---

## 🖥 Code Style

### TypeScript

- Use explicit types where unclear
- Prefer `interface` over `type` for object shapes
- Use `unknown` over `any`
- Export types from `src/types/index.ts`

### React / Next.js

- Server Components by default; add `"use client"` only when needed
- Use React hooks appropriately (no unnecessary `useEffect`)
- Prefer composition over prop drilling
- Keep components focused — split when > 200 lines

### API Routes

- Always validate input with Zod
- Always check session/auth before processing
- Return consistent `{ success, data/error }` shape
- Use try/catch with meaningful error messages

### Styling

- Use Tailwind utility classes
- Follow the established color system (purple/green/white)
- Use custom component classes from `globals.css` where defined
- Mobile-first responsive design

### File Naming

- **Components**: `PascalCase.tsx` (e.g., `StudentDashboard.tsx`)
- **Pages**: `page.tsx` (Next.js convention)
- **Utilities**: `camelCase.ts` (e.g., `utils.ts`)
- **Types**: `camelCase.ts` (e.g., `index.ts`)

---

## 🧪 Testing

### Writing Tests

- Place tests in `src/__tests__/` or alongside the file as `*.test.ts`
- Test utility functions with unit tests
- Test API routes for correct exports
- Use descriptive test names

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm test -- --coverage  # With coverage report
```

### Test Naming

```typescript
describe("ComponentName or UtilityName", () => {
  it("should do something specific", () => {
    // Arrange
    // Act
    // Assert
  });
});
```

---

## 🗂 Repository Structure

```
main          — Production branch (protected)
├── develop   — Integration branch (optional)
└── feat/*    — Feature branches
    fix/*     — Bug fix branches
    docs/*    — Documentation branches
```

---

## 🚨 Reporting Issues

When reporting a bug, include:

1. **Describe the bug** — clear and concise description
2. **Steps to reproduce** — numbered steps
3. **Expected behavior** — what should happen
4. **Actual behavior** — what actually happens
5. **Screenshots** — if applicable
6. **Environment** — OS, browser, Node version

---

## 📞 Getting Help

- Open a **GitHub Discussion** for questions
- Create an **Issue** for bugs
- Tag `@maintainers` in PRs for reviews

---

Thank you for contributing to EduVerse LMS! 🎓
