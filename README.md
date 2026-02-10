# CraftMine

A complete Minecraft clone in one HTML file. 46 blocks, 36 mobs, 19 weapons, 5 biomes, caves, day/night cycle. Zero build tools. AI-generated.

**[Play Now](https://tront.xyz/craftmine/play/)** | **[Landing Page](https://tront.xyz/craftmine/)**

![CraftMine — snowy biome with trees at sunrise](screenshots/craftmine.png)

![CraftMine — mountain landscape](screenshots/craftmine-mountains.png)

![CraftMine — flying over snowy mountains](screenshots/craftmine-landscape.png)

## Stats

- **46 block types** — grass, stone, ores, TNT, plus 21 DOOM-themed hell blocks
- **36 mob types** — chickens to a 300 HP Titan boss that causes earthquakes
- **19 weapons** — diamond sword, shotgun, railgun, BFG 9000, black hole gun, nuke launcher
- **5 biomes** — plains, desert, snow, forest, ocean
- **16x16x128 chunks** with web worker mesh generation
- **1 file**, 0 build steps, ~350KB

## Controls

| Action | Key |
|--------|-----|
| Move | W A S D |
| Jump | Space |
| Sneak | Shift |
| Look | Mouse |
| Break / Shoot | Left Click |
| Place block | Right Click |
| Switch weapon | Scroll |
| Pause | Esc |
| Toggle Creative | In pause menu |

## Tech

- Single HTML file with `<script type="module">`
- Three.js from CDN (only external dependency)
- 6 simplex noise generators for terrain, caves, ores, biomes
- Web worker thread pool for async chunk mesh generation
- Procedural mob AI with day/night spawn cycles
- Hitscan + projectile weapon systems with proper ballistics

## License

MIT

## Author

[Trent Sterling](https://tront.xyz) ([@Trent_Sterling](https://twitter.com/Trent_Sterling))
