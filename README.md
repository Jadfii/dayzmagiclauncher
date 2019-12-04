[![N|Solid](https://dayzmagiclauncher.com/api/images/banner)](https://dayzmagiclauncher.com)
# MagicLauncher

DayZMagicLauncher is a straightforward launcher for DayZ written in [NodeJS](https://nodejs.org/en/) and [Electron](https://electronjs.org/). You are able to find and join modded servers with ease while using the launcher, alongside a number of other features.

## Features
- Server browser for game servers
- Autoloading mods for modded servers
- Remembering passwords for known servers
- Favouriting servers
- 'Last played' server on home page
- Mod management -> verify mods upon server join, symlink generation
- Ability to unsubscribe/reinstall/repair all mods - 'repair' button to verify all mods and delete symlinks
- Automatic option settings (game files -> prefilled from Steam, nickname -> default to Steam nickname) to avoid common pitfalls when joining servers
- Download progress for mods when downloading/verifying/reinstalling -> auto join servers once mods are subscribed and downloaded
- Version checking
- Search servers by mods
- Store last played time for every server, track play time for servers
- Minimal user interface

## Installation

Download and install from the [releases page](https://github.com/Jadfii/dayzmagiclauncher/releases).

## Support

Please visit the [help](https://dayzmagiclauncher.com/help) page for issues and suggestions.
For development issues, please [open an issue](https://github.com/Jadfii/dayzmagiclauncher/issues/new) on Github.

## Development
- Clone repository.
- Install [NodeJS](https://nodejs.org/en/).
- Build Greenworks in deps/greenworks - refer to the [Greenworks docs](https://github.com/greenheartgames/greenworks/blob/master/docs/build-instructions-electron.md) on how to build the module.
- Install dependencies using npm.
```bash
npm i
```
- Run or build app.
```bash
npm run dev
npm run build
```

## License
This project is licensed under GNU/GPL Version 3 - see the [LICENSE](https://github.com/Jadfii/dayzmagiclauncher/blob/master/LICENSE) file.