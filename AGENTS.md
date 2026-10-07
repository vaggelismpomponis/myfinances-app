<!-- bmad:context -->
<!-- Verified 2026-08-31 against 1c3c4af. Managed by bmad-project-context; edits inside this block are replaced on refresh. Keep anything you want preserved outside the markers. -->

## SpendWise

Single Source of Truth personal finance application powering Web (PWA) and Android Native. React 18, Vite, TailwindCSS, Capacitor, Supabase. Vercel for serverless APIs. Architecture and deployment details live in `ARCHITECTURE.md` and `DEPLOYMENT.md`.

## Where things are

- Serverless API endpoints: `api/`
- Android Capacitor project: `android/`

## Running and verifying

- Generate mobile assets: `npx @capacitor/assets generate --android`
- Open Android Studio: `npx cap open android`

## Conventions that differ from defaults

- Configure Tesseract.js for Greek and English: `eng+ell`
- Configure speech recognition for Greek: `el-GR`
- Provide `webkitSpeechRecognition` fallback when using `@capacitor-community/speech-recognition` in browser.

<!-- /bmad:context -->

## Git & Version Control Guidelines

- **Commit & Push Policy**: Always commit and push changes upon successfully completing and verifying any task, feature, bug fix, or refactor.
- **Commit Message Convention**: Follow the Conventional Commits standard with a professional, corporate, and easy-to-understand message format:
  - **Format**: `<type>(<scope>): <concise summary>`
  - **Types**:
    - `feat`: New user-facing feature or enhancement (e.g., `feat(notifications): add swipe-to-delete action for individual notifications`)
    - `fix`: Bug fix (e.g., `fix(budgets): resolve threshold alert calculation`)
    - `refactor`: Code restructuring without behavioral change
    - `style`: Visual design, layout polish, or UI CSS styling
    - `perf`: Performance optimizations
    - `chore`: Maintenance, dependencies, asset updates, or Capacitor sync
    - `docs`: Documentation, guides, or rule updates
  - **Tone & Style Rules**:
    - Use imperative, present tense ("add", "implement", "resolve", "update" — avoid "added", "fixing", "updated").
    - Keep commit titles clear, specific, and self-explanatory (avoid vague messages like "update files" or "fixes").
    - For non-trivial changes, include a concise body or bullet points detailing the business rationale and technical scope.
- **Verification Before Commit**: Always verify the build succeeds (`npm run build`) and mobile assets sync (`npx cap sync` when web/native assets change) before committing.
- **Remote Push**: Always push commits to the remote repository tracking branch (`git push`) immediately following the commit.

