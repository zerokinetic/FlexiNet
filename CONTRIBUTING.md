# 🤝 Contributing Guidelines

Welcome, and thank you for investing your time in contributing to our project! 👋

This document provides a comprehensive guide for all contributors, covering our workflow, domain-specific conventions, and team structure. Following these guidelines ensures a smooth and efficient collaboration for everyone.

---

## 🚀 General Workflow

This section applies to every contributor, regardless of domain.

### 1. Setting Up Your Environment
   ```bash
   # 1. Fork the repository on GitHub
   # 2. Clone your fork locally
   git clone https://github.com/<your-username>/<repo-name>.git
   cd <repo-name>
   
   # 3. Add the upstream remote
   git remote add upstream https://github.com/<original-owner>/<repo-name>.git
   
   # 4. Create a new branch for your work (see naming below)
   ```

### 2. Branch Naming Convention
Please use the following format for your branch names:

`<domain>/<type>/<short-description>`

*   **`<domain>`**: `frontend`, `backend`, `ml`, `db`, or `ios`.
*   **`<type>`**: `feature`, `bugfix`, `hotfix`, or `docs`.
*   **`<description>`**: A short, kebab-case description.

**Examples:**
*   `frontend/feature/login-ui`
*   `backend/bugfix/auth-token-validation`
*   `ml/feature/data-preprocessing-pipeline`
*   `db/hotfix/missing-index`
*   `ios/docs/update-readme`

### 3. Commit Message Convention
Format your commit messages as follows:

`[domain] short imperative description of change`

**Examples:**
*   `[frontend] add responsive navbar component`
*   `[backend] fix JWT expiry validation bug`
*   `[ml] improve model accuracy by tuning hyperparameters`
*   `[db] create migration for user profiles table`
*   `[ios] implement profile screen UI`

### 4. Submitting a Pull Request (PR)
Before submitting a PR, ensure you:
1.  **Title:** Format as `[Domain] Short summary` (e.g., `[Frontend] Implement User Login UI`).
2.  **Description:** Clearly describe the changes and link to any related issues (e.g., `Closes #123`).
3.  **Checks:** All CI/CD checks (linting, tests) must pass.
4.  **Review:** Request a review from at least one person in your domain (see Team Matrix below).

---

## 🎨 Frontend (React) Guidelines
*   **Code Location:** `/frontend/`
*   **Linting/Formatting:** ESLint + Prettier. Code must pass `npm run lint`.
*   **Architecture:** Prefer functional components with hooks.
*   **Structure:**
    *   Components go in `/frontend/src/components/`.
    *   Reusable UI elements (buttons, modals) go in `/frontend/src/ui/`.
*   **Styling:** Use Tailwind CSS or modular SCSS.
*   **Testing:** Write unit tests with Jest and React Testing Library. Place tests next to components or in a `__tests__` directory.

---

## 🛠️ Backend (Node.js/Express) Guidelines
*   **Code Location:** `/backend/`
*   **Linting/Formatting:** ESLint with Airbnb style guide.
*   **Secrets:** Never commit secrets. Use environment variables via a `.env` file (add `.env` to `.gitignore`).
*   **Structure:**
    *   API routes in `/backend/routes/`.
    *   Middleware in `/backend/middleware/`.
    *   Data models in `/backend/models/`.
*   **Testing:** Write integration tests for APIs using Jest and Supertest.
*   **Documentation:** Update `docs/API.md` for any new or changed endpoints.

---

## 🤖 Machine Learning (Python) Guidelines
*   **Code Location:** `/ml/`
*   **Style Guide:** PEP 8 (enforced with `flake8`).
*   **Notebooks:** Save in `/ml/notebooks/`. **Clear all outputs** before committing.
*   **Scripts/Pipelines:** Place in `/ml/scripts/`.
*   **Data:** Small datasets in `/ml/data/`. Large files must use **DVC or Git LFS**.
*   **Models:** Trained models go in `/ml/models/` and should be versioned.
*   **Environment:** Use a virtual environment (`venv`, `pipenv`, or `conda`). Keep `requirements.txt` up to date.
*   **Documentation:** Log experiments and results in `/ml/README.md`.

---

## 🗄️ Database Guidelines
*   **Location:** `/db/`
*   **Migrations:** All schema changes must be done via migration scripts in `/db/migrations/`.
*   **Seeds:** Seed data scripts belong in `/db/seeds/`.
*   **Reversibility:** All migrations must be reversible (include a `down` function).
*   **Documentation:** Document significant changes in `/db/SCHEMA_CHANGELOG.md`.
*   **Testing:** Validate all new queries and migrations locally before submitting a PR.

---

## 📱 iOS (Swift) Guidelines
*   **Code Location:** `/ios/`
*   **Linting:** Follow SwiftLint rules.
*   **Architecture:** Use MVVM for new features.
*   **UI:** Prefer SwiftUI. Minimize use of Storyboards/XIBs.
*   **Assets:** Add images, icons, etc., to `/ios/Assets.xcassets/`.
*   **Testing:** Write unit and UI tests. Place tests in the `/ios/Tests/` directory.
*   **Documentation:** Update `/ios/README.md` for new features or app flow changes.

---

## ✅ Testing & CI/CD
*   Every PR will automatically run linting and tests for the affected domains.
*   **Do not merge** if any CI/CD pipeline step fails.
*   **Local Commands:**
    *   React: `npm run lint && npm test`
    *   Node.js: `npm run lint && npm test`
    *   Python: `flake8 . && pytest`
    *   Swift: `xcodebuild test -project MyProject.xcodeproj -scheme MyScheme`

---

## 📝 Documentation
*   Update the main `README.md` for project-wide changes or major new features.
*   Each domain is responsible for maintaining its own `README.md` (e.g., `/frontend/README.md`).
*   Document all API changes in `docs/API.md`.
*   Keep commit messages and PR descriptions clear and descriptive.

---

## 🔍 Code Review Guidelines
*   **Be Respectful:** Critique the code, not the person.
*   **Be Constructive:** Suggest alternatives and explain why.
*   **Request Changes** for:
    *   Broken functionality or bugs.
    *   Violations of the style guide or architecture.
    *   Significant reductions in code readability or maintainability.
*   **Approve** only if you are confident in the changes.

---
