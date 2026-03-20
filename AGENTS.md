# Agent Instructions

This project uses **bd** (beads) for issue tracking. Run `bd onboard` to get started.

## Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds


---
<!-- Added by migrate-beads-remote.sh -->

### Setting up a new environment

To get full `bd` access in a fresh checkout or new machine:

```bash
# macOS: brew install dolt
# Linux: curl -L https://github.com/dolthub/dolt/releases/latest/download/install.sh | bash

bd bootstrap
bd dolt pull origin main
```

### Session Close Protocol

**Work is NOT complete until `git push` AND `bd dolt push origin main` succeed.**

```bash
# Export snapshots
bd ready > docs/READY_TASKS.md
bd export > .beads/issues.jsonl
git add docs/READY_TASKS.md .beads/issues.jsonl
git diff --cached --quiet || git commit -m "[chore] Sync Beads snapshots"

# Push code
git pull --rebase && git push

# Sync Dolt issues to GitHub
bd dolt push origin main
```
