# Git & Version Control Guidelines

## Policy
Always commit verified changes locally upon completing any task, feature, bug fix, or refactor. Do NOT push to remote; the user will push manually.

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

## Push Policy (Do Not Push)
Do NOT execute `git push`. All pushes to the remote tracking branch are handled manually by the user.
