---
name: release
description: Validate, build, bump version, commit, push, and create a GitHub release
allowed-tools: Bash(bun run:*), Bash(git:*), Bash(gh release:*), Edit
---

# Release

Run the full release flow for obsidian-vuki-kanban.

## Input

The user may provide:

- A version bump type: `patch` (default), `minor`, or `major`
- A release description (used in the GitHub release notes)

If not provided, default to `patch` and generate release notes from commits since the last tag.

## Steps

### 1. Validate

Run all checks. If any fail, stop and report the errors.

```bash
bun run test
bun run lint:fix
bun run build
```

After `lint:fix`, if there are still remaining lint errors that weren't auto-fixed, resolve them
manually. Only stop and report errors that can't be resolved.

### 2. Determine version

Read the current version from `manifest.json`. Bump it based on the requested type
(patch/minor/major).

### 3. Update version files

Update the `version` field in all three files:

- `manifest.json`
- `package.json`
- `versions.json` — add a new entry mapping the new version to `"1.0.0"` (minAppVersion)

### 4. Build

```bash
bun run build
```

### 5. Commit and push

```bash
git add -A
git commit -m "chore: bump version to <new-version>"
git push origin main
```

### 6. Create GitHub release

```bash
gh release create manifest.json styles.css --title "<new-version>" --notes "<description>" < new-version > main.js
```

The tag format is the version number without a `v` prefix (e.g., `2.18.4`, not `v2.18.4`).
