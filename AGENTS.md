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
