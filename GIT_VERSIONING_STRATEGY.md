# Git Versioning Strategy

## Overview

This document outlines the versioning and branching strategy for CastFash by CastinTech.

## Semantic Versioning

We follow [Semantic Versioning 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH

Example: 1.2.3
```

### Version Numbers

| Type | When to Increment | Example |
|------|-------------------|---------|
| **MAJOR** | Breaking changes, incompatible API changes | 1.0.0 → 2.0.0 |
| **MINOR** | New features, backward compatible | 1.0.0 → 1.1.0 |
| **PATCH** | Bug fixes, backward compatible | 1.0.0 → 1.0.1 |

### Pre-release Versions

| Stage | Format | Example |
|-------|--------|---------|
| Development | 0.x.x | 0.1.0, 0.2.0 |
| Alpha | x.x.x-alpha.n | 1.0.0-alpha.1 |
| Beta | x.x.x-beta.n | 1.0.0-beta.1 |
| Release Candidate | x.x.x-rc.n | 1.0.0-rc.1 |

## Branch Strategy

### Main Branches

| Branch | Purpose | Protected |
|--------|---------|-----------|
| `main` | Production-ready code | ✅ Yes |
| `develop` | Development integration | ✅ Yes |

### Supporting Branches

| Branch Type | Naming Convention | Base | Merge To |
|-------------|-------------------|------|----------|
| Feature | `feature/description` | develop | develop |
| Bugfix | `bugfix/description` | develop | develop |
| Hotfix | `hotfix/description` | main | main + develop |
| Release | `release/x.x.x` | develop | main + develop |

### Branch Flow

```
main ──────●──────────────●──────────────●────────────▶ (production)
           │              ▲              ▲
           │              │              │
           ▼              │              │
develop ───●───●──●──●────●──●──●────────●──●──●──●──▶ (development)
               │  │  │       │  │           │
               │  │  │       │  │           │
feature/a ─────●──┘  │       │  │           │
feature/b ───────────●───────┘  │           │
bugfix/x ───────────────────────●───────────┘
```

## Git Tags

### Tag Naming

```bash
# Production releases
v1.0.0
v1.1.0
v2.0.0

# Pre-releases
v1.0.0-alpha.1
v1.0.0-beta.1
v1.0.0-rc.1
```

### Creating Tags

```bash
# Create annotated tag
git tag -a v0.1.0 -m "Release v0.1.0: Initial development release"

# Push tag to remote
git push origin v0.1.0

# Push all tags
git push origin --tags
```

### Tag Message Template

```
Release v{VERSION}: {Short Description}

## What's New
- Feature 1
- Feature 2

## Bug Fixes
- Fix 1
- Fix 2

## Breaking Changes
- Change 1 (if any)
```

## Release Process

### 1. Prepare Release

```bash
# Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/0.2.0

# Update version numbers
npm run version:minor

# Update CHANGELOG.md
# - Move [Unreleased] items to new version section
# - Add release date
```

### 2. Finalize Release

```bash
# Commit version changes
git add .
git commit -m "chore: bump version to 0.2.0"

# Merge to main
git checkout main
git merge release/0.2.0

# Create tag
git tag -a v0.2.0 -m "Release v0.2.0: Description"

# Push
git push origin main --tags

# Merge back to develop
git checkout develop
git merge release/0.2.0
git push origin develop

# Delete release branch
git branch -d release/0.2.0
```

### 3. Hotfix Process

```bash
# Create hotfix from main
git checkout main
git checkout -b hotfix/critical-bug

# Fix the issue
# ...

# Update patch version
npm run version:patch

# Commit and merge to main
git commit -m "fix: critical bug description"
git checkout main
git merge hotfix/critical-bug
git tag -a v0.1.1 -m "Hotfix v0.1.1: Critical bug fix"
git push origin main --tags

# Merge to develop
git checkout develop
git merge hotfix/critical-bug
git push origin develop
```

## Commit Message Convention

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| feat | New feature |
| fix | Bug fix |
| docs | Documentation |
| style | Formatting, no code change |
| refactor | Code restructuring |
| perf | Performance improvement |
| test | Adding tests |
| chore | Build, config, dependencies |
| ci | CI/CD changes |

### Examples

```bash
feat(auth): add social login with Google OAuth
fix(generation): resolve timeout issue with large images
docs(readme): update installation instructions
chore(deps): upgrade NestJS to v11
ci(railway): add production deployment workflow
```

## Railway Deployment Tags

Railway automatically deploys based on:

| Environment | Trigger | Branch/Tag |
|-------------|---------|------------|
| Production | Push to main | main branch |
| Staging | Push to develop | develop branch |

### Manual Deployment

For specific version deployment:

```bash
# Deploy specific version
git checkout v0.1.0
# Railway will auto-deploy when connected to main
```

## Version Files

These files should be updated on version change:

| File | Location | Updated By |
|------|----------|------------|
| `VERSION` | Root | Manual/Script |
| `package.json` | Root | npm version |
| `package.json` | backend/ | npm version |
| `package.json` | frontend/ | npm version |
| `CHANGELOG.md` | Root | Manual |

## Quick Commands

```bash
# Check current version
cat VERSION

# Patch release (0.1.0 → 0.1.1)
npm run version:patch

# Minor release (0.1.0 → 0.2.0)
npm run version:minor

# Major release (0.1.0 → 1.0.0)
npm run version:major

# List all tags
git tag -l

# Show tag details
git show v0.1.0
```

---

**Last Updated:** December 13, 2025  
**Maintained by:** CastinTech  
**Project:** CastFash
