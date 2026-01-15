## Description

<!-- Provide a clear and concise description of what this PR does. Explain the "why" behind the change, not just the "what". -->

## Type of Change

<!-- Mark the relevant option(s) with an "x" -->

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Refactoring (code improvement without changing functionality)
- [ ] Documentation update
- [ ] Configuration/infrastructure change
- [ ] Performance improvement
- [ ] Test coverage improvement

## Related Issue(s)

<!-- Link to the issue(s) this PR addresses. Use "Closes #123" or "Fixes #123" to auto-close issues from the ticket boardwhen merged. -->

Closes #
Related to #

## What Changed?

<!-- List the main changes in this PR. Be specific. -->

-
-
-

## Testing & Validation

<!-- Describe how you tested these changes. Include test cases, manual testing steps, or automated test additions. -->

### How to Test

1.
2.
3.

### Test Coverage

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] Edge cases considered and tested

## Screenshots/Recordings

<!-- If applicable, add screenshots or screen recordings to help explain your changes. Delete this section if not needed. -->

## Unfinished Work & Known Issues

<!-- Be transparent about any incomplete work, technical debt, or known limitations. -->

- [ ] None, this PR is complete and production-ready
- [ ] The following items are intentionally deferred:
  - ***
  - ***
  - ***

## Notes & Nuances

<!-- Call out any important details, edge cases, design decisions, or context that reviewers should know. -->

- ***
- ***

## Deployment Considerations

<!-- Are there any special deployment steps, migrations, environment variable changes, or downstream impacts? -->

- [ ] No special deployment considerations
- [ ] Database migrations required (see `backend/supabase/migrations/`)
- [ ] Environment variables added/changed (document in PR or update `.env.example`)
- [ ] Breaking API changes (requires client updates)

## Pre-Merge Checklist

<!-- Ensure all items are complete before requesting review. This is YOUR responsibility as the PR author. -->

### Code Quality

- [ ] Code follows the project's style guidelines and conventions
- [ ] Self-review completed (I've reviewed my own code for obvious issues)
- [ ] No debugging code, console logs, or commented-out code left behind
- [ ] No merge conflicts with the base branch
- [ ] Meaningful commit messages that explain the "why"

### Testing & CI

- [ ] All CI checks are passing
- [ ] All new and existing tests pass locally
- [ ] Test coverage hasn't decreased (or decrease is justified)
- [ ] Linting passes without errors

### Documentation

- [ ] Code is self-documenting or includes helpful comments for complex logic
- [ ] API documentation updated (if backend endpoints changed)
- [ ] Type definitions are accurate and up-to-date

### Security & Performance

- [ ] No sensitive data (passwords, tokens, API keys, PII, etc.) committed
- [ ] Security implications considered and addressed
- [ ] Performance impact evaluated (no obvious performance regressions)

## Reviewer Notes

<!-- Anything specific you want reviewers to focus on or be aware of? -->

**Areas needing extra attention:**

- Questions for reviewers: ...

- Concerns: ...

<!--
Thanks for shipping goat
Please ensure the Pre-Merge Checklist is complete before requesting review.
Feel free to ask questions in the comments if anything is unclear.
-->
