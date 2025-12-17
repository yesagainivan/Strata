# Publishing Guide

How to publish and manage `strata-editor` on npm.

> [!NOTE]  
> As of December 2025, npm has deprecated classic tokens. This guide uses **OIDC Trusted Publishing** (recommended) or **Granular Access Tokens**.

---

## Quick Publish (Manual)

```bash
# 1. Bump version
npm version patch  # or minor/major

# 2. Build and publish
npm publish // this step is handled by the GitHub Action

# 3. Push the version tag
git push --follow-tags
```

---

## First-Time Setup

### 1. Create npm Account

Go to [npmjs.com/signup](https://www.npmjs.com/signup) and create an account.

### 2. Login to npm

```bash
npm login
```

This opens a browser for authentication. Sessions now expire after **2 hours** (as of Dec 2025).

```bash
npm whoami  # Verify: should show your username
```

---

## GitHub Actions: Two Options

Choose one of these approaches for automated publishing:

| Method | Security | Token Management | Recommendation |
|--------|----------|------------------|----------------|
| **OIDC Trusted Publishing** | 🔒🔒🔒 Highest | None needed | ✅ Recommended |
| **Granular Token** | 🔒🔒 Good | Manual rotation (90 days max) | Good fallback |

---

## Option 1: OIDC Trusted Publishing (Recommended)

**Zero secrets, automatic provenance, highest security.**

GitHub Actions proves its identity directly to npm — no tokens to manage or rotate.

### Step 1: Configure npm Package

1. Go to [npmjs.com](https://www.npmjs.com) → Your package → **Settings**
2. Scroll to **Trusted Publisher** section
3. Click **Add Trusted Publisher**
4. Fill in (case-sensitive, must be exact):

| Field | Value |
|-------|-------|
| **Organization or user** | `yesagainivan` |
| **Repository** | `Strata` |
| **Workflow filename** | `publish.yml` |
| **Environment** | *(leave blank or use `npm` if you set one)* |

5. Click **Add**

### Step 2: Update Workflow

The workflow file (`.github/workflows/publish.yml`) already has `id-token: write` — that's all that's needed!

```yaml
name: Publish to npm

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write  # Required for OIDC
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'

      - run: npm ci
      - run: npm run build:lib
      - run: npm publish --provenance --access public
        # No NODE_AUTH_TOKEN needed! OIDC handles auth automatically
```

### Step 3: Publish

```bash
npm version patch
git push --follow-tags
```

GitHub Actions authenticates via OIDC — no secrets required!

---

## Option 2: Granular Access Token

If OIDC isn't working or you need a fallback.

### Step 1: Generate Token on npm

1. Go to [npmjs.com → Access Tokens](https://www.npmjs.com/settings/~/tokens)
2. Click **Generate New Token** → **Granular Access Token**
3. Configure:
   - **Name**: `strata-github-actions`
   - **Expiration**: 90 days (maximum for write tokens)
   - **Packages**: Select `strata-editor`
   - **Permissions**: Read and write
   - ✅ **Bypass two-factor authentication (2FA)** — Required for CI/CD
4. Click **Generate Token**
5. **Copy the token immediately**

> [!WARNING]  
> "Bypass 2FA" shows a security warning. This is expected for non-interactive CI/CD — there's no human to enter 2FA codes. OIDC (Option 1) is more secure if you want to avoid this.

### Step 2: Add Token to GitHub

1. Go to your repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add:
   - **Name**: `NPM_TOKEN`
   - **Secret**: Paste your npm access token
4. Click **Add secret**

### Step 3: Update Workflow

Use this workflow with the token:

```yaml
name: Publish to npm

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
          cache: 'npm'

      - run: npm ci
      - run: npm run build:lib
      - run: npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Token Rotation

Granular tokens expire after max 90 days. Set a calendar reminder to:

1. Generate a new token on npm
2. Update the `NPM_TOKEN` secret in GitHub
3. Delete the old token on npm

---

## Publishing a New Version

### Step 1: Update Version

Use [semver](https://semver.org/) versioning:

```bash
npm version patch   # 1.0.0 → 1.0.1 (bug fixes)
npm version minor   # 1.0.0 → 1.1.0 (new features)
npm version major   # 1.0.0 → 2.0.0 (breaking changes)
```

This automatically:
- Updates `package.json` version
- Creates a git commit
- Creates a git tag (e.g., `v1.0.1`)

### Step 2: Push to Trigger Publish

```bash
git push --follow-tags
```

GitHub Actions detects the `v*` tag and publishes to npm.

### Version Guidelines

| Change Type | Version | Example |
|-------------|---------|---------|
| Bug fix, no API change | `patch` | Fix typo in callout icon |
| New feature, backward compatible | `minor` | Add new extension |
| Breaking change | `major` | Rename prop, remove export |

---

## Pre-release Versions

For testing before official release:

```bash
# Create beta version
npm version 2.0.0-beta.1
npm publish --tag beta

# Or alpha
npm version 2.0.0-alpha.1  
npm publish --tag alpha
```

Users install with:

```bash
npm install strata-editor@beta
npm install strata-editor@alpha
```

---

## Checking Package Info

```bash
npm view strata-editor           # View package metadata
npm view strata-editor versions  # List all published versions
npm info strata-editor           # Detailed info
```

---

## Troubleshooting

### "You cannot publish over the previously published versions"

You tried to publish a version that already exists. Bump the version first:

```bash
npm version patch
npm publish
```

### "E403 Forbidden"

- Check you're logged in: `npm whoami`
- Verify package name isn't taken by someone else
- Ensure your token has write permissions
- For OIDC: verify trusted publisher settings match exactly (case-sensitive)

### "E401 Unauthorized"

```bash
npm logout
npm login
```

### OIDC Not Working

1. Verify the workflow filename matches exactly (including `.yml` extension)
2. Verify org/user and repo names are case-sensitive matches
3. Ensure `id-token: write` permission is in your workflow
4. Check you're using npm CLI v11.5.1+ (run `npm --version`)

---

## Unpublishing & Deprecation

| Action | Command | Notes |
|--------|---------|-------|
| Unpublish version (< 72h) | `npm unpublish strata-editor@1.0.0` | Only within 72 hours |
| Unpublish package (< 72h) | `npm unpublish strata-editor --force` | Removes entire package |
| Deprecate version | `npm deprecate strata-editor@1.0.0 "Use 2.0.0"` | Shows warning to users |
| Undeprecate | `npm deprecate strata-editor@1.0.0 ""` | Removes deprecation |

> [!WARNING]  
> After 72 hours, you cannot unpublish. Use deprecation instead.

---

## References

- [npm Trusted Publishing Docs](https://docs.npmjs.com/trusted-publishing)
- [npm Token Deprecation Announcement (Dec 2025)](https://github.blog/changelog/2025-12-09-npm-classic-tokens-revoked-session-based-auth-and-cli-token-management-now-available/)
- [GitHub Actions OIDC](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
