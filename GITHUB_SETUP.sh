#!/bin/bash
# Partition Viewer - GitHub Setup & Build Commands
# Run these commands to set up your repository and create releases

# ============================================================
# STEP 1: Configure Git (If Not Already Done)
# ============================================================

cd ~/Documents/VSCode\ Project/Myself\ Project/ElectronJS/first_electron_app

# Set your GitHub username and email
git config user.name "Your Name"
git config user.email "your.email@example.com"

# ============================================================
# STEP 2: Initialize and Push to GitHub
# ============================================================

# Initialize git (already done, but shown for reference)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Partition Viewer - Linux disk partition visualization tool"

# Rename default branch to main
git branch -M main

# Add GitHub repository as remote
git remote add origin https://github.com/yashar1919/partition_viewer.git

# Push to GitHub (you may need to use SSH key or create a Personal Access Token)
git push -u origin main

# ============================================================
# STEP 3: Authenticate with GitHub
# ============================================================

# Option A: Use SSH (Recommended)
# 1. Generate SSH key: ssh-keygen -t ed25519 -C "your.email@example.com"
# 2. Add public key to GitHub: https://github.com/settings/keys
# 3. Update remote to use SSH:
git remote set-url origin git@github.com:yashar1919/partition_viewer.git

# Option B: Use Personal Access Token (PAT)
# 1. Create PAT at: https://github.com/settings/tokens
# 2. Scopes needed: repo (full control of private repositories)
# 3. Use token when prompted during git push

# ============================================================
# STEP 4: Build Distribution Packages
# ============================================================

# Install dependencies (if needed)
npm install

# Build React app
npm run build:renderer

# Create .deb package for Ubuntu/Debian
npm run dist

# Create AppImage package (universal Linux)
npm run dist:appimage

# Both will be created in dist/ directory
ls -lah dist/

# ============================================================
# STEP 5: Create GitHub Release
# ============================================================

# Create a git tag for version
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push tag to GitHub
git push origin v1.0.0

# Then go to: https://github.com/yashar1919/partition_viewer/releases
# Create a new release from the tag
# Upload dist/*.deb and dist/*.AppImage files
# Add release notes

# ============================================================
# STEP 6: Future Updates
# ============================================================

# Make changes, then:
git add .
git commit -m "Your descriptive commit message"
git push origin main

# For releases:
# 1. Update version in package.json
# 2. Build: npm run dist && npm run dist:appimage
# 3. Tag: git tag -a v1.1.0 -m "Release version 1.1.0"
# 4. Push: git push && git push origin v1.1.0
# 5. Create GitHub release with built files

# ============================================================
# QUICK REFERENCE COMMANDS
# ============================================================

# Check status
git status

# View commit history
git log --oneline

# Update from GitHub
git pull origin main

# View remote URL
git remote -v

# Check tags
git tag

# ============================================================
# TROUBLESHOOTING
# ============================================================

# If push fails with permission denied:
# - Use SSH key method OR
# - Generate Personal Access Token and use it instead of password

# If .gitignore is not working:
git rm --cached -r .
git add .
git commit -m "Remove ignored files"

# To undo last commit (before push):
git reset --soft HEAD~1

# View what's been staged:
git diff --cached
