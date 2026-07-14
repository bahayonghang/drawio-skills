# GitHub Actions Workflows

This directory contains GitHub Actions workflows for the Draw.io Skills project.

## Workflows

### 1. Deploy Documentation

**File:** `deploy-docs.yml`

**Trigger:** When a GitHub Release is published

**Purpose:** Automatically builds and deploys documentation to GitHub Pages when a new release is published.

**Usage:**
1. Publish a new release on GitHub
2. The workflow will automatically trigger
3. Documentation will be built and deployed to GitHub Pages

## GitHub Pages Setup

To enable GitHub Pages deployment, follow these steps:

### 1. Enable GitHub Pages

1. Go to your repository settings
2. Navigate to **Pages** section (under "Code and automation")
3. Under **Source**, select **GitHub Actions**

### 2. Configure Base URL (if needed)

If your repository is not at the root of your GitHub Pages site, update the `base` configuration in `docs/.vitepress/config.ts`:

```typescript
export default defineConfig({
  base: '/drawio-skills/', // Replace with your repository name
  // ... other config
})
```

### 3. Verify Permissions

Ensure the workflow has the necessary permissions:

- Go to **Settings** → **Actions** → **General**
- Under **Workflow permissions**, select **Read and write permissions**

## Deployment Trigger

Documentation deployment is triggered by releases:

Publish a GitHub Release to deploy documentation.

## Troubleshooting

### Build Fails

If the build fails, check:

1. **Dependencies:** Ensure `package.json` and `package-lock.json` are up to date
2. **Node version:** The workflow uses Node 20
3. **Build command:** Verify `npm run docs:build` works locally

### Deployment Fails

If deployment fails, check:

1. **GitHub Pages is enabled** in repository settings
2. **Workflow permissions** are set correctly
3. **GITHUB_TOKEN** has necessary permissions

### Documentation Not Updating

If documentation doesn't update after deployment:

1. **Clear browser cache**
2. **Wait a few minutes** for GitHub Pages to propagate changes
3. **Check workflow logs** for any errors

## Local Testing

Before pushing changes, test the documentation locally:

```bash
# Install dependencies
npm install

# Start development server
npm run docs:dev

# Build for production
npm run docs:build

# Preview production build
npm run docs:preview
```

Or use the justfile:

```bash
# Start development server
just docs

# Build for production
just docs-build

# Preview production build
just docs-preview
```

## Workflow Status

You can check the status of workflows:

- **Actions tab:** View all workflow runs
- **Badges:** Add workflow status badges to README
- **Notifications:** Configure email notifications for workflow failures

## Adding Workflow Badges

Add these badges to your README to show workflow status:

```markdown
[![Deploy Docs](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/bahayonghang/drawio-skills/actions/workflows/deploy-docs.yml)
```

## Security

- Workflows use `GITHUB_TOKEN` which is automatically provided by GitHub
- No secrets or credentials need to be configured
- Workflows have minimal permissions (read contents, write pages)

## Contributing

When modifying workflows:

1. Test changes in a fork first
2. Publish a test release for deployment testing
3. Document any new workflows in this README
4. Follow GitHub Actions best practices
