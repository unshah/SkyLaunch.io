# Contributing to SkyLaunch

Thank you for your interest in contributing to SkyLaunch! This document provides guidelines and best practices for contributing to the project.

## 📋 Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Reporting Issues](#reporting-issues)

---

## Code of Conduct

By participating in this project, you agree to maintain a respectful, inclusive environment. We expect all contributors to:
- Be welcoming and inclusive
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- A Supabase account (free tier works)

### Local Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**
   ```bash
   git clone https://github.com/unshah/skylaunch.io.git
   cd skylaunch.io/app-src
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

5. **Run the development server**
   ```bash
   npx expo start
   ```

---

## How to Contribute

### Types of Contributions

| Type | Description |
|------|-------------|
| 🐛 **Bug Fixes** | Fix issues in the scheduling engine, weather calculations, or UI |
| 📖 **Documentation** | Improve README, code comments, or create tutorials |
| 🧪 **Testing** | Add unit tests for stores, utilities, or components |
| ✨ **Features** | New functionality (discuss in an Issue first) |
| 🎨 **UI/UX** | Design improvements and accessibility enhancements |

### First-Time Contributors

Look for issues labeled:
- `good first issue` — Simple, well-defined tasks
- `help wanted` — Tasks where we need community help
- `documentation` — Non-code contributions

---

## Development Workflow

### Branching Strategy

```
main
  └── feature/your-feature-name
  └── fix/issue-number-description
  └── docs/what-youre-documenting
```

### Steps

1. **Create a branch** from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** with clear, atomic commits

3. **Test your changes** locally
   ```bash
   npm test
   npx expo start
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request** against `main`

---

## Pull Request Guidelines

### Before Submitting

- [ ] Code compiles without errors (`npx expo start`)
- [ ] All tests pass (`npm test`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Code follows existing style conventions
- [ ] Commits are descriptive and atomic

### PR Title Format

Use conventional commit prefixes:
```
feat: Add crosswind calculation to weather display
fix: Resolve crash when airport code is empty
docs: Update API documentation
test: Add unit tests for scheduleStore
refactor: Simplify flight log validation
```

### PR Description Template

```markdown
## Summary
Brief description of what this PR does.

## Related Issue
Fixes #123 (if applicable)

## Changes Made
- Change 1
- Change 2

## Testing
How did you test these changes?

## Screenshots (if UI changes)
```

---

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define explicit types; avoid `any`
- Use interfaces for object shapes

```typescript
// ✅ Good
interface FlightLog {
  id: string;
  date: Date;
  duration: number;
}

// ❌ Avoid
const flight: any = { ... };
```

### React Native / Expo

- Use functional components with hooks
- Keep components focused and reusable
- Extract business logic into custom hooks or stores

### Zustand Stores

- Follow existing store patterns in `/stores`
- Use async/await for Supabase operations
- Handle errors gracefully

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `FlightCard.tsx` |
| Stores | camelCase + Store | `scheduleStore.ts` |
| Utilities | camelCase | `weatherUtils.ts` |
| Types | PascalCase | `FlightTypes.ts` |

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- scheduleStore.test.ts
```

### Writing Tests

- Place tests in `__tests__` folders adjacent to the code being tested (e.g., `lib/__tests__/schedulerLogic.test.ts`)
- Test business logic and utility functions
- Mock Supabase calls appropriately

```typescript
describe('calculateCrosswind', () => {
  it('should return 0 when wind is aligned with runway', () => {
    expect(calculateCrosswind(270, 10, 270)).toBe(0);
  });
});
```

---

## Reporting Issues

### Bug Reports

Please include:
1. **Description** — What happened?
2. **Expected behavior** — What should have happened?
3. **Steps to reproduce** — How can we recreate it?
4. **Environment** — iOS/Android, device, OS version
5. **Screenshots/Logs** — If applicable

### Feature Requests

1. **Problem** — What problem does this solve?
2. **Proposed solution** — How should it work?
3. **Alternatives** — Other approaches considered
4. **Context** — Any additional information

---

## Questions?

- Open a [Discussion](https://github.com/unshah/SkyLaunch.io/discussions) for general questions
- Tag `@unshah` for project-related inquiries

---

**Thank you for helping make flight training more accessible!** ✈️
