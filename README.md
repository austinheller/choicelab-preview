# Choicelab Preview

## Development

- To launch the app: `npm start`
- To watch for changes (doesn't launch the app): `npm run watch`

You can launch the app _and_ watch for changes by opening two terminal shells.

The preview window will live-reload when editing a Choicelab project. It will NOT live-reload if you're editing this application's source files.

## Packaging

_Currently Mac-only_:

First, you'll need to code-sign the app. Start with Electron Forge's [instructions for code signing on macOS](https://www.electronforge.io/guides/code-signing/code-signing-macos).

In this repo, specify Electron Forge's Apple notarization properties. Create a `.env` file in the top level of the project, and add these three fields:

```
OSX_IDENTITY="Developer ID Application: YOUR NAME (XXXXXXXXXX)"
OSX_NOTARIZE_ID="YOUR EMAIL"
OSX_NOTARIZE_PASSWORD="xxxx-xxxx-xxxx-xxxx"
```

Package the apps using these commands:

- For Intel: `npm run package-mac-intel`
- For Apple Silicon: `npm run package-mac-silicon`

Issues? These [instructions for code-signing](https://www.rocketride.io/blog/macos-code-sign-notarize-electron-app) are helpful.
