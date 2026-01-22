# Justfile for Draw.io Skills Project
# Run `just` to see available commands

# Default recipe (runs when you just type `just`)
default:
    @just --list

# Documentation commands

# Start documentation development server
docs:
    @echo "🚀 Starting documentation development server..."
    npm run docs:dev

# Build documentation for production
docs-build:
    @echo "📦 Building documentation..."
    npm run docs:build

# Preview documentation production build
docs-preview:
    @echo "👀 Previewing documentation production build..."
    npm run docs:preview

# Install dependencies
install:
    @echo "📥 Installing dependencies..."
    npm install

# Clean all build artifacts
clean:
    @echo "🧹 Cleaning build artifacts..."
    rm -rf docs/.vitepress/dist
    rm -rf docs/.vitepress/cache
    rm -rf node_modules

# Quick start documentation (install + dev)
start: install docs

# Full documentation rebuild (clean + build)
rebuild: clean install docs-build

# Show project structure
tree:
    @echo "📁 Project structure:"
    @tree -L 3 -I 'node_modules|.git|dist|cache' .

# Lint markdown files (requires markdownlint-cli)
lint:
    @echo "🔍 Linting markdown files..."
    markdownlint docs/**/*.md skills/**/*.md README*.md

# Format markdown files (requires prettier)
format:
    @echo "✨ Formatting markdown files..."
    prettier --write "docs/**/*.md" "skills/**/*.md" "README*.md"
