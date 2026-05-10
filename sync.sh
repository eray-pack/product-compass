#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# sync.sh — Stopamine git auto-sync
#
# Commits any local changes, pulls from remote (rebase), then pushes —
# every 60 seconds. Both collaborators run this so neither has to manually
# run git commands while working.
#
# Usage:
#   ./sync.sh start    Start background sync
#   ./sync.sh stop     Stop background sync
#   ./sync.sh status   Show running state + last log lines
#   ./sync.sh logs     Tail the live log
# ─────────────────────────────────────────────────────────────────────────────

REPO="$(cd "$(dirname "$0")" && pwd)"
LOG="$REPO/.sync.log"
PID_FILE="$REPO/.sync.pid"
INTERVAL=60
BRANCH="main"
REMOTE="origin"

# ── Helpers ──────────────────────────────────────────────────────────────────

ts()      { date '+%Y-%m-%d %H:%M:%S'; }

# Used by start/stop/status — prints to terminal
say()     { echo "$*"; }

# Used inside the loop — stdout is redirected to $LOG by nohup
llog()    { echo "[$(ts)] $*"; }

is_running() {
  [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null
}

# ── Commands ─────────────────────────────────────────────────────────────────

cmd_start() {
  if is_running; then
    say "Already running (PID $(cat "$PID_FILE")). Use './sync.sh status' to check."
    exit 0
  fi
  nohup bash "$0" _loop >> "$LOG" 2>&1 &
  echo $! > "$PID_FILE"
  say "✓ Sync started (PID $!)"
  say "  Log:  $LOG"
  say "  Stop: ./sync.sh stop"
}

cmd_stop() {
  if is_running; then
    kill "$(cat "$PID_FILE")"
    rm -f "$PID_FILE"
    say "✓ Sync stopped."
  else
    say "No sync process is running."
    rm -f "$PID_FILE"
  fi
}

cmd_status() {
  if is_running; then
    say "● Sync running   PID $(cat "$PID_FILE")   interval ${INTERVAL}s"
  else
    say "○ Sync not running   (./sync.sh start to begin)"
  fi
  if [[ -f "$LOG" ]]; then
    echo ""
    echo "── Last 15 log lines ────────────────────────────────────────────"
    tail -15 "$LOG"
  fi
}

cmd_logs() {
  if [[ ! -f "$LOG" ]]; then
    say "No log file yet. Start sync first: ./sync.sh start"
    exit 1
  fi
  tail -f "$LOG"
}

# ── Sync loop (runs as nohup child — stdout → $LOG) ──────────────────────────

cmd_loop() {
  llog "────────────────────────────────────────────────────"
  llog "Sync started  branch=$BRANCH  interval=${INTERVAL}s"
  llog "────────────────────────────────────────────────────"

  cd "$REPO"

  while true; do

    # ── Step 1: Stage + commit any local changes first ──────────────────
    # Must happen before pull --rebase, which refuses to run with unstaged work.
    git add -A
    if ! git diff --cached --quiet; then
      MSG="auto-sync $(date '+%H:%M:%S')"
      if git commit -m "$MSG" --quiet 2>&1; then
        llog "commit ✓  $MSG"
      else
        # A hook may have rejected the commit — reset staging and skip push
        llog "COMMIT ERROR — hook rejected or conflict. Resetting staging."
        git reset HEAD 2>/dev/null || true
      fi
    fi

    # ── Step 2: Pull remote changes (rebase keeps history linear) ───────
    PULL=$(git pull --rebase "$REMOTE" "$BRANCH" 2>&1)
    PULL_STATUS=$?

    if [[ $PULL_STATUS -ne 0 ]]; then
      llog "PULL ERROR — aborting rebase, will retry next cycle"
      llog "  └─ $PULL"
      git rebase --abort 2>/dev/null || true
      sleep "$INTERVAL"
      continue
    fi

    if [[ "$PULL" != *"Already up to date"* && -n "$PULL" ]]; then
      llog "pull  ← $(echo "$PULL" | head -1)"
    fi

    # ── Step 3: Push if we're ahead of remote ───────────────────────────
    AHEAD=$(git rev-list --count "$REMOTE/$BRANCH..HEAD" 2>/dev/null || echo 0)
    if [[ "$AHEAD" -gt 0 ]]; then
      PUSH=$(git push "$REMOTE" "$BRANCH" 2>&1)
      if [[ $? -eq 0 ]]; then
        llog "push  → $AHEAD commit(s) pushed"
      else
        llog "PUSH ERROR — will retry next cycle"
        llog "  └─ $PUSH"
      fi
    fi

    sleep "$INTERVAL"
  done
}

# ── Dispatch ─────────────────────────────────────────────────────────────────

case "${1:-}" in
  start)   cmd_start  ;;
  stop)    cmd_stop   ;;
  status)  cmd_status ;;
  logs)    cmd_logs   ;;
  _loop)   cmd_loop   ;;
  *)
    echo "Usage: ./sync.sh {start|stop|status|logs}"
    exit 1
    ;;
esac
