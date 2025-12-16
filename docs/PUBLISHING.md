# Publishing Guide

How to publish and manage `strata-editor` on npm.

## First-Time Setup

```bash
npm login  # Authenticate with npm
```

## Publishing a New Version

1. **Update version** (follows [semver](https://semver.org/)):
   ```bash
   npm version patch   # 1.0.0 → 1.0.1 (bug fixes)
   npm version minor   # 1.0.0 → 1.1.0 (new features)
   npm version major   # 1.0.0 → 2.0.0 (breaking changes)
   ```

2. **Build and publish**:
   ```bash
   npm run build:lib
   npm publish
   ```

> The `prepublishOnly` script runs `build:lib` automatically, so `npm publish` alone should work.

## Version Guidelines

| Change Type | Version | Example |
|-------------|---------|---------|
| Bug fix, no API change | `patch` | Fix typo in callout icon |
| New feature, backward compatible | `minor` | Add new extension |
| Breaking change | `major` | Rename prop, remove export |

## Unpublishing

| Timeframe | Action |
|-----------|--------|
| **< 72 hours** | `npm unpublish strata-editor@1.0.0` or `npm unpublish strata-editor --force` |
| **> 72 hours** | ❌ Cannot unpublish |

## Deprecating a Version

Mark a version as deprecated (shows warning to users):

```bash
npm deprecate strata-editor@1.0.0 "Please upgrade to 2.0.0"
```

## Pre-release Versions

For testing before official release:

```bash
npm version 2.0.0-beta.1
npm publish --tag beta
```

Users install with: `npm install strata-editor@beta`

## Checking Package Info

```bash
npm view strata-editor           # View package metadata
npm view strata-editor versions  # List all published versions
```
