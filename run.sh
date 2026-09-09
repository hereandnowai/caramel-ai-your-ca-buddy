#!/usr/bin/env bash
set -euo pipefail

# Change these values when the application uses different ports or directories.
PROJECT_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT"
FRONTEND_DIR="$PROJECT_ROOT"
BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"
LOG_DIR="$PROJECT_ROOT/logs"
BACKEND_LOG="$LOG_DIR/backend.log"
FRONTEND_LOG="$LOG_DIR/frontend.log"
FRONTEND_URL="http://127.0.0.1:$FRONTEND_PORT"

BACKEND_PID=""
FRONTEND_PID=""

# Stop child processes when the user presses Ctrl+C or the script is terminated.
cleanup() {
  local exit_code=$?
  trap - SIGINT SIGTERM EXIT

  if [[ -n "$BACKEND_PID" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  if [[ -n "$FRONTEND_PID" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi

  wait "$BACKEND_PID" 2>/dev/null || true
  wait "$FRONTEND_PID" 2>/dev/null || true
  exit "$exit_code"
}

trap cleanup SIGINT SIGTERM EXIT

mkdir -p "$LOG_DIR"

# Detect and start a Python backend when this project has one. This repository
# has no backend entry point, so the backend step is intentionally skipped.
backend_command=()
if [[ -f "$BACKEND_DIR/app.py" ]]; then
  if [[ -x "$BACKEND_DIR/.venv/bin/python" ]]; then
    backend_command=("$BACKEND_DIR/.venv/bin/python" "$BACKEND_DIR/app.py")
  elif [[ -x "$BACKEND_DIR/venv/bin/python" ]]; then
    backend_command=("$BACKEND_DIR/venv/bin/python" "$BACKEND_DIR/app.py")
  else
    backend_command=(python3 "$BACKEND_DIR/app.py")
  fi
elif [[ -f "$BACKEND_DIR/main.py" ]]; then
  if [[ -x "$BACKEND_DIR/.venv/bin/python" ]]; then
    backend_command=("$BACKEND_DIR/.venv/bin/python" "$BACKEND_DIR/main.py")
  elif [[ -x "$BACKEND_DIR/venv/bin/python" ]]; then
    backend_command=("$BACKEND_DIR/venv/bin/python" "$BACKEND_DIR/main.py")
  else
    backend_command=(python3 "$BACKEND_DIR/main.py")
  fi
elif [[ -f "$BACKEND_DIR/manage.py" ]]; then
  if [[ -x "$BACKEND_DIR/.venv/bin/python" ]]; then
    backend_command=("$BACKEND_DIR/.venv/bin/python" "$BACKEND_DIR/manage.py" runserver "127.0.0.1:$BACKEND_PORT")
  elif [[ -x "$BACKEND_DIR/venv/bin/python" ]]; then
    backend_command=("$BACKEND_DIR/venv/bin/python" "$BACKEND_DIR/manage.py" runserver "127.0.0.1:$BACKEND_PORT")
  else
    backend_command=(python3 "$BACKEND_DIR/manage.py" runserver "127.0.0.1:$BACKEND_PORT")
  fi
fi

if (( ${#backend_command[@]} > 0 )); then
  echo "Starting backend on port $BACKEND_PORT..."
  (
    cd "$BACKEND_DIR"
    "${backend_command[@]}"
  ) >"$BACKEND_LOG" 2>&1 &
  BACKEND_PID=$!
else
  echo "No backend entry point detected; skipping backend."
fi

# Install frontend dependencies only when the dependency directory is absent.
echo "Starting frontend on port $FRONTEND_PORT..."
cd "$FRONTEND_DIR"
if [[ ! -d node_modules ]]; then
  if [[ -f package-lock.json ]]; then
    npm ci
  else
    npm install
  fi
fi
npm run dev -- --host 127.0.0.1 --port "$FRONTEND_PORT" >"$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!

# Poll each launched server for up to roughly 30 seconds.
wait_for_url() {
  local name=$1
  local url=$2
  local pid=$3

  for ((attempt = 1; attempt <= 60; attempt++)); do
    if curl --fail --silent --show-error --max-time 1 "$url" >/dev/null 2>&1; then
      echo "$name is reachable at $url."
      return 0
    fi
    if ! kill -0 "$pid" 2>/dev/null; then
      echo "Error: $name stopped before becoming reachable. See its log for details." >&2
      return 1
    fi
    sleep 0.5
  done

  echo "Error: $name did not become reachable within 30 seconds. See its log for details." >&2
  return 1
}

if [[ -n "$BACKEND_PID" ]]; then
  wait_for_url "Backend" "http://127.0.0.1:$BACKEND_PORT" "$BACKEND_PID"
fi
wait_for_url "Frontend" "$FRONTEND_URL" "$FRONTEND_PID"

# Open the frontend in Chrome, with platform-specific fallbacks.
echo "Opening browser..."
if command -v google-chrome >/dev/null 2>&1; then
  google-chrome "$FRONTEND_URL" >/dev/null 2>&1 &
elif command -v google-chrome-stable >/dev/null 2>&1; then
  google-chrome-stable "$FRONTEND_URL" >/dev/null 2>&1 &
elif [[ "$OSTYPE" == darwin* ]] && open -Ra "Google Chrome" >/dev/null 2>&1; then
  open -a "Google Chrome" "$FRONTEND_URL" >/dev/null 2>&1 &
elif [[ "$OSTYPE" == msys* || "$OSTYPE" == cygwin* || "$OSTYPE" == win32* ]] && command -v start >/dev/null 2>&1; then
  start chrome "$FRONTEND_URL" >/dev/null 2>&1 &
else
  echo "Chrome was not found; trying the system browser instead."
  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$FRONTEND_URL" >/dev/null 2>&1 &
  fi
  echo "Frontend URL: $FRONTEND_URL"
fi

echo "Application is running. Press Ctrl+C to stop it."
while true; do
  if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
    echo "Error: frontend stopped unexpectedly. See $FRONTEND_LOG for details." >&2
    exit 1
  fi
  if [[ -n "$BACKEND_PID" ]] && ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo "Error: backend stopped unexpectedly. See $BACKEND_LOG for details." >&2
    exit 1
  fi
  sleep 1
done