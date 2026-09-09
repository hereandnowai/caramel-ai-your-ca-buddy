#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Keep the project name in one easy-to-change variable.
PROJECT_NAME="$(basename "$SCRIPT_DIR")"
CUSTOM_MESSAGE="${1:-}"

# Always operate from the project root, even when this script is launched elsewhere.
cd "$SCRIPT_DIR"

# First-run setup: initialize Git, prepare ignore rules, authenticate, and connect GitHub.
if [[ ! -d .git || -z "$(git remote get-url origin 2>/dev/null || true)" ]]; then
  echo "Initialising Git repository"
  git init
  git branch -M main

  echo "Creating .gitignore"
  touch .gitignore
  required_ignore_entries=(
    ".env"
    ".env.*"
    "!.env.example"
    ".venv/"
    "venv/"
    "env/"
    "node_modules/"
    "__pycache__/"
    "*.pyc"
    "logs/"
    ".DS_Store"
    ".vscode/"
    ".idea/"
  )
  for entry in "${required_ignore_entries[@]}"; do
    if ! grep -Fqx -- "$entry" .gitignore; then
      printf '%s\n' "$entry" >> .gitignore
    fi
  done

  echo "Checking GitHub CLI authentication"
  if ! command -v gh >/dev/null 2>&1; then
    echo "GitHub CLI is not installed. Install gh, then run: gh auth login" >&2
    exit 1
  fi
  if ! gh auth status >/dev/null 2>&1; then
    echo "GitHub CLI is not logged in. Run: gh auth login" >&2
    exit 1
  fi

  echo "Creating GitHub repository"
  if existing_url="$(gh repo view "$PROJECT_NAME" --json url -q .url 2>/dev/null)"; then
    git remote add origin "$existing_url"
    echo "Using existing private repository: $existing_url"
  else
    gh repo create "$PROJECT_NAME" --private --source=. --remote=origin
  fi
fi

# Stage every project change, including deletions.
echo "Adding changes"
git add -A

# Avoid creating empty commits and leave the working tree in a successful state.
if git diff --cached --quiet; then
  echo "Nothing to commit"
  exit 0
fi

# Number this commit after the number of commits already in the repository.
commit_number="$(git rev-list --count HEAD 2>/dev/null || printf '0')"
commit_number=$((commit_number + 1))
commit_message="Commit #${commit_number} - $(date '+%Y-%m-%d %H:%M')"
if [[ -n "$CUSTOM_MESSAGE" ]]; then
  commit_message+=" - $CUSTOM_MESSAGE"
fi

echo "Committing changes"
git commit -m "$commit_message"

# Set upstream on the first push; later pushes use the existing tracking configuration.
echo "Pushing changes"
if git config --get branch.main.remote >/dev/null 2>&1; then
  git push
else
  git push -u origin main
fi

# Show the pushed commit and the canonical GitHub repository URL.
short_hash="$(git rev-parse --short HEAD)"
latest_message="$(git log -1 --pretty=%s)"
repository_url="$(gh repo view --json url -q .url)"
printf 'Pushed %s: %s\nRepository: %s\n' "$short_hash" "$latest_message" "$repository_url"