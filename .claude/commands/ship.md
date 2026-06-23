---
description: Clean-build, commit, push to main, and watch CI to green (product-compass deploy flow)
argument-hint: <short description of the change being shipped>
---

Ship the current changes in this repo (product-compass) following our deploy workflow. Do NOT skip steps. Stop and report if any step fails — NEVER push a failing build. Run all commands from the repo root: `cd "$(git rev-parse --show-toplevel)"`.

What is being shipped (basis for the commit message): $ARGUMENTS

1. **Pull first.** `git pull --ff-only` — Fortune pushes directly to main, so always pull before working. If it can't fast-forward, STOP and report.

2. **Show what's about to ship.** `git status -s` and `git diff --stat`. Stage the source files that belong to this change; NEVER `git add` `ios/App/App.xcodeproj/.../Package.resolved` or unrelated untracked files. If it's ambiguous what should ship, ask first.

3. **Clean build to reproduce CI.** Local `npm` can pass where CI's `bun` fails (route-split export resolution differs), so a clean build is required:
   ```
   rm -rf node_modules/.vite dist
   npm run build > /tmp/ship_build.log 2>&1; echo "EXIT:$?"
   ```
   Read the EXIT code from `$?`. Do NOT pipe the build through `tail`/`grep` in an `&&` chain — the exit code would be `tail`'s (0) and a failure would pass silently. If EXIT is not 0, show the last ~25 lines of `/tmp/ship_build.log`, STOP, and do not commit.

4. **Commit as ONE logical change.** Title from $ARGUMENTS; body covers root cause + what changed + why. End with:
   `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`

5. **Push.** `git push origin main`, then `git rev-parse HEAD` for the full SHA.

6. **Watch CI to green BY FULL SHA — not "latest"** (polling latest races and can return the previous run's success before the new run registers). Retry for ~2 min until the run appears:
   `gh run list --commit <FULL_SHA> --limit 1 --json databaseId --jq '.[0].databaseId'`, then `gh run watch <RUN_ID> --exit-status` (run it in the background so it re-invokes you when CI finishes). Report the conclusion + run URL.

7. **Summarize:** commit SHA, what shipped, and the CI conclusion. If CI went red, surface the failing job's log and propose a fix — do NOT leave it red.
