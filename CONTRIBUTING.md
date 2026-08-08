# Contributing to Kairos Labs

Guide for anyone to clone, set up, and run the project locally.

🇧🇷 [Leia em Português](./docs/CONTRIBUTING.pt-BR.md)

---

## Prerequisites

- **Node.js** >= 22 (check with `node --version`)
- **npm** >= 10 (bundled with Node.js)
- A [Supabase](https://supabase.com) account to obtain the environment variables

---

## Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/CabPiz/kairos-labs.git
cd kairos-labs

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## Unit Tests

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage
```

Stack: [Jest](https://jestjs.io) + [React Testing Library](https://testing-library.com/react).

---

## E2E Tests

Stack: [Playwright](https://playwright.dev) + Chromium.

E2E tests validate the critical application flows in a real browser. Specs live in the `e2e/` folder.

**Prerequisite (first time only):**

```bash
./node_modules/.bin/playwright install --with-deps chromium
```

**Run E2E tests:**

```bash
npm run test:e2e
```

The development server (`npm run dev`) must be running at `localhost:3000`, or you can use Playwright's automatic `webServer` (configured in `playwright.config.ts`).

**HTML report after execution:**

```bash
./node_modules/.bin/playwright show-report
```

**Covered flows:**

| Spec | Validated flow |
| :--- | :--- |
| `e2e/waitlist.spec.ts` | Opens waitlist modal → fills email → submits → sees confirmation |

In CI (GitHub Actions), E2E tests run automatically in the `e2e` job, after the `ci` job. Failure screenshots are saved as artifacts for 7 days.

---

## Pre-commit Hooks

[Husky](https://typicode.github.io/husky) + [lint-staged](https://github.com/lint-staged/lint-staged) are configured. When running `git commit`, ESLint runs automatically on modified `.ts` and `.tsx` files. Commits with lint errors or warnings are blocked.

---

## Branch Conventions

| Type | Pattern |
| :--- | :--- |
| New feature | `feature/[N]-short-description` |
| Bug fix | `fix/[N]-short-description` |
| Setup / config | `chore/[N]-short-description` |
| Documentation | `docs/[N]-short-description` |

---

## Conventional Commits

All commit messages follow the pattern `type(scope): imperative description in Portuguese`.

| Type | When to use |
| :--- | :--- |
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Setup, config, dependencies |
| `docs` | Documentation |
| `style` | Formatting, no logic change |
| `refactor` | Refactoring without functional change |
| `test` | Adding or fixing tests |
| `ci` | CI/CD changes |

**Examples:**

```
feat(waitlist): adiciona validação de e-mail duplicado
fix(modal): corrige fechamento ao pressionar Escape
docs(contributing): adiciona seção de testes E2E
```

---

*Kairos Labs — Cesar Antonio Brito Pizarro*
