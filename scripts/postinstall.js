#!/usr/bin/env node

// Husky requires a .git directory and a local developer environment.
// In CI/hosting environments (Hostinger, GitHub Actions, etc.) it fails
// with exit code 128 because there is no proper git context.
// This script skips husky when running in CI and always runs turbo post-install.

const { execSync } = require("child_process");

const isCI = process.env.CI || process.env.HOSTINGER || process.env.NODE_ENV === "production";

// Use npx turbo to avoid permission issues with node_modules/.bin on Linux
const turboCmd = "npx --no-install turbo run post-install";

if (!isCI) {
  try {
    const { execFileSync } = require("child_process");
    // Resolve husky from local node_modules
    const path = require("path");
    const husky = path.join(__dirname, "..", "node_modules", ".bin", "husky");
    execFileSync(husky, ["install"], { stdio: "inherit" });
  } catch (e) {
    // Husky install failed — not a git repo or no git hooks support.
    // This is non-fatal.
    console.warn("Warning: husky install failed, skipping. Expected in CI/deploy environments.");
  }
}

execSync(turboCmd, { stdio: "inherit" });
