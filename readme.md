# Quick Tabs (Firefox)

A Firefox port of [Quick Tabs](https://github.com/babyman/quick-tabs-chrome-extension) - the excellent keyboard-centric tab manager inspired by IntelliJ IDEA's "Recent Files" switcher.

For full features and documentation, see the [original project readme](https://github.com/babyman/quick-tabs-chrome-extension#readme). All credit for the core extension goes to [@babyman](https://github.com/babyman) and contributors.

## Install

Download the latest signed `.xpi` from [Releases](https://github.com/miaachan/quick-tabs-firefox/releases) and open it in Firefox.

## Firefox Port Improvements

All features working and synced with upstream [`5b42477`](https://github.com/babyman/quick-tabs-chrome-extension/commit/5b424779ec19dffee70c56b8347d7be91ca4d500).

This fork includes the following enhancements over upstream:

- **Non-blocking history search** - `/h` searches run in a Web Worker, keeping UI responsive even with 100k+ history items
- **Fuse.js v7** - Removes the 32-character search limit for better long-string matching
- **Fuse instance caching** - Avoids expensive re-indexing on every keystroke
- **Gentler disk writes** - Tab order persistence uses localStorage instead of session storage
- **UI polish** - Fixed popup shifting on open

## Maintenance

This fork is maintained independently for personal use:

- **Upstream sync**: `./quick-tabs/` mirrors upstream master for easy diffing. Useful changes are cherry-picked into `./firefox_build/`
- **No upstream contributions**: Changes here are Firefox-specific and won't be pushed back
- **Version scheme**: `YYYY.M.D` based on release date

### Syncing with upstream

```bash
git fetch upstream
git diff HEAD upstream/master -- quick-tabs/
# Cherry-pick or manually port relevant changes to firefox_build/
```

