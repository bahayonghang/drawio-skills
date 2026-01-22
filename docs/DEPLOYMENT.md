# GitHub Pages Deployment Guide

This guide explains how to set up and deploy the documentation to GitHub Pages.

## Quick Setup

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. Save the settings

That's it! The documentation will automatically deploy when:
- A new release is published
- Changes are pushed to the `main` branch (affecting docs)

## Configuration

### Base URL

If your repository is **not** at the root of your GitHub Pages site (e.g., `username.github.io/repo-name`), you need to set the base URL.

Edit `docs/.vitepress/config.ts`:

```typescript
export default defineConfig({
  // Uncomment and set your repository name
  base: '/drawio-skills/',
  // ... rest of config
})
```

### Custom Domain

If you want to use a custom domain:

1. Create a file `docs/public/CNAME` with your domain:
   ```
   docs.yourdomain.com
   ```

2. Configure DNS:
   - Add a CNAME record pointing to `username.github.io`
   - Or add A records pointing to GitHub Pages IPs

3. In GitHub Settings → Pages, enter your custom domain

## Workflows

### 1. Deploy on Release

**File:** `.github/workflows/deploy-docs.yml`

Automatically deploys when you create a new release:

```bash
# Create a new release on GitHub
# The workflow will automatically trigger
```

### 2. Deploy on Push to Main

**File:** `.github/workflows/deploy-docs-push.yml`

Automatically deploys when documentation changes are pushed to `main`:

```bash
git add docs/
git commit -m "Update documentation"
git push origin main
```

### 3. PR Preview Build

**File:** `.github/workflows/build-docs-pr.yml`

Validates documentation builds on pull requests and adds a comment with build statistics.

## Manual Deployment

You can manually trigger deployment:

1. Go to **Actions** tab
2. Select **Deploy Documentation to GitHub Pages**
3. Click **Run workflow**
4. Select branch and click **Run workflow**

## Troubleshooting

### Build Fails

**Check the workflow logs:**
1. Go to **Actions** tab
2. Click on the failed workflow run
3. Check the logs for errors

**Common issues:**
- Missing dependencies in `package.json`
- Broken links in markdown files
- Invalid VitePress configuration

### Deployment Fails

**Check permissions:**
1. Go to **Settings** → **Actions** → **General**
2. Under **Workflow permissions**, select **Read and write permissions**
3. Check **Allow GitHub Actions to create and approve pull requests**

### Documentation Not Updating

**Clear cache:**
- Clear your browser cache
- Try incognito/private mode
- Wait a few minutes for GitHub Pages to propagate

**Check deployment:**
- Go to **Actions** tab
- Verify the workflow completed successfully
- Check **Settings** → **Pages** for deployment status

## Local Testing

Before deploying, test locally:

```bash
# Install dependencies
npm install

# Start development server
npm run docs:dev
# or
just docs

# Build for production
npm run docs:build
# or
just docs-build

# Preview production build
npm run docs:preview
# or
just docs-preview
```

## Monitoring

### Workflow Status Badges

Add these badges to your README:

```markdown
[![Deploy Docs](https://github.com/username/repo/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/username/repo/actions/workflows/deploy-docs.yml)
```

### Email Notifications

Configure email notifications for workflow failures:

1. Go to **Settings** → **Notifications**
2. Enable **Actions** notifications
3. Choose email preferences

## Best Practices

### 1. Test Before Merging

Always test documentation changes locally before pushing:

```bash
npm run docs:build
npm run docs:preview
```

### 2. Use PR Preview

Create a pull request to see build status before merging to main.

### 3. Version Documentation

Consider versioning your documentation for different releases:

```typescript
// docs/.vitepress/config.ts
export default defineConfig({
  themeConfig: {
    nav: [
      {
        text: 'v1.0.0',
        items: [
          { text: 'v1.0.0', link: '/v1/' },
          { text: 'v0.9.0', link: '/v0.9/' }
        ]
      }
    ]
  }
})
```

### 4. Monitor Build Times

Keep an eye on build times. If they get too long:
- Optimize images
- Reduce the number of pages
- Use incremental builds

## Security

### Permissions

The workflows use minimal permissions:
- `contents: read` - Read repository contents
- `pages: write` - Write to GitHub Pages
- `id-token: write` - Write ID tokens for deployment

### Secrets

No secrets are required. The workflows use `GITHUB_TOKEN` which is automatically provided.

## Advanced Configuration

### Multiple Environments

Deploy to different environments:

```yaml
# .github/workflows/deploy-staging.yml
on:
  push:
    branches:
      - develop

jobs:
  deploy:
    environment:
      name: staging
      url: https://staging.yourdomain.com
```

### Custom Build Steps

Add custom build steps:

```yaml
- name: Custom build step
  run: |
    # Your custom commands
    npm run custom-script
```

### Caching

The workflows already use npm caching. For additional caching:

```yaml
- name: Cache VitePress
  uses: actions/cache@v3
  with:
    path: docs/.vitepress/cache
    key: ${{ runner.os }}-vitepress-${{ hashFiles('**/package-lock.json') }}
```

## Support

If you encounter issues:

1. Check the [GitHub Actions documentation](https://docs.github.com/en/actions)
2. Check the [VitePress documentation](https://vitepress.dev/)
3. Open an issue in the repository
4. Check existing issues for solutions

## Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [VitePress Documentation](https://vitepress.dev/)
- [VitePress Deployment Guide](https://vitepress.dev/guide/deploy)
