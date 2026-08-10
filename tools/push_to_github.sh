#!/usr/bin/env bash
# Creates the GitHub repo and pushes this project.
#
# Prerequisite, once:
#   1. install the GitHub CLI from https://cli.github.com
#   2. gh auth login          (choose GitHub.com, HTTPS, authenticate in browser)
#
# Then:
#   bash tools/push_to_github.sh [repo-name] [public|private]
#
# Defaults to a PRIVATE repo named lvfc-session-planner.

set -euo pipefail

REPO_NAME="${1:-lvfc-session-planner}"
VISIBILITY="${2:-private}"

cd "$(dirname "$0")/.."

if ! command -v gh >/dev/null 2>&1; then
  echo "The GitHub CLI is not installed."
  echo "Get it from https://cli.github.com, then run: gh auth login"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "You are not signed in to GitHub. Run: gh auth login"
  exit 1
fi

OWNER="$(gh api user --jq .login)"
echo "Signed in as $OWNER"

if [ -n "$(git status --porcelain)" ]; then
  echo "You have uncommitted changes. Commit them first, then run this again."
  git status --short
  exit 1
fi

git branch -M main

if gh repo view "$OWNER/$REPO_NAME" >/dev/null 2>&1; then
  echo "Repo $OWNER/$REPO_NAME already exists - pushing to it."
  git remote remove origin 2>/dev/null || true
  git remote add origin "https://github.com/$OWNER/$REPO_NAME.git"
  git push -u origin main
else
  echo "Creating $VISIBILITY repo $OWNER/$REPO_NAME"
  gh repo create "$REPO_NAME" \
    --"$VISIBILITY" \
    --source=. \
    --remote=origin \
    --description "Curriculum-driven session planner for LVFC" \
    --push
fi

echo
echo "Pushed: https://github.com/$OWNER/$REPO_NAME"
echo
echo "To publish the planner:"
echo "  Settings -> Pages -> Source: GitHub Actions"
echo "  (the workflow in .github/workflows/pages.yml does the rest)"
echo
echo "Your site will be at: https://$OWNER.github.io/$REPO_NAME/"
