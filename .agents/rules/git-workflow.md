# Git & Version Control Guidelines

## Policy
Always commit and push changes upon successfully completing and verifying any task, feature, bug fix, or refactor.

## Commit Message Convention
Follow the Conventional Commits specification with a corporate, professional, and easily understandable structure:

### Structure
```
<type>(<scope>): <concise imperative summary>

[optional body with details]
```

### Allowed Types
- `feat`: New user-facing feature or enhancement (e.g., `feat(notifications): add swipe-to-delete action for individual notifications`)
- `fix`: Bug fix (e.g., `fix(budgets): resolve threshold alert calculation`)
- `refactor`: Code restructuring with no behavioral change
- `style`: Visual UI styling, layout polish, or formatting
- `perf`: Performance optimizations
- `chore`: Maintenance, dependencies, build configurations, or Capacitor sync
- `docs`: Documentation, instructions, and rule updates

### Tone & Quality Requirements
- **Imperative Mood**: Write in the present imperative tense ("add", "implement", "fix", "update" — not "added", "fixing", "updated").
- **Clarity & Brevity**: Title should be concise (<= 72 characters), unambiguous, and professional. Avoid slang or vague summaries like "update files" or "fixes".
- **Corporate Transparency**: For non-trivial modifications, include a body explaining the rationale (*why*) and the scope of changes (*what*).

## Pre-Commit Verification
1. Run `npm run build` to ensure production compilation succeeds without errors.
2. Run `npx cap sync` when web or native mobile assets change.
3. Check `git status` and `git diff` to ensure only intended files are staged.

## Push
Always run `git push origin <branch>` (or `git push`) to ensure the remote repository is completely synchronized.
