# Contributing to byun-daterange-picker

Thank you for your interest in contributing! This document outlines the process for reporting issues, proposing features, and submitting pull requests.

---

## Getting started

### Prerequisites

- Node.js 20+
- pnpm 10+

### Local setup

```bash
git clone https://github.com/hyunghwan/byun-daterange-picker.git
cd byun-daterange-picker
pnpm install
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the demo.

---

## Reporting issues

Before opening an issue, please:

1. Search the [existing issues](https://github.com/hyunghwan/byun-daterange-picker/issues) to avoid duplicates
2. Include a minimal reproduction if reporting a bug
3. Specify your environment: Node.js version, browser, OS

Use clear, descriptive titles in sentence case. Provide as much context as possible.

---

## Proposing features

Open an issue first to discuss the feature before starting implementation. This avoids wasted effort if the idea doesn't align with the project goals.

Describe:
- The problem you're trying to solve
- Your proposed solution
- Alternatives you've considered

---

## Pull requests

### Workflow

1. Fork the repository
2. Create a feature branch from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```
3. Make your changes
4. Commit with a clear, conventional message:
   ```bash
   git commit -m "feat: add custom footer slot to SuperDateRangePicker"
   ```
5. Push to your fork and open a pull request against `main`

### Commit conventions

Use [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | When to use |
|--------|-------------|
| `feat:` | New feature or prop |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `style:` | Formatting, no logic change |
| `refactor:` | Code restructure without feature change |
| `a11y:` | Accessibility improvement |
| `chore:` | Tooling, dependencies |

### Code style

- TypeScript strict mode
- Follow the existing naming conventions (PascalCase for components, camelCase for functions)
- Use design tokens — never hardcode color or spacing values
- All user-facing strings should follow sentence case
- Use the project ESLint flat config (`eslint.config.mjs`) for linting

### CI policy

- Pull requests and pushes to `main` run CI checks (`lint`, `typecheck`, `build`)
- Keep PRs green before requesting review to avoid deployment regressions
- `eslint` is intentionally pinned to v9 for plugin peer compatibility with the current Next.js lint stack

### Before submitting

- Run `pnpm run lint` and fix any errors
- Run `pnpm run typecheck`
- Run `pnpm run build` to confirm the project builds successfully
- Test your changes in both light and dark mode
- Verify keyboard navigation works

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
