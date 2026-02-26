# Bun for Electrobun

This is a fork of [Bun](https://github.com/oven-sh/bun) maintained by the [Electrobun](https://github.com/nichochar/electrobun) project. It builds Bun from upstream release tags with the goal of producing a trimmed-down runtime suitable for bundling inside Electrobun desktop apps.

## What's different

- **CI workflow** that builds Bun from upstream source using standard `oven-sh/WebKit` (no custom forks)
- **Build targets**: macOS arm64, Linux x64, Windows x64 (Linux arm64 planned)
- **Trimmed builds**: cmake options to disable the bundler, package manager, and test runner to reduce binary size

## Branch structure

- **`main`** — this fork's changes (CI workflow, README, future build tweaks)
- **`upstream`** — clean sync point tracking upstream Bun release tags

To see exactly what this fork changes: `git diff upstream..main`

## Upstream

For Bun documentation, issues, and the original source, see [github.com/oven-sh/bun](https://github.com/oven-sh/bun).

## License

Same as upstream Bun. See [Project > License](https://bun.com/docs/project/licensing).
