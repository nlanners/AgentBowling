# Package Manager Information

## Current Setup

This project uses **npm** as its package manager. All dependencies are managed through npm, and a `package-lock.json` file is maintained to ensure consistent installs.

## Common Commands

- Install dependencies: `npm install`
- Add a new dependency: `npm install package-name`
- Add a dev dependency: `npm install --save-dev package-name`
- Run scripts: `npm run script-name`
- Type checking: `npm run typecheck`
- Testing: `npm test`
- Linting: `npm run lint`

## Package Manager Migration

This project was migrated from pnpm to npm on June 2, 2025. The migration was performed to resolve issues with native module resolution in Expo/React Native, particularly with the `expo-modules-core` package.

### Reasons for Migration

1. **Native Module Resolution**: pnpm's stricter dependency management caused issues with Expo's autolinking system, particularly in cloud build environments.
2. **Compatibility**: npm provides better compatibility with Expo and React Native's build systems, especially for Android builds.
3. **Simplicity**: npm is more widely supported and has fewer configuration requirements.

### Migration Steps Performed

1. Removed node_modules directory
2. Installed dependencies using npm: `npm install --legacy-peer-deps`
3. Generated a new package-lock.json file
4. Updated documentation to reflect the change

## Troubleshooting

If you encounter build issues related to native modules:

1. Delete the node_modules directory: `rm -rf node_modules`
2. Delete any build caches: `npx expo clean`
3. Reinstall dependencies: `npm install`
4. Rebuild: `npx expo run:android` or `npx expo run:ios`
