# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),

and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

I also attempt to follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

## [1.6.2] - 1/28/2026 | Better positioning, unified (and improved) backgrounds, Giphy modernization, and signed firefox nightly builds

A major update to the positioning system and internal background structure, along with modernization of the Giphy plugin, signed Firefox nightly/beta builds, and several important bug fixes.

### Added

- feat(positioning): switch to react-movable and enhance moveable system (#93). [b30a753f](https://github.com/BookCatKid/TablissNG/commit/b30a753f)

- feat: show widget config in unknown widget. [53706bd1](https://github.com/BookCatKid/TablissNG/commit/53706bd1)

- feat(giphy): modernize giphy background plugin. [3de6e521](https://github.com/BookCatKid/TablissNG/commit/3de6e521)

- feat(Backgrounds): unify backgrounds to BaseBackgrounds (#91). [ee152a45](https://github.com/BookCatKid/TablissNG/commit/ee152a45)

- ci: signed firefox nightly/beta builds. [0b1d6ec64](https://github.com/BookCatKid/TablissNG/commit/0b1d6ec64)

### Fixed

- fix: handle empty URL string in unsplash buildLink function. [516dabb7](https://github.com/BookCatKid/TablissNG/commit/516dabb7)

- fix(translations): incorrect parameter for shortcut key. [329ac9f3](https://github.com/BookCatKid/TablissNG/commit/329ac9f3)

- fix(useCache): URGENT fix cache refetching infinitely. [b1d2cae8](https://github.com/BookCatKid/TablissNG/commit/b1d2cae8)

### Changed

- Update Spanish translation (#95). [807770b4](https://github.com/BookCatKid/TablissNG/commit/807770b4)

### Chore / Cleanup

- chore: run prettier and cleanup. [0f691c0c](https://github.com/BookCatKid/TablissNG/commit/0f691c0c), [f1169338](https://github.com/BookCatKid/TablissNG/commit/f1169338), [ac73f35a](https://github.com/BookCatKid/TablissNG/commit/ac73f35a)

- chore: run translations. [60327620](https://github.com/BookCatKid/TablissNG/commit/60327620)

- chore: fix node definitions and eslint. [19a195f2](https://github.com/BookCatKid/TablissNG/commit/19a195f2)

## [1.6.1] - 1/15/2026 | New logos, better caching, a Trello widget, Bing wallpapers and more!

Finally changed the logo to something different from Tabliss's logo! This release includes a lot of community contributions, so thanks a ton to everyone who helped out!

### Added

- feat: implement favicon changing (#85). [44bc62ce](https://github.com/BookCatKid/TablissNG/commit/44bc62ce)

- feat: add bing daily wallpaper. [ce9dadb4](https://github.com/BookCatKid/TablissNG/commit/ce9dadb4)

- feat: add opentype font features parsing support. [2f34128d](https://github.com/BookCatKid/TablissNG/commit/2f34128d)

- Enable better offline support with workbox (#66). [b4c5f165](https://github.com/BookCatKid/TablissNG/commit/b4c5f165)

- feat(trello): added Trello integration (#73). [7e3c9b9](https://github.com/John-Ling/TablissNG/commit/7e3c9b9968dd6639a3f985e73f1d236b30c39916), [62e8b5f5](https://github.com/BookCatKid/TablissNG/commit/62e8b5f5)

### Fixed

- fix(Search): use correct search engine even on default. [a059570f](https://github.com/BookCatKid/TablissNG/commit/a059570f)

- fix: maybe fix extension dev builds on non-web. [d4589fef](https://github.com/BookCatKid/TablissNG/commit/d4589fef)

### Changed

- feat: small improvements to custom settings icons position. [57316369](https://github.com/BookCatKid/TablissNG/commit/57316369)

- feat: fix workbox on chrome (and safari). [49cfd0ec](https://github.com/BookCatKid/TablissNG/commit/49cfd0ec)

- feat(Prettier): fix glob pattern (#84). [2e809d72](https://github.com/BookCatKid/TablissNG/commit/2e809d72)

- feat: new logos!. [12bee649](https://github.com/BookCatKid/TablissNG/commit/12bee649), [0506376d](https://github.com/BookCatKid/TablissNG/commit/0506376d), [44432f2f](https://github.com/BookCatKid/TablissNG/commit/44432f2f)

- feat(Chromium): include key to preserve extension id on dev. [e2a19a81](https://github.com/BookCatKid/TablissNG/commit/e2a19a81)

### Chore / Cleanup

- Fix ESLint errors (#83). [92921bfc](https://github.com/BookCatKid/TablissNG/commit/92921bfc)

- chore: run prettier to fix tests. [ca41f40e](https://github.com/BookCatKid/TablissNG/commit/ca41f40e)

- Add Husky hooks (#68). [4c12b606](https://github.com/BookCatKid/TablissNG/commit/4c12b606)

- ci: add safari to releases. [e141c006](https://github.com/BookCatKid/TablissNG/commit/e141c006)

- ci: auto nightly releases. [35d782ba](https://github.com/BookCatKid/TablissNG/commit/35d782ba), [25f30991](https://github.com/BookCatKid/TablissNG/commit/25f30991)

## [1.6.0] - 1/1/2026 | Large Feature and Bugfix Update (FINALLY)

### Added

- feat(Persist): improve errors and remove on non-web builds. [98195e8](https://github.com/BookCatKid/TablissNG/commit/98195e8)

- feat(storage): add SAVE_BATCH_TIMEOUT to prevent storage errors. [b587897](https://github.com/BookCatKid/TablissNG/commit/b587897)

- feat(LiteratureClock): enhance quote fetching with SFW filter and a new endpoint for more quotes. [224b153](https://github.com/BookCatKid/TablissNG/commit/224b153)

- feat(bookmarks): add toggle to remember folder expansions. [f319b0a](https://github.com/BookCatKid/TablissNG/commit/f319b0a)

- feat: add italics and underline options to widget font settings. [40d615d](https://github.com/BookCatKid/TablissNG/commit/40d615d)

- feat: add perplexity search engine. [c504a5d](https://github.com/BookCatKid/TablissNG/commit/c504a5d)

- feat: beta safari support (simple). [b0d63a8](https://github.com/BookCatKid/TablissNG/commit/b0d63a8)

- feat(links): add keyboard shortcut input. [8a936582](https://github.com/BookCatKid/TablissNG/commit/8a936582d96df2945f0419393fb147b3010c579a)

- feat: state persistence when switching backgrounds. [840ad259](https://github.com/BookCatKid/TablissNG/commit/840ad259b732ff0566c4b0b05ff5e9e1a2ca8eca)

### Changed

- feat: change Unsplash "Tags" input to "Search Term". [8efe064](https://github.com/BookCatKid/TablissNG/commit/8efe064)

- feat: attempt at making custom positioning relative. [a28115b](https://github.com/BookCatKid/TablissNG/commit/a28115b)

- feat: change resize mode of textareas changed to vertical to avoid resizing them into unclickable areas. [8b72e14](https://github.com/BookCatKid/TablissNG/commit/8b72e14)

- chore: update dependencies and minor housekeeping. [0446686](https://github.com/BookCatKid/TablissNG/commit/0446686), [07abb38](https://github.com/BookCatKid/TablissNG/commit/07abb38)

- chore: Change timezone label "Europe/Kiev" to "Europe/Kyiv". [46c9b61](https://github.com/BookCatKid/TablissNG/commit/46c9b61)

- refactor(backgrounds): introduce a baseBackgorund so facilitate adding backgrounds. [9bb547f](https://github.com/BookCatKid/TablissNG/commit/9bb547f)

- feat: clean up settings, remove ads. [7201357](https://github.com/BookCatKid/TablissNG/commit/7201357)

- feat: use browser default sans-serif font. [a331ad0](https://github.com/BookCatKid/TablissNG/commit/a331ad036ec0ad8cb27dc80f6e0f11c6b2771632)

- fix(Jokes): retry API call for long jokes. [8ff8a93](https://github.com/BookCatKid/TablissNG/commit/8ff8a933822b5f715785762eb2390f60a6a34e7f)

### Fixed

- fix(Import): set display.scale to true by default. [116df62](https://github.com/BookCatKid/TablissNG/commit/116df62a21c3eb83d8756c2d657ce01fa0a680b3)

- fix(Jokes): set not saving contents correctly [32031e5](https://github.com/BookCatKid/TablissNG/commit/32031e5)

- fix(QuickLinks): text underline not appearing. [b2f8883](https://github.com/BookCatKid/TablissNG/commit/b2f8883)

- fix: replace {{}} with [] for github-calendar translations. [0bf9d9e](https://github.com/BookCatKid/TablissNG/commit/0bf9d9e)

- fix: remove drop-shadow from github-calendar. [aa6fd7e](https://github.com/BookCatKid/TablissNG/commit/aa6fd7e)

- fix: unloaded github calendar now has correct colors dependent on theme. [04abb8a](https://github.com/BookCatKid/TablissNG/commit/04abb8a)

- fix(baseBackground): some translation stuff. [611a9156](https://github.com/BookCatKid/TablissNG/commit/611a915634de90c3756b8c723b9f6343ffb7fe40)

### Translations

- Update translations (several cs.json updates, translated auto-hide settings menu, engines). [e7e1a40](https://github.com/BookCatKid/TablissNG/commit/e7e1a40), [6107f9a](https://github.com/BookCatKid/TablissNG/commit/6107f9a), [576a15b](https://github.com/BookCatKid/TablissNG/commit/576a15b)

- add: Albanian translation. [98084fb](https://github.com/BookCatKid/TablissNG/commit/98084fb)

- feat: clean up a few translations. [6198093](https://github.com/BookCatKid/TablissNG/commit/6198093)

- i18n: Update German translations (#80). [5413ce65](https://github.com/BookCatKid/TablissNG/commit/5413ce655d83d9b28423a9e0b8168dcdab186859)

- i18n: Updated Spanish translation (#76). [d143156c](https://github.com/BookCatKid/TablissNG/commit/d143156cf7a428b425d380fffdda75c69b897675)

### Chore / Cleanup

- remove console.log and minor cleanup. [a6006ad](https://github.com/BookCatKid/TablissNG/commit/a6006ad)

- chore: add npm-check scripts and remove unused deps. [07abb38](https://github.com/BookCatKid/TablissNG/commit/07abb38)

- chore: slightly improve README. [ba5323c](https://github.com/BookCatKid/TablissNG/commit/ba5323c)

- Add .gitattributes and workspace settings: normalize EOL to LF. [119945b](https://github.com/BookCatKid/TablissNG/commit/119945b)

- chore: update deps. [8a7fc7fd](https://github.com/BookCatKid/TablissNG/commit/8a7fc7fd3f9bcbf63ce3a40d422a97cea55b036b)

- ci: add build to pr ci. [96fb4c4f](https://github.com/BookCatKid/TablissNG/commit/96fb4c4f408e8cbf8a1189accf4dcee26ece12aa)

- ci: add pr tests. [7e0a3025](https://github.com/BookCatKid/TablissNG/commit/7e0a3025d68dc38f68ab2b992289c56f9d9158a8)

## [1.5.1] - 8/4/2025 | Minor Feature and Bugfix Update

### Added

- feat: Add wikipedia search engine and autocomplete [850166f](https://github.com/BookCatKid/TablissNG/commit/850166fd1f9b1d35982eafe9192715f0f7631014)

- feat: add current selected icon display to quick links icon picker. [7bc9802](https://github.com/BookCatKid/TablissNG/commit/7bc9802c5fd70125ca9b53888227f9172651fad3)

### Fixed

- fix(unsplash): don't crash if topics is not an array [dc19b03](https://github.com/BookCatKid/TablissNG/commit/dc19b031d131a8002e1a53d0c47bb637e8d1b04a)

- fix: use correct messages file in weather.tsx [54ea938](https://github.com/BookCatKid/TablissNG/commit/54ea9384bc814245f35752c101e1815c6ff5103c)

- fix: add key to imported quick links. [6708171](https://github.com/BookCatKid/TablissNG/commit/6708171145fc19adb0ad322c08c4dfcff301ab8b)

## [1.5.0] - 7/30/2025 | Feature and Bugfix Update

### Fixed

- feat: Refactor Unsplash background image loading logic. [#43](https://github.com/BookCatKid/TablissNG/issues/43) [06a923f](https://github.com/BookCatKid/TablissNG/commit/06a923f8ee22ad3f5959b095572bf0d8f1c84d4b)

- fix(Todos): Daily Routine not working. [c6b63d1](https://github.com/BookCatKid/tabliss-maintained/commit/c6b63d127151c826116a896e1084e3716fd9eee1)

- fix(Notes): placeholder should inherit color [65b9dee](https://github.com/BookCatKid/TablissNG/commit/65b9dee1fc3493821db682197de8812be87c6d30)

- fix(Quick Links): fix broken widget. [0f2dc326](https://github.com/BookCatKid/TablissNG/commit/0f2dc326ec33c75e560352a00f4d4d9906888479)

- fix(Widgets): sorting with translations. [ee01735](https://github.com/BookCatKid/TablissNG/commit/ee0173599dcc942070f3e5d9c19b93f2dbbbcc30)

- fix(Notes): placeholder should inherit color [65b9dee](https://github.com/BookCatKid/TablissNG/commit/65b9dee1fc3493821db682197de8812be87c6d30)

### Added

- feat: add drag-selected styling for widget free-move mode. [2fb005d](https://github.com/BookCatKid/TablissNG/commit/2fb005d234e276743e1a6df0b15d875dbe0e0b9c)

- feat(TimeTracker): add new TimeTracker widget. [3808fa9](https://github.com/BookCatKid/tabliss-maintained/commit/3808fa918da239acf12b2aa949d4e587cb4c628d)

- feat(Settings): add auto-hide functionality for settings menu. [de61a07](https://github.com/BookCatKid/TablissNG/commit/de61a07d555bbbb400faf27492176ca59b0f7665)

- feat: Add key bind to search, notes, and jokes. [c1cc39c](https://github.com/BookCatKid/TablissNG/commit/c1cc39ce8a564f6676c9158a7eb5fad895deee89)

- feat(Notes): icon align and placeholder style. [27c1264](https://github.com/BookCatKid/TablissNG/commit/27c1264a0355a5b61cf86feb68ad005f2f7a3bb0)

- feat: add custom class option to widgets. [2887bb3](https://github.com/BookCatKid/TablissNG/commit/2887bb3957028df2ff9f7a2becd28d6e168ec240)

### Changed

- feat(Apod): Improve quality of youtube video thumbnail. [#44](https://github.com/BookCatKid/TablissNG/issues/44) [f08f3b1](https://github.com/BookCatKid/TablissNG/commit/f08f3b179dc27db0258a9e7d54d494b6ce880de8)

- feat(Translation): Finish translation support for settings panel. [#20](https://github.com/BookCatKid/tabliss-maintained/pull/20)

## [1.4.1] - 5/21/2025 | Project Rename and Bugfix Update

### Added

- feat(Search): Add using browser default search engine. [b8bd0f4](https://github.com/BookCatKid/TablissNG/commit/b8bd0f4dc988c766ba8f99af97ff7d949c1183ea)

### Changed

- chore: project renaming from Tabliss Maintained to TablissNG. [946daa6](https://github.com/BookCatKid/TablissNG/commit/946daa6b59537f8b2780737f3a661be0bd188716)

### Fixed

- fix(Quotes): typo, dwyl, backup quotable api. [#4faa4d1](https://github.com/BookCatKid/TablissNG/commit/4faa4d107e9dbd1a1c68e992bc3b2883b63cfc9e)

- fix: make video content centered by default. [#24](https://github.com/BookCatKid/TablissNG/pull/24)

## [1.4.0] - 4/24/2025 | Feature Update

### Changed

- feat(Widgets): add BETA badge to free move mode toggle. [#7cc79e0](https://github.com/BookCatKid/TablissNG/commit/7cc79e0937aca715c340bcaeac824bf3b6bf2223)

- refactor(i18n): standardize translation IDs to use "backgrounds." prefix. [#12f5b59](https://github.com/BookCatKid/TablissNG/commit/12f5b59c7d87917f64cd1a56ac15eaa5728b0278)

- refactor(i18n): standardize translation IDs to use "plugins." prefix. [#e385751](https://github.com/BookCatKid/TablissNG/commit/e385751a4c1cc03fb29b4970d29a52ff110a0d83)

- refactor: simplify unknown widget. [#a373885](https://github.com/BookCatKid/TablissNG/commit/a373885230de135704c63536a433a53a88a343e7)

### Fixed

- fix: correct typo in settings panel. [#7a9095a](https://github.com/BookCatKid/TablissNG/commit/7a9095a892d46889349eaeb454d7292d962dfc55)

### Added

- feat(Quotes widget): Add support for displaying Bible verses. [#14](https://github.com/BookCatKid/TablissNG/pull/14)

- feat(Translation): Add translation support for settings panel. [#522df4b](https://github.com/BookCatKid/TablissNG/commit/522df4b9469df2cd60016fab8de32658c2902307)

- feat(Bookmarks): Add auto-expanded navigation style. [#13](https://github.com/BookCatKid/TablissNG/issues/13) [#81e4c4e](https://github.com/BookCatKid/TablissNG/commit/81e4c4e5bec3e2e203d52ca355c85aa5f31b07f8)

- feat(Links): Add handling for special URLs (FIREFOX NOT SUPPORTED). [#b926df0](https://github.com/BookCatKid/TablissNG/commit/b926df0945a9bd836dba5291596ce0a9c351cd98)

- feat(Translation): Add translation opportunity for widget names and descriptions. [#d20d9b4](https://github.com/BookCatKid/TablissNG/commit/d20d9b4dbeada5202a5f7e850b5e9cbb682e60c4)

- feat(Notes): Support markdown, add text alignment option. [#452c0ab](https://github.com/BookCatKid/TablissNG/commit/452c0ab4af6cb9d5c94f51f906ec7dc48d09fe57)

- feat(Widget): add basic/advanced text outline options. [#9aa5dfb](https://github.com/BookCatKid/TablissNG/commit/9aa5dfb5ff76e330df736a10ee5d072238347d93)

- feat(Bookmarks): Favicons, Short Names, Max Text Length. [#b514e328](https://github.com/BookCatKid/TablissNG/commit/b514e32898ced0cd6c18b50bb3ce20d272270dda)

- feat(background): automatic night dimming time selection. [#7d0b1ff](https://github.com/BookCatKid/TablissNG/commit/7d0b1ffe40ef8fecae312fe3b52f853479ff26f3), and [#a2c7321](https://github.com/BookCatKid/TablissNG/commit/a2c7321bae8f0374e8588859fcd902009abccabd)

- feat(Widgets): add draggable positioning for widgets. [BETA] [#05734af](https://github.com/BookCatKid/TablissNG/commit/05734afcb10a95918ab5d091c8f4258830dc04ad)

## [1.3.6] - 3/27/2025 | Small bugfix update

### Changed

- Move theme settings above settings icon position. [#d5ca060](https://github.com/BookCatKid/TablissNG/commit/d5ca060216e0a72c86399a8df13d8c069ae0cd31)

### Fixed

- Fix the url input in quick links removing focus. [#12](https://github.com/BookCatKid/TablissNG/issues/12), [#c2bc27f](https://github.com/BookCatKid/TablissNG/commit/c2bc27f9d4bdaf23f9c83165ef33ace438fb3719)

- Fix dark mode for multiselect. [#68987f1](https://github.com/BookCatKid/TablissNG/commit/68987f12c6e7759cf3a4ec7dcd115fc858875dc2)

## [1.3.5] - 3/18/2025

### Fixed

- Giphy improvements. [#7eb761c](https://github.com/BookCatKid/TablissNG/commit/7eb761cdacb4c1cac1a1c73a0f60f13fdd2f1f8a)

### Added

- Add sorting to quick links. [#202828d](https://github.com/BookCatKid/TablissNG/commit/202828dab383c7f594e9e4b68856105459919cb3)

- Improve Bookmarks widget. [#43e7fea](https://github.com/BookCatKid/TablissNG/commit/43e7fea6e2d8b63a13fe4099242eb999a31c6675)

- Add a TopSites widget. [#3c9fbc1](https://github.com/BookCatKid/TablissNG/commit/3c9fbc1b0eea97d89c14dc598f061d2150f001b7)

- Added a custom placeholder for the search bar. [dfb4bc0](https://github.com/BookCatKid/TablissNG/commit/dfb4bc077687034876903ae780afd539d9118f3a)

- Add dark mode![fd8a86b](https://github.com/BookCatKid/TablissNG/commit/fd8a86bf61f0163164144eb0f31a771367a97295),[f96b23c](https://github.com/BookCatKid/TablissNG/commit/f96b23cab6e8bd3db244aa2d2e6260f5380e0e56),[7735213](https://github.com/BookCatKid/TablissNG/commit/773521328d408a8d6e992771120904b995d274e9),[f384765](https://github.com/BookCatKid/TablissNG/commit/f384765ace3355cf05c0ecb15537d70cd33c6712),[f1bfaf7](https://github.com/BookCatKid/TablissNG/commit/f1bfaf7042985b44db005128cf72eea89f6dda05),[02b8521](https://github.com/BookCatKid/TablissNG/commit/02b85217c03562c2a235f0b703be9241e08da603),[5f51099](https://github.com/BookCatKid/TablissNG/commit/5f51099d8f75f81b43a3146d7c714a55018be3af),[7eb761c](https://github.com/BookCatKid/TablissNG/commit/7eb761cdacb4c1cac1a1c73a0f60f13fdd2f1f8a),[2423e6f](https://github.com/BookCatKid/TablissNG/commit/2423e6f9e3cb1d339aa48fa06a6cb70cd708a336)

- Added a text-outline option to font settings. [1f4a6c0](https://github.com/BookCatKid/TablissNG/commit/1f4a6c0fbf1e4094bbcebdc47ef03d57db43bf47)

## [1.3.1] - 3/11/2025

### Fixed

- Large bugfixes in Quick Links. [f4b339f](https://github.com/BookCatKid/TablissNG/commit/f4b339f49b2d1979bc80b9f6622cc163f3c48585)

### Changed

- Make the time widget analogue and line between inherit color. [#1787a87](https://github.com/BookCatKid/TablissNG/commit/1787a8706ff513c21b5a1180db935eb5af219df9)

### Added

- Add an option to change the location of the settings icon! [#cddddb5](https://github.com/BookCatKid/TablissNG/commit/cddddb5dca90ab27dd29166063104e9ee71da395)

- Add rotation option to widget display settings [#2960ed0](https://github.com/BookCatKid/TablissNG/commit/2960ed074415580c5d6c0400aab4183991f0a005)

- Binary Clock: option to set custom colors for dots. [#6c60391](https://github.com/BookCatKid/TablissNG/commit/6c60391301f0d4f68f2e5ddc1f7f0b3b6a04a99a)

## [1.3.0] - 3/9/2025

### Fixed

- Fix unsplash images changing on reload. [#4357fd2](https://github.com/BookCatKid/TablissNG/commit/4357fd293d8dbe7b41ff3d1310bf84b2bf18b799)

- Fix unsplash credit location extending too far. [#ab83b44](https://github.com/BookCatKid/TablissNG/commit/ab83b449512b685fb89dd361a852e02c653f9047)

- Make the scale option for background default to true. [#cfd5134](https://github.com/BookCatKid/TablissNG/commit/cfd51340cf89a15b55bef91fe43a6125301be5b1)

### Changed

- Compact the GitHub and version at top of settings. [#a6200c5](https://github.com/BookCatKid/TablissNG/commit/a6200c5e75a4d60a39a149b0b682c6946599afe8)

- Update multiselect library due to outdated version causing CI pipeline failures. [#8d4cd57](https://github.com/BookCatKid/TablissNG/commit/8d4cd571cd81d486fd8ebfaa5083cdc8ed8c86d0)

- Replace theysaidso with quotable and dwyl. [#8b3f8a5](https://github.com/BookCatKid/TablissNG/commit/8b3f8a52ed853c57e2fb08fd3b20880d52cabbbd)

- Unify invalid widget error handling. [#16d163b](https://github.com/BookCatKid/TablissNG/commit/16d163bb65984c45f02351ea0bc5fb1a87aa7ffc)

- Update unsplash topics. [#41f8ab0](https://github.com/BookCatKid/TablissNG/commit/41f8ab00d87143fd6f59dda8fa3111620e32647c)

- Update Supporting, Error and Storage Error modal. [#5d76cd7](https://github.com/BookCatKid/TablissNG/commit/5d76cd7bba2cd4b1e381153773305ce87f2a279f)

### Added

- Add click-to-refresh option to IP Info widget. [#823a471](https://github.com/BookCatKid/TablissNG/commit/823a471e731da7c5e1b9eb4dce646bb08f428ecd)

- Add dev to version number if running dev version. [#a26e820](https://github.com/BookCatKid/TablissNG/commit/a26e820e369e0fa79232a5de500a27f84778833d)

- Add radial gradient support and more settings for random gradients. [#43b2484](https://github.com/BookCatKid/TablissNG/commit/43b2484ba39f2324c7fac9773012d83af335c52a)

- Added a random gradient option. [#4812438](https://github.com/BookCatKid/TablissNG/commit/4812438df7ff55bec9041d8cb62a09bc80ca134c)

- Added a setting to only show settings icon on hover. [#029b94b](https://github.com/BookCatKid/TablissNG/commit/029b94bfacd1a79f024a58475db7eee84da992f6)

- Add version number and improved watch and star buttons to settings. [#c078136](https://github.com/BookCatKid/TablissNG/commit/c0781363c7ddde7a5db5caf40a6d513fa80234c2)

- Add multiselect to unsplash topics. [#e11ca71](https://github.com/BookCatKid/TablissNG/commit/e11ca71f8670c0013c697741fb2ed20c68df0d20)

- Add a third ip info fallback api [#c46955d](https://github.com/BookCatKid/TablissNG/commit/c46955dc532aed2a4c4db7676ca16b0d145f1f35)

- Add the option for "Location On-Click Source" in Unsplash widget. [#29a968e](https://github.com/BookCatKid/TablissNG/commit/29a968e694c8ab3943f4fb4c84a9356b4445204d)

- Add crossfade animation to unsplash. [#e5197e68](https://github.com/BookCatKid/TablissNG/commit/e5197e68a35e35a1730af973de98c81eb629098c)

- Add click action to GitHub widget. [#5c48b7fc](https://github.com/BookCatKid/TablissNG/commit/5c48b7fc4e6376b0c6b1b92b196059769d393608)

- Add more error handling to unsplash. [#f6728cd](https://github.com/BookCatKid/TablissNG/commit/f6728cdf9c5fbc18e67341ca976f39785623d9da)

## [1.2.1] - 3/4/2025

### Fixed

- Fix errors on Wikimedia Image of the Day. [#21d79ba](https://github.com/BookCatKid/TablissNG/commit/21d79bada0ede075772098e7ba99e3045e17af54)

- Fix the open feather modal always being visible. [#9763891](https://github.com/BookCatKid/TablissNG/commit/976389118713eb53071caa31c66afed963f34b66)

- Fix custom modal styles to apply only to quick links. [#37ee4fa](https://github.com/BookCatKid/TablissNG/commit/37ee4fa4e4d552cfad6f404afa0a1931c2833f42)

### Changed

- Move to react-github-calendar [#3be1dfa](https://github.com/BookCatKid/TablissNG/commit/3be1dfa53f751c7cadb526283788060f52a4075b)

- Make the custom uploads have the correct styles. [ba43558](https://github.com/BookCatKid/TablissNG/commit/ba435588e1de85ad2704fd366370962d53a9c589)

- Change link display, so if the name is blank it displays a blank name instead of a formatted url. [#13de553](https://github.com/BookCatKid/TablissNG/commit/13de5537c39d4ae17b194cbed5afd1ae4d62e7fe)

## [1.2.0] - 2/26/2025

### Added

- Add an option in quick links to preserve the aspect ratio of the image icon when resizing. [#14accf1](https://github.com/BookCatKid/TablissNG/commit/14accf1b9feaf556bbca2a67c87b8e972cc09ab3)

- Add the ability to set both dimensions independently of the image icon in quick links. [#14accf1](https://github.com/BookCatKid/TablissNG/commit/14accf1b9feaf556bbca2a67c87b8e972cc09ab3)

- Add option for scaling widgets with CSS transform. [#41a8b08](https://github.com/BookCatKid/TablissNG/commit/41a8b0821e6a09fe438d7389f597b63008363f8c)

- Move the icon preloading to the existing utils.ts. [#5254ef6](https://github.com/BookCatKid/TablissNG/commit/5254ef6d889c1266def0587088695f54ac47580c)

- Add caching for icons. [#ea317ff](https://github.com/BookCatKid/TablissNG/commit/ea317ff29fb48a65ff0c585d347d8cec097962de)

- Add a modal for selecting the icon. [#d221677](https://github.com/BookCatKid/TablissNG/commit/d2216777af3be64366a97bb09f3a273afc116cc5)

### Fixed

- Fix import with time defaulting to hiding the time. [#4a528db](https://github.com/BookCatKid/TablissNG/commit/4a528db4cb708b0f009de29b3c99b50df4cda05c)

- Add more error handling for invalid plugins. [#3b4a3ba](https://github.com/BookCatKid/TablissNG/commit/3b4a3ba9d888e7d62e8e3591eebf8e0aec39feb0)

- Fixed the issue where some input values in quick links weren't restored on reload. [#14accf1](https://github.com/BookCatKid/TablissNG/commit/14accf1b9feaf556bbca2a67c87b8e972cc09ab3)

- Enhance error handling for invalid widgets. [#1449cd2](https://github.com/BookCatKid/TablissNG/commit/1449cd25fb2c1f1c904e5783a3c2877377bd338b) and [#975898f](https://github.com/BookCatKid/TablissNG/commit/975898f4e5a0c6afb48a63c0e75d5f643b01bd82)

- Update Custom Text widget to be able to specify when to change the text. [#8857fe0](https://github.com/BookCatKid/TablissNG/commit/8857fe0d082ce637d131f0edac0ee5310cf67c16)

- Rework the svg display, make it more robust. [#8a6e665](https://github.com/BookCatKid/TablissNG/commit/8a6e66547dac735fd648174a96ebede439492377)

- Fix caching of uploaded quick link images. [#80f67b4](https://github.com/BookCatKid/TablissNG/commit/80f67b4e58b2fbedc36779b5537d1432a94447ed)

### Changed

- Update the support section to have a star on github button. [#f723d76](https://github.com/BookCatKid/TablissNG/commit/f723d7602689fe7a79d5210d211bf88657620c03)

- Rename background/media back to background/image to preserve backwards compatibility. [#3b4a3ba](https://github.com/BookCatKid/TablissNG/commit/3b4a3ba9d888e7d62e8e3591eebf8e0aec39feb0)

- Large reordering of the code for the quick links widget to make it more maintainable. [#14accf1](https://github.com/BookCatKid/TablissNG/commit/14accf1b9feaf556bbca2a67c87b8e972cc09ab3)

- Rename custom ico url to Custom Image URL in quick links widget. [#14accf1](https://github.com/BookCatKid/TablissNG/commit/14accf1b9feaf556bbca2a67c87b8e972cc09ab3)

- Change the location url for unsplash to be an href instead of js. [#f077ccd](https://github.com/BookCatKid/TablissNG/commit/f077ccd6f0c298c6ef18bd70ff9a3c3dd38f3625)

### Removed

- Removed some unused function I added while testing the last release. [#0a0cc5c](https://github.com/BookCatKid/TablissNG/commit/0a0cc5c6e7997c009bb67f58bf1b00b3de780651)

## [1.1.0] - 2/18/2025

### Added

- Added Custom Text component [fef61f1](https://github.com/BookCatKid/TablissNG/commit/fef61f1e73bd4a9da4715ccf5793785395ad2a75)
- Add 'show city name' setting to the Weather plugin [fd809d2](https://github.com/BookCatKid/TablissNG/commit/fd809d245bd5d8da82a31382596b92515576c718)
- Add 'showTime' in Time widget [d6aef55](https://github.com/BookCatKid/TablissNG/commit/d6aef55cde3af01d3c0a8859f30c60da5999816f)
- Add ability to set custom search engine #552 [c32a14b](https://github.com/BookCatKid/TablissNG/commit/c32a14bbd852ab4bbb890443259ed91eec06ffb9)
- Add option to change the luminosity depending on the time of day #625 [dde5752](https://github.com/BookCatKid/TablissNG/commit/dde57528d5e2b57229b273878e36690a1e4f5c02)
- Add toggle to number links for easy number "speed dial" [f49364b](https://github.com/BookCatKid/TablissNG/commit/f49364bec7d3643b57493ce43a5436ec4f175fbc)
- Add daily routine feature to Todo widget #559 [74da94c](https://github.com/BookCatKid/TablissNG/commit/74da94c8e9c5730d7296d77bfebd13cb29001dcb)
- Add mask ip option to IP info widget #657 [4f222fb](https://github.com/BookCatKid/TablissNG/commit/4f222fbb16bbcac29cf2fb868c7c2390ad7639de)
- Add online image to backgrounds #656 [4eab1c0](https://github.com/BookCatKid/TablissNG/commit/4eab1c07bf03433045ee8c6415eea6445a5867ef)
- Added Kagi and Vuhuv search engines. [bc84198](https://github.com/BookCatKid/TablissNG/commit/bc84198122bffcded86dcca2466e961efa94a483)
- Add validation for response body && api key check #681 [a2098a2](https://github.com/BookCatKid/TablissNG/commit/a2098a25d3d0fd90b3c491832657c53678cba52d)
- Add cloning instructions [96d576d](https://github.com/BookCatKid/TablissNG/commit/96d576d5e779e02950c35aeeab65ac325126236d)
- Added a switcher for which icon provider to use in quicklinks [a093ea9](https://github.com/BookCatKid/TablissNG/commit/a093ea93787e588b359c5001af70702a11434399)
- Added an icon size switcher [342be49](https://github.com/BookCatKid/TablissNG/commit/342be49f5a134ee588836d6cce4216325845acbd)
- Added metacrawler search engine [7bfd103](https://github.com/BookCatKid/TablissNG/commit/7bfd10354889e4524cafe053dd27a50607bd3c32)
- Added Wikimedia Image of the Day background! [0f59650](https://github.com/BookCatKid/TablissNG/commit/0f596505b707bacd3a2c3b2853128f676f4af509)

### Changed

- [FEATURE] Add 'show city name' setting to the Weather plugin #615 [32c8aa0](https://github.com/BookCatKid/TablissNG/commit/32c8aa039e70ae3b105a6887ae69ba5d09bc6ae2)
- [FEATURE] 'Display time' in Time widget #574 [b37c1e0](https://github.com/BookCatKid/TablissNG/commit/b37c1e02e214ebbfec7249aabd5fd0fd432b9f72)
- Countdown #511 [3f07222](https://github.com/BookCatKid/TablissNG/commit/3f07222b84c79500f4ae8281b797d75702bf29df)
- Implemeneted APOD!!! [029674b](https://github.com/BookCatKid/TablissNG/commit/029674bf0d86849ffcd8c2ec5c31a0997f6dbcaa)
- [FEATURE] Time tracking widget for significant events #626 [9789c3a](https://github.com/BookCatKid/TablissNG/commit/9789c3a32f0d70678c67dccca64c23e95aa715e6)
- [FEATURE] add toggle to number links for easy link "speed dial" #618 [897538a](https://github.com/BookCatKid/TablissNG/commit/897538a002b33834a6c7aa0dfc6b3f9d55bfcf6e)
- [Feature] Add Bitcoin Mempool widget #486 [117f865](https://github.com/BookCatKid/TablissNG/commit/117f8654353cb412d67b7c5fe91bac280b638afb)
- Remove NBA Widget (Broken) [bdf6a8f](https://github.com/BookCatKid/TablissNG/commit/bdf6a8fd4523cdd58fb67589dc5bdc069b9ba5ac)
- Update kp.json #693 [908d2bd](https://github.com/BookCatKid/TablissNG/commit/908d2bd10878ad9f65a2b457c0bc29bb8dba97f6)
- Update TRANSLATING.md [9f431ac](https://github.com/BookCatKid/TablissNG/commit/9f431ace4a52669775b5484ad31021a0e2d0ee9a)
- Updated hu.json #676 [2d4201b](https://github.com/BookCatKid/TablissNG/commit/2d4201b7c36d197cf21f5f35784b32e3adefcad2)
- Updated translation for Farsi [34e15be](https://github.com/BookCatKid/TablissNG/commit/34e15be89f89cdaad075d07c4de8614f1c549562)
- Update farsi translation files #591 [d2a840f](https://github.com/BookCatKid/TablissNG/commit/d2a840fe82c44b838de0b334257d56274848c756)
- Tabliss translate strings #687 [6529cf7](https://github.com/BookCatKid/TablissNG/commit/6529cf78ca2e3271483ea739fe35d14eb55e8f65)
- Finished the previous Translations! [f4ead50](https://github.com/BookCatKid/TablissNG/commit/f4ead5096419e04dc61edbe90e136961354594bd)
- Random Messages Widget #405 [3fdba86](https://github.com/BookCatKid/TablissNG/commit/3fdba8652b8b1a8c9c369988e60b5698f4dbe204)
- Based on: Disable user-select on widgets #696 [d9ae2fc](https://github.com/BookCatKid/TablissNG/commit/d9ae2fcf4a35b8ed0d632edaa81ac682fa115b9e)
- Custom Icons from iconify! [346a8df](https://github.com/BookCatKid/TablissNG/commit/346a8df458d45e65d7e2ac4f476b2148b91db998)
- Switch to @iconify/react for a bunch of imports [237afd0](https://github.com/BookCatKid/TablissNG/commit/237afd0db36f1210eaaabf8aa7b94f85ebea94d0)
- Cache the html to prevent flickering [a8215ec](https://github.com/BookCatKid/TablissNG/commit/a8215ece3321a0555dce3435e8c10143857f06fd)
- Option of seeing the regressive percentage #728 [dadf3e2](https://github.com/BookCatKid/TablissNG/commit/dadf3e2caaa9e558724877d4d806079fec033525)
- [Feature request] Make the unsplash photo location text a link #289 [1c93190](https://github.com/BookCatKid/TablissNG/commit/1c93190c1b5281ea940122210b1e58153d4ae923)
- Do not disable the Custom CSS widget when hiding all widgets #242 [18aedf3](https://github.com/BookCatKid/TablissNG/commit/18aedf3f8191f76b7d4663373fb53f24d613d251)
- [Feature request] Binary Clock #229 [04426fe](https://github.com/BookCatKid/TablissNG/commit/04426fe956274f308165ebd3aa1f8f9e7f93afaa)
- Update deps, add lint and prettier script [58ed6a5](https://github.com/BookCatKid/TablissNG/commit/58ed6a5c6d320b653131ddce05067254c72c846d)
- Local photo list should be collapsible. #136 [5e1137e](https://github.com/BookCatKid/TablissNG/commit/5e1137e40e19921548d646d92dc31f1ace623308)
- Fix paths in compiled web app [65c1e0e](https://github.com/BookCatKid/TablissNG/commit/65c1e0e6dabbc5aade348d89dac395b74d369bf8)
- PARTLY CLOSES: Load videos, gifs and entire websites as background #35 [a46feaa](https://github.com/BookCatKid/TablissNG/commit/a46feaa26cac36dfdfa4b88ca59cf29c85eab63e)
- Make the bookmarks permission optional [d6a303a](https://github.com/BookCatKid/TablissNG/commit/d6a303a71daad9ae75f80659cdbf562a9f87d0d6)
- Make the copyright part of the apod background aligned to the left to use less space [bd5c23e](https://github.com/BookCatKid/TablissNG/commit/bd5c23ef5d717366e32b2571a004ab7cba77a6b3)
- Update package.json and both manifest.json [e4f51dd](https://github.com/BookCatKid/TablissNG/commit/e4f51dd6f729efc88ead86b7de594b997295be9e)

### Fixed

- Fixed a major bug. (Communal Settings) [dd78d21](https://github.com/BookCatKid/TablissNG/commit/dd78d21ac56e5a414d71f68d39111502edc3a02c)
- [BUGFIX] add 'cross-env' to package.json #573 [65ad6be](https://github.com/BookCatKid/TablissNG/commit/65ad6be1bde438dcaf6ad2df276d7406b5704b9c)

### Removed

- Removed unused import [bc19ff8](https://github.com/BookCatKid/TablissNG/commit/bc19ff8201a3c6a39c73d9e336fe6f0ae13df5d8)
- Removed debug statement [90b3232](https://github.com/BookCatKid/TablissNG/commit/90b32327b095843dad314330ad7101a119bd1a7f)
- Removed debug log [3aeca63](https://github.com/BookCatKid/TablissNG/commit/3aeca63b80dd2c3c49a45e7adf84dc37ebb43aa0)
- Removed sentry integration [065940e](https://github.com/BookCatKid/TablissNG/commit/065940e733f45b7473e4c635c14af33f2356beff)
- Remove @sentry/browser [a7d9358](https://github.com/BookCatKid/TablissNG/commit/a7d93582b6b33f6a10c99b26ebd5e3977dff349a)

## [1.0.0] - 2/18/2025

### Initial Release, no changes!
